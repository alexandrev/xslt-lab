// xslt-playground-backend/main.go
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"html"
	"io"
	"log"
	"net/http"
	"os"
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
	Result     string       `json:"result"`
	DurationMs int64        `json:"duration_ms"`
	Trace      []TraceEntry `json:"trace,omitempty"`
	TraceText  string       `json:"trace_text,omitempty"`
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

func pickSourceXML(params map[string]string) (string, string) {
	looksLikeXML := func(s string) bool {
		trimmed := strings.TrimSpace(s)
		return strings.HasPrefix(trimmed, "<") || strings.HasPrefix(trimmed, "&lt;")
	}

	preferred := []string{"input", "source", "xml", "document", "input1"}
	for _, key := range preferred {
		if val, ok := params[key]; ok && looksLikeXML(val) {
			return html.UnescapeString(strings.TrimSpace(val)), key
		}
	}
	for key, val := range params {
		if looksLikeXML(val) {
			return html.UnescapeString(strings.TrimSpace(val)), key
		}
	}
	return "<root/>", ""
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

	r := gin.Default()
	r.Use(corsMiddleware())

	r.POST("/transform", func(c *gin.Context) {
		var req TransformRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("bind request failed: %v (content-length=%d)", err, c.Request.ContentLength)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Version != "" && req.Version != "1.0" && req.Version != "2.0" && req.Version != "3.0" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported XSLT version: must be 1.0, 2.0 or 3.0"})
			return
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
			if strings.HasPrefix(trimmed, "&lt;") || strings.HasPrefix(trimmed, "<") {
				fileParams[k] = html.UnescapeString(trimmed)
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot encode request"})
			return
		}

		start := time.Now()
		httpClient := &http.Client{Timeout: 10 * time.Second}
		resp, err := httpClient.Post(
			"http://127.0.0.1:8081/transform",
			"application/json",
			bytes.NewReader(daemonBody),
		)
		if err != nil {
			log.Printf("daemon call failed: %v", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "transform service unavailable"})
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot read daemon response"})
			return
		}
		duration := time.Since(start).Milliseconds()

		var daemonResp struct {
			Result    string `json:"result"`
			TraceText string `json:"traceText"`
			Error     string `json:"error"`
		}
		if err := json.Unmarshal(respBody, &daemonResp); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot parse daemon response"})
			return
		}

		if daemonResp.Error != "" {
			log.Printf("saxon error after %dms: %s", duration, daemonResp.Error)
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

		c.JSON(http.StatusOK, TransformResponse{Result: daemonResp.Result, DurationMs: duration, Trace: traceEntries, TraceText: traceText})
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
