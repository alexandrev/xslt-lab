package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
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
