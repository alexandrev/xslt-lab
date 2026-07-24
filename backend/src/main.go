// xslt-playground-backend/main.go
package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"html"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
	"gorm.io/datatypes"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type TransformRequest struct {
	XSLT       string            `json:"xslt"`
	Version    string            `json:"version"`
	Parameters map[string]string `json:"parameters"`
	Trace      bool              `json:"trace"`
}

type TransformResponse struct {
	Result           string            `json:"result"`
	DurationMs       int64             `json:"duration_ms"`
	Trace            []TraceEntry      `json:"trace,omitempty"`
	TraceText        string            `json:"trace_text,omitempty"`
	SecondaryResults map[string]string `json:"secondary_results,omitempty"`
}

type TraceEntry struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type AppConfig struct {
	Port                string `json:"port"`
	SaxonClasspath      string `json:"saxon_classpath"`
	DatabaseURL         string `json:"database_url"`
	FirebaseCredentials string `json:"firebase_credentials"`
}

type Transformation struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     string         `json:"user_id"`
	XSLT       string         `json:"xslt"`
	Parameters datatypes.JSON `json:"parameters"`
	Note       string         `json:"note"`
	CreatedAt  time.Time      `json:"created_at"`
}

// decodeSourceXML returns the source document as valid XML. HTML-encoded XML
// (e.g. submitted from a form field, starting with "&lt;") is unescaped; XML
// that is already well-formed is left untouched — calling html.UnescapeString
// on it would turn "&amp;" into a bare "&" and break parsing.
func decodeSourceXML(val string) string {
	trimmed := strings.TrimSpace(val)
	if strings.HasPrefix(trimmed, "&lt;") {
		return html.UnescapeString(trimmed)
	}
	return trimmed
}

func pickSourceXML(params map[string]string) (string, string) {
	looksLikeXML := func(s string) bool {
		trimmed := strings.TrimSpace(s)
		return strings.HasPrefix(trimmed, "<") || strings.HasPrefix(trimmed, "&lt;")
	}

	preferred := []string{"input", "source", "xml", "document", "input1"}
	for _, key := range preferred {
		if val, ok := params[key]; ok && looksLikeXML(val) {
			return decodeSourceXML(val), key
		}
	}
	for key, val := range params {
		if looksLikeXML(val) {
			return decodeSourceXML(val), key
		}
	}
	return "", ""
}

// --- Structured error logging -------------------------------------------
// Every failed transformation emits one JSON line ("event":"transform_error")
// to stdout. Promtail ships it to Loki, so failures can be reviewed in
// Grafana and reproduced with one click via repro_url (same base64url share
// format the frontend already parses: ?xslt=…&xml=…&version=…).

var saxonErrorCodeRe = regexp.MustCompile(`\b[A-Z]{4}[0-9]{4}\b`)

const (
	errLogFieldMax     = 48_000 // per-field cap before base64 (Loki line limit safety)
	errLogReproURLMax  = 30_000 // xslt+source above this → URL too long to be useful
	errLogMessageMax   = 4_000
	errLogPublicOrigin = "https://xsltplayground.com"
)

func truncateForLog(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}

func b64url(s string) string {
	return base64.RawURLEncoding.EncodeToString([]byte(s))
}

