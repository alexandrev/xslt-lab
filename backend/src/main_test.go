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
	"github.com/prometheus/client_golang/prometheus/testutil"
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

func TestClassifyTransformError(t *testing.T) {
	cases := []struct {
		name      string
		msg       string
		wantClass string
		wantCode  string
	}{
		// Saxon (XSLT 2.0/3.0)
		{"saxon code", "XPST0017: function foo#1 is not defined", "stylesheet", "XPST0017"},
		{"saxon prolog", "org.xml.sax.SAXParseException: Content is not allowed in prolog", "input_xml", "PARSE"},
		{"saxon sxxp", "SXXP0003 error reported by XML parser", "input_xml", "SXXP0003"},
		// XSLT 1.0 (JAXP/Xalan) — previously all fell into "other"
		{"xalan premature eof", "javax.xml.transform.TransformerException: Premature end of file.", "input_xml", "PARSE"},
		{"xalan unterminated tag", `The element type "a" must be terminated by the matching end-tag "</a>".`, "input_xml", "PARSE"},
		{"xalan entity", `The reference to entity "f" must end with the ';' delimiter.`, "input_xml", "PARSE"},
		{"xalan structures", "XML document structures must start and end within the same entity.", "input_xml", "PARSE"},
		{"xalan otherwise", "line 208: <xsl:otherwise> can only be used within <xsl:choose>.", "stylesheet", "COMPILE"},
		{"xalan missing attr", "line 145: Required attribute 'test' is missing.", "stylesheet", "COMPILE"},
		{"xalan illegal attr", "line 242: Illegal attribute 'select'.", "stylesheet", "COMPILE"},
		{"xalan 2.0 fn in 1.0", "Error checking type of the expression 'funcall(current-date, [])'.", "stylesheet", "COMPILE"},
		{"truly unknown", "some unexpected failure", "other", "OTHER"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			code, class := classifyTransformError(c.msg)
			if class != c.wantClass {
				t.Errorf("class = %q, want %q", class, c.wantClass)
			}
			if code != c.wantCode {
				t.Errorf("code = %q, want %q", code, c.wantCode)
			}
		})
	}
}

func TestLogTransformErrorIncrementsCounter(t *testing.T) {
	req := TransformRequest{XSLT: "<xsl:stylesheet/>"}
	m := transformErrorsTotal.WithLabelValues("stylesheet", "XPST0017", normalizeVersion("2.0"))
	before := testutil.ToFloat64(m)
	logTransformError("", "2.0", "XPST0017: function foo#1 is not defined", req, "", "key")
	if got := testutil.ToFloat64(m) - before; got != 1 {
		t.Fatalf("counter delta = %v, want 1", got)
	}
	// backend override should count under class="backend"
	mb := transformErrorsTotal.WithLabelValues("backend", "OTHER", normalizeVersion("2.0"))
	b := testutil.ToFloat64(mb)
	logTransformError("backend", "2.0", "daemon unavailable", req, "", "key")
	if got := testutil.ToFloat64(mb) - b; got != 1 {
		t.Fatalf("backend counter delta = %v, want 1", got)
	}
}
