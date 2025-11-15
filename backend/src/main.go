// xslt-playground-backend/main.go
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
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
		log.Printf("processing transform: xslt %d bytes, %d parameters", len(req.XSLT), len(req.Parameters))

		tmpDir, err := ioutil.TempDir("", "xslt")
		if err != nil {
			log.Printf("temp dir creation failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create temp dir"})
			return
		}
		defer os.RemoveAll(tmpDir)

		xsltPath := filepath.Join(tmpDir, "transform.xsl")
		inputPath := filepath.Join(tmpDir, "input.xml")
		outputPath := filepath.Join(tmpDir, "result.xml")

		if err := os.WriteFile(xsltPath, []byte(req.XSLT), 0644); err != nil {
			log.Printf("write xslt failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot write xslt"})
			return
		}

		if err := os.WriteFile(inputPath, []byte("<root/>"), 0644); err != nil {
			log.Printf("write input failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot write input"})
			return
		}

		argsPath := filepath.Join(tmpDir, "args")
		var cmdArgs []string
		cmdArgs = append(cmdArgs,
			"-cp",
			config.SaxonClasspath,
			"com.xsltplayground.Runner",
			"-s:"+inputPath,
			"-xsl:"+xsltPath,
			"-o:"+outputPath,
		)

		var tracePath string
		if req.Trace {
			// Enable Runner instrumentation and capture trace output
			cmdArgs = append(cmdArgs, "-trace")
			// Provide a trace output file to capture Saxon messages
			tracePath = filepath.Join(tmpDir, "trace.log")
			cmdArgs = append(cmdArgs, "-traceout:"+tracePath)
			// Also enable Saxon CLI tracing flag for richer diagnostics
			cmdArgs = append(cmdArgs, "-T")
		}

		log.Printf("+++++++++++++ msg %s", strings.Join(cmdArgs, "\n"))

		idx := 0
		for k, v := range req.Parameters {
			paramFile := filepath.Join(tmpDir, fmt.Sprintf("param_%d", idx))
			if err := os.WriteFile(paramFile, []byte(v), 0644); err != nil {
				log.Printf("write parameter %s failed: %v", k, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot write parameter"})
				return
			}
			// Heuristic check: if value looks like XML (starts with '<' and ends with '>'), treat it as file-based
			trimmed := strings.TrimSpace(v)
			if strings.HasPrefix(trimmed, "&lt;") || strings.HasPrefix(trimmed, "<") {
				cmdArgs = append(cmdArgs, fmt.Sprintf("+%s=%s", k, paramFile))
			} else {
				cmdArgs = append(cmdArgs, fmt.Sprintf("%s=%s", k, v))
			}
			idx++
		}

		if err := os.WriteFile(argsPath, []byte(strings.Join(cmdArgs, "\n")), 0644); err != nil {
			log.Printf("write args file failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot write args"})
			return
		}

		log.Printf("+++++++++++++ msg %s", strings.Join(cmdArgs, "\n"))

		cmd := exec.Command("java", "@"+argsPath)
		var stderr bytes.Buffer
		cmd.Stderr = &stderr
		start := time.Now()

		timeout := time.Second * 10
		errChan := make(chan error, 1)
		go func() { errChan <- cmd.Run() }()

		select {
		case err := <-errChan:
			if err != nil {
				log.Printf("saxon error: %v; stderr: %s", err, stderr.String())
				c.JSON(http.StatusBadRequest, gin.H{"error": stderr.String()})
				return
			}
		case <-time.After(timeout):
			cmd.Process.Kill()
			log.Printf("saxon timeout after %v", timeout)
			c.JSON(http.StatusRequestTimeout, gin.H{"error": "transformation timeout"})
			return
		}

		result, err := os.ReadFile(outputPath)
		if err != nil {
			log.Printf("read result failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot read result"})
			return
		}

		duration := time.Since(start).Milliseconds()
		log.Printf("transformation done in %dms", duration)

		var traceEntries []TraceEntry
		var traceText string
		if req.Trace {
			// Load trace text from file (preferred) or stderr
			if tracePath != "" {
				if data, err := os.ReadFile(tracePath); err == nil {
					traceText = string(data)
					log.Printf("trace file %s size=%d bytes", tracePath, len(traceText))
				} else {
					log.Printf("trace read error: %v", err)
				}
			}
			if traceText == "" {
				traceText = stderr.String()
				if traceText != "" {
					log.Printf("trace fallback from stderr size=%d bytes", len(traceText))
				}
			}

			// Parse block-based variable traces and legacy single-line ones
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
						value := strings.Join(buf, "\n")
						traceEntries = append(traceEntries, TraceEntry{Name: currName, Value: value})
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

		c.JSON(http.StatusOK, TransformResponse{Result: string(result), DurationMs: duration, Trace: traceEntries, TraceText: traceText})
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