// classifyTransformError buckets an error so review can focus on likely bugs:
// input_xml (user data not well-formed), stylesheet (user XSLT invalid) or
// other. Backend-side failures are logged with class "backend" explicitly.
func classifyTransformError(msg string) (code, class string) {
	code = saxonErrorCodeRe.FindString(msg)
	lower := strings.ToLower(msg)

	// XML well-formedness failures. Saxon raises SAXParseException; the JDK's
	// JAXP/Xalan parser (used for XSLT 1.0) reports the same problems as prose.
	xmlNotWellFormed := []string{
		"saxparseexception",
		"not allowed in prolog",
		"entity name must immediately follow",
		"following the root element",
		"premature end of file",
		"must be terminated by the matching end-tag",
		"must start and end within the same entity",
		"the reference to entity",
		"the markup in the document",
		"content of elements must consist",
		"must be followed by either attribute",
	}
	// Stylesheet-authoring failures. Saxon reports many of these without a code
	// prefix; Xalan/JAXP (XSLT 1.0) reports undefined functions, misplaced
	// elements, illegal attributes and type errors as plain text.
	stylesheetAuthoring := []string{
		"compilation", "static error", "is not bound", "not a stylesheet",
		"initial-template",
		"can only be used within",
		"required attribute", "illegal attribute",
		"could not find function", "funcall(",
		"cannot convert data-type",
		"error checking type of the expression",
		"transformerconfigurationexception",
	}

	switch {
	case code == "SXXP0003" || containsAny(lower, xmlNotWellFormed):
		class = "input_xml"
		if code == "" {
			code = "PARSE"
		}
	case code != "":
		class = "stylesheet"
	case containsAny(lower, stylesheetAuthoring):
		class = "stylesheet"
		if code == "" {
			code = "COMPILE"
		}
	default:
		class = "other"
		code = "OTHER"
	}
	return code, class
}

func containsAny(s string, subs []string) bool {
	for _, sub := range subs {
		if strings.Contains(s, sub) {
			return true
		}
	}
	return false
}

func logTransformError(classOverride, version, errMsg string, req TransformRequest, sourceXML, sourceKey string) {
	code, class := classifyTransformError(errMsg)
	if classOverride != "" {
		class = classOverride
	}
	transformErrorsTotal.WithLabelValues(class, code, normalizeVersion(version)).Inc()
	entry := map[string]interface{}{
		"event":      "transform_error",
		"class":      class,
		"error_code": code,
		"version":    version,
		"error":      truncateForLog(errMsg, errLogMessageMax),
		"source_key": sourceKey,
		"trace":      req.Trace,
		"xslt_b64":   b64url(truncateForLog(req.XSLT, errLogFieldMax)),
	}
	if paramsJSON, err := json.Marshal(req.Parameters); err == nil {
		entry["params_b64"] = b64url(truncateForLog(string(paramsJSON), errLogFieldMax))
	}
	if len(req.XSLT)+len(sourceXML) <= errLogReproURLMax {
		u := errLogPublicOrigin + "/?version=" + version +
			"&title=" + b64url("Error repro "+code) +
			"&xslt=" + b64url(req.XSLT)
		if sourceXML != "" {
			u += "&xml=" + b64url(sourceXML)
		}
		entry["repro_url"] = u
	}
	// Write the raw JSON line (no log.Println timestamp prefix) so Loki's
	// `| json` parser can consume it directly.
	if line, err := json.Marshal(entry); err == nil {
		os.Stdout.Write(append(line, '\n'))
	}
}

func loadConfig(filename string) (*AppConfig, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var config AppConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}
	if v := os.Getenv("DATABASE_URL"); v != "" {
		config.DatabaseURL = v
	}
	if v := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); v != "" {
		config.FirebaseCredentials = v
	}
	if v := os.Getenv("SAXON_CLASSPATH"); v != "" {
		config.SaxonClasspath = v
	}
	return &config, nil
}

