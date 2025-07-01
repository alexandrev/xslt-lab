// xslt-playground-backend/main.go
package main

import (
	"bytes"
	"context"
	"encoding/json"
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
}

type TransformResponse struct {
	Result     string `json:"result"`
	DurationMs int64  `json:"duration_ms"`
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

	ctx := context.Background()
	var fbOpt option.ClientOption
	if config.FirebaseCredentials != "" {
		fbOpt = option.WithCredentialsFile(config.FirebaseCredentials)
	}
	fbApp, err := firebase.NewApp(ctx, nil, fbOpt)
	if err != nil {
		log.Fatalf("firebase init: %v", err)
	}
	authClient, err := fbApp.Auth(ctx)
	if err != nil {
		log.Fatalf("auth client: %v", err)
	}

	db, err := gorm.Open(postgres.Open(config.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	if err := db.AutoMigrate(&Transformation{}); err != nil {
		log.Fatalf("auto migrate: %v", err)
	}

	r := gin.Default()
	r.Use(corsMiddleware())

	r.POST("/transform", func(c *gin.Context) {
		var req TransformRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		tmpDir, err := ioutil.TempDir("", "xslt")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create temp dir"})
			return
		}
		defer os.RemoveAll(tmpDir)

		xsltPath := filepath.Join(tmpDir, "transform.xsl")
		inputPath := filepath.Join(tmpDir, "input.xml")
		outputPath := filepath.Join(tmpDir, "result.xml")

		if err := os.WriteFile(xsltPath, []byte(req.XSLT), 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot write xslt"})
			return
		}

		if err := os.WriteFile(inputPath, []byte("<root/>"), 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot write input"})
			return
		}

		cmdArgs := []string{
			"-cp", config.SaxonClasspath,
			"net.sf.saxon.Transform",
			"-s:" + inputPath,
			"-xsl:" + xsltPath,
			"-o:" + outputPath,
		}
		for k, v := range req.Parameters {
			cmdArgs = append(cmdArgs, k+"='"+v+"'")
		}

		cmd := exec.Command("java", cmdArgs...)
		var stderr bytes.Buffer
		cmd.Stderr = &stderr
		start := time.Now()

		timeout := time.Second * 10
		errChan := make(chan error, 1)
		go func() { errChan <- cmd.Run() }()

		select {
		case err := <-errChan:
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": stderr.String()})
				return
			}
		case <-time.After(timeout):
			cmd.Process.Kill()
			c.JSON(http.StatusRequestTimeout, gin.H{"error": "transformation timeout"})
			return
		}

		result, err := os.ReadFile(outputPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot read result"})
			return
		}

		duration := time.Since(start).Milliseconds()
		c.JSON(http.StatusOK, TransformResponse{Result: string(result), DurationMs: duration})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

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

	r.Run(":" + config.Port)
}
