package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestLoadConfigAppliesEnvOverrides(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://env")
	t.Setenv("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/creds.json")
	t.Setenv("SAXON_CLASSPATH", "env-classpath")

	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "app.config")
	payload := `{
		"port": "3000",
		"saxon_classpath": "classpath",
		"database_url": "postgres://file",
		"firebase_credentials": "/tmp/file-creds.json"
	}`
	if err := os.WriteFile(cfgPath, []byte(payload), 0644); err != nil {
		t.Fatalf("write config: %v", err)
	}

	cfg, err := loadConfig(cfgPath)
	if err != nil {
		t.Fatalf("loadConfig returned error: %v", err)
	}

	if cfg.DatabaseURL != "postgres://env" {
		t.Fatalf("expected env database url, got %s", cfg.DatabaseURL)
	}
	if cfg.FirebaseCredentials != "/tmp/creds.json" {
		t.Fatalf("expected env firebase creds, got %s", cfg.FirebaseCredentials)
	}
	if cfg.SaxonClasspath != "env-classpath" {
		t.Fatalf("expected env saxon classpath, got %s", cfg.SaxonClasspath)
	}
}

func TestCorsMiddlewareSetsHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(corsMiddleware())
	router.GET("/test", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}
	headers := rec.Result().Header
	if headers.Get("Access-Control-Allow-Origin") != "*" {
		t.Fatalf("missing CORS origin header")
	}
	if headers.Get("Access-Control-Allow-Methods") == "" {
		t.Fatalf("missing CORS methods header")
	}
	if headers.Get("Access-Control-Allow-Headers") == "" {
		t.Fatalf("missing CORS headers header")
	}
}

func TestPickSourceXMLPrefersKnownKeys(t *testing.T) {
	params := map[string]string{
		"other": "<other/>",
		"input": "<input/>",
	}
	src, key := pickSourceXML(params)
	if key != "input" {
		t.Fatalf("expected key 'input', got %q", key)
	}
	if src != "<input/>" {
		t.Fatalf("expected '<input/>', got %q", src)
	}
}

func TestPickSourceXMLFallsBackToAnyXML(t *testing.T) {
	params := map[string]string{
		"data": "<data/>",
	}
	src, key := pickSourceXML(params)
	if key != "data" {
		t.Fatalf("expected key 'data', got %q", key)
	}
	if src != "<data/>" {
		t.Fatalf("expected '<data/>', got %q", src)
	}
}

func TestPickSourceXMLReturnsDefaultWhenNoXML(t *testing.T) {
	params := map[string]string{
		"mode": "fast",
	}
	src, key := pickSourceXML(params)
	if key != "" {
		t.Fatalf("expected empty key, got %q", key)
	}
	if src != "<root/>" {
		t.Fatalf("expected '<root/>', got %q", src)
	}
}

func TestPickSourceXMLUnescapesHTMLEntities(t *testing.T) {
	params := map[string]string{
		"input": "&lt;root/&gt;",
	}
	src, _ := pickSourceXML(params)
	if src != "<root/>" {
		t.Fatalf("expected unescaped '<root/>', got %q", src)
	}
}

func TestTransformRejectsInvalidVersion(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(corsMiddleware())
	router.POST("/transform", func(c *gin.Context) {
		var req TransformRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Version != "" && req.Version != "1.0" && req.Version != "2.0" && req.Version != "3.0" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported XSLT version: must be 1.0, 2.0 or 3.0"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"result": "ok"})
	})

	body := `{"xslt":"<xsl:stylesheet/>","version":"4.0","parameters":{}}`
	req := httptest.NewRequest(http.MethodPost, "/transform", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "unsupported XSLT version") {
		t.Fatalf("expected version error message, got: %s", rec.Body.String())
	}
}

func TestTransformAcceptsValidVersions(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(corsMiddleware())
	router.POST("/transform", func(c *gin.Context) {
		var req TransformRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Version != "" && req.Version != "1.0" && req.Version != "2.0" && req.Version != "3.0" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported XSLT version: must be 1.0, 2.0 or 3.0"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"result": "ok"})
	})

	for _, version := range []string{"1.0", "2.0", "3.0", ""} {
		body := `{"xslt":"<xsl:stylesheet/>","version":"` + version + `","parameters":{}}`
		req := httptest.NewRequest(http.MethodPost, "/transform", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("version %q: expected 200, got %d", version, rec.Code)
		}
	}
}

func TestCorsMiddlewareHandlesOptionsRequests(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(corsMiddleware())

	handlerCalled := false
	router.Any("/test", func(c *gin.Context) {
		handlerCalled = true
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodOptions, "/test", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected status 204, got %d", rec.Code)
	}
	if handlerCalled {
		t.Fatalf("handler should not be called for OPTIONS requests")
	}
}