func authMiddleware(client *auth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization"})
			return
		}
		tokenStr := strings.TrimPrefix(header, "Bearer ")
		tok, err := client.VerifyIDToken(c, tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("uid", tok.UID)
		if email, ok := tok.Claims["email"].(string); ok {
			c.Set("email", email)
		}
		c.Next()
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func main() {
	config, err := loadConfig("app.config")
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	goPro := strings.ToLower(os.Getenv("VITE_GO_PRO")) == "true"

	var (
		authClient *auth.Client
		db         *gorm.DB
	)

	if goPro {
		ctx := context.Background()
		var fbOpt option.ClientOption
		if config.FirebaseCredentials != "" {
			fbOpt = option.WithCredentialsFile(config.FirebaseCredentials)
		}
		fbApp, err := firebase.NewApp(ctx, nil, fbOpt)
		if err != nil {
			log.Fatalf("firebase init: %v", err)
		}
		authClient, err = fbApp.Auth(ctx)
		if err != nil {
			log.Fatalf("auth client: %v", err)
		}

		db, err = gorm.Open(postgres.Open(config.DatabaseURL), &gorm.Config{})
		if err != nil {
			log.Fatalf("db connect: %v", err)
		}
		if err := db.AutoMigrate(&Transformation{}); err != nil {
			log.Fatalf("auto migrate: %v", err)
		}
	}

	metricsPort := os.Getenv("METRICS_PORT")
	if metricsPort == "" {
		metricsPort = "9100"
	}
	go startMetricsServer(metricsPort)

	r := gin.Default()
	r.Use(metricsMiddleware())
	r.Use(corsMiddleware())

	r.POST("/transform", func(c *gin.Context) {
		var req TransformRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			transformationsTotal.WithLabelValues("unknown", "bad_request").Inc()
			log.Printf("bind request failed: %v (content-length=%d)", err, c.Request.ContentLength)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		version := normalizeVersion(req.Version)
		if req.Version != "" && version == "invalid" {
			transformationsTotal.WithLabelValues("invalid", "bad_request").Inc()
			c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported XSLT version: must be 1.0, 2.0 or 3.0"})
			return
		}
		transformationPayloadBytes.WithLabelValues(version).Observe(float64(len(req.XSLT)))
		if req.Trace {
			traceRequestsTotal.Inc()
		}
		log.Printf("processing transform: xslt %d bytes, %d parameters", len(req.XSLT), len(req.Parameters))

		sourceXML, sourceKey := pickSourceXML(req.Parameters)
		if sourceKey != "" {
			log.Printf("using parameter %q as source document", sourceKey)
		}

		// Split params: XML values go as fileParameters (passed inline), rest as string parameters
		stringParams := make(map[string]string)
		fileParams := make(map[string]string)
		for k, v := range req.Parameters {
			if k == sourceKey {
				continue
			}
			trimmed := strings.TrimSpace(v)
			if strings.HasPrefix(trimmed, "&lt;") {
				// HTML-encoded XML (e.g. sent from a form field): decode first
				fileParams[k] = html.UnescapeString(trimmed)
			} else if strings.HasPrefix(trimmed, "<") {
				// Already valid XML — do NOT call html.UnescapeString or it will
				// convert &amp; → & and break well-formed entity references
				fileParams[k] = trimmed
			} else {
				stringParams[k] = v
			}
		}

		daemonReq := map[string]interface{}{
			"xslt":           req.XSLT,
			"source":         sourceXML,
			"parameters":     stringParams,
			"fileParameters": fileParams,
			"trace":          req.Trace,
		}
		daemonBody, err := json.Marshal(daemonReq)
		if err != nil {
			transformationsTotal.WithLabelValues(version, "error").Inc()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot encode request"})
			return
		}

		daemonPort := "8081" // Saxon 12 — XSLT 3.0 (default)
		switch req.Version {
		case "1.0":
			daemonPort = "8082" // XSLTC (JDK) — true XSLT 1.0
		case "2.0":
			daemonPort = "8083" // Saxon 9 — true XSLT 2.0
		}

		start := time.Now()
		httpClient := &http.Client{Timeout: 10 * time.Second}
		resp, err := httpClient.Post(
			"http://127.0.0.1:"+daemonPort+"/transform",
			"application/json",
			bytes.NewReader(daemonBody),
		)
		if err != nil {
			transformationsTotal.WithLabelValues(version, "unavailable").Inc()
			log.Printf("daemon call failed: %v", err)
			logTransformError("backend", version, "daemon unavailable: "+err.Error(), req, sourceXML, sourceKey)
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "transform service unavailable"})
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			transformationsTotal.WithLabelValues(version, "error").Inc()
			logTransformError("backend", version, "cannot read daemon response: "+err.Error(), req, sourceXML, sourceKey)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot read daemon response"})
			return
		}
		elapsed := time.Since(start)
		transformationDuration.WithLabelValues(version).Observe(elapsed.Seconds())
		duration := elapsed.Milliseconds()

		var daemonResp struct {
			Result           string            `json:"result"`
			TraceText        string            `json:"traceText"`
			Error            string            `json:"error"`
			SecondaryResults map[string]string `json:"secondaryResults"`
		}
		if err := json.Unmarshal(respBody, &daemonResp); err != nil {
			transformationsTotal.WithLabelValues(version, "error").Inc()
			logTransformError("backend", version, "cannot parse daemon response: "+truncateForLog(string(respBody), 500), req, sourceXML, sourceKey)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot parse daemon response"})
			return
		}

		if daemonResp.Error != "" {
			transformationsTotal.WithLabelValues(version, "error").Inc()
			log.Printf("transform error after %dms: %s", duration, daemonResp.Error)
			logTransformError("", version, daemonResp.Error, req, sourceXML, sourceKey)
			c.JSON(http.StatusBadRequest, gin.H{"error": daemonResp.Error})
			return
		}

		log.Printf("transformation done in %dms", duration)

		var traceEntries []TraceEntry
		traceText := daemonResp.TraceText
		if req.Trace && traceText != "" {
			log.Printf("trace size=%d bytes", len(traceText))
			lines := strings.Split(traceText, "\n")
			filtered := make([]string, 0, len(lines))
			capturing := false
			var currName string
			var buf []string
			for _, l := range lines {
				if strings.HasPrefix(l, "TRACE_DEBUG") {
					continue
				}
				filtered = append(filtered, l)
				if strings.HasPrefix(l, "TRACE_VAR_START|") {
					capturing = true
					currName = strings.TrimPrefix(l, "TRACE_VAR_START|")
					buf = nil
					continue
				}
				if strings.HasPrefix(l, "TRACE_VAR_END") {
					if capturing {
						traceEntries = append(traceEntries, TraceEntry{Name: currName, Value: strings.Join(buf, "\n")})
					}
					capturing = false
					currName = ""
					buf = nil
					continue
				}
				if capturing {
					buf = append(buf, l)
					continue
				}
				if strings.HasPrefix(l, "TRACE_VAR|") {
					parts := strings.SplitN(l, "|", 3)
					if len(parts) == 3 {
						traceEntries = append(traceEntries, TraceEntry{Name: parts[1], Value: parts[2]})
					}
				}
			}
			traceText = strings.Join(filtered, "\n")
		}

		transformationsTotal.WithLabelValues(version, "success").Inc()

		c.JSON(http.StatusOK, TransformResponse{
			Result:           daemonResp.Result,
			DurationMs:       duration,
			Trace:            traceEntries,
			TraceText:        traceText,
			SecondaryResults: daemonResp.SecondaryResults,
		})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	if goPro {
		authRoutes := r.Group("/history").Use(authMiddleware(authClient))
		authRoutes.GET("", func(c *gin.Context) {
			uid := c.GetString("uid")
			var recs []Transformation
			if err := db.Where("user_id = ?", uid).Order("created_at desc").Find(&recs).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			c.JSON(http.StatusOK, recs)
		})

		authRoutes.POST("", func(c *gin.Context) {
			uid := c.GetString("uid")
			var req struct {
				XSLT       string            `json:"xslt"`
				Parameters map[string]string `json:"parameters"`
				Note       string            `json:"note"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			paramJSON, _ := json.Marshal(req.Parameters)
			rec := Transformation{UserID: uid, XSLT: req.XSLT, Parameters: datatypes.JSON(paramJSON), Note: req.Note}
			if err := db.Create(&rec).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			c.JSON(http.StatusOK, rec)
		})

		authRoutes.DELETE(":id", func(c *gin.Context) {
			uid := c.GetString("uid")
			id := c.Param("id")
			res := db.Where("id = ? AND user_id = ?", id, uid).Delete(&Transformation{})
			if res.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			if res.RowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
				return
			}
			c.Status(http.StatusNoContent)
		})
	}

	r.Run(":" + config.Port)
}
