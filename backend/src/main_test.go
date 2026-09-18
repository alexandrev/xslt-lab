package main

import (
	"bytes"
	"encoding/json"
	"io"
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

// No source document is synthesised when the request carries no XML: since
// 2bd3e94 the source is left empty so Saxon can invoke xsl:initial-template.
func TestPickSourceXMLReturnsEmptyWhenNoXML(t *testing.T) {
	params := map[string]string{
		"mode": "fast",
	}
	src, key := pickSourceXML(params)
	if key != "" {
		t.Fatalf("expected empty key, got %q", key)
	}
	if src != "" {
		t.Fatalf("expected empty source, got %q", src)
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
		{"no source document", "Either a source document, an initial template or an initial function must be specified", "input_xml", "NO_SOURCE"},
		// Previously all of these fell into "other"; taken from production logs.
		{"multiply defined variable", "line 11: Variable 'DestinationCode' is multiply defined in the same scope.", "stylesheet", "COMPILE"},
		{"undefined variable", "line 42: Variable or parameter 'OriginCode' is undefined.", "stylesheet", "COMPILE"},
		{"format-number picture", "format-number picture: Passive character must not appear between active characters in a sub-picture", "stylesheet", "COMPILE"},
		{"missing java extension", "Cannot find external method 'com.example.util.DateUtil.now' (must be public).", "stylesheet", "COMPILE"},
		{"stray xml declaration", `The processing instruction target matching "[xX][mM][lL]" is not allowed.`, "input_xml", "PARSE"},
		// Second pass over "other", from the 2026-08-19 log review.
		{"xalan xpath syntax", `Syntax error in 'current()/..[@Name = 'Programming''.`, "stylesheet", "COMPILE"},
		{"not a stylesheet", "The supplied file does not appear to be a stylesheet", "stylesheet", "COMPILE"},
		{"misplaced xsl:import", "The xsl:import element children must precede all other element children of an xsl:stylesheet element, including any xsl:include element children.", "stylesheet", "COMPILE"},
		{"undeclared key", "Key 'person-key' has not been defined", "stylesheet", "COMPILE"},
		{"sequence where one item expected", `A sequence of more than one item is not allowed as the first argument of substring() ("a", "b", ...)`, "stylesheet", "COMPILE"},
		// A limit the service imposes — a bug candidate, not the user's mistake.
		{"xpath operator limit", "JAXP0801002: the compiler encountered an XPath expression containing '101' operators that exceeds the '100' limit set by 'FEATURE_SECURE_PROCESSING'.", "backend", "XPATH_OP_LIMIT"},
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
	logTransformError("", "2.0", "XPST0017: function foo#1 is not defined", req, "", "key", "203.0.113.7")
	if got := testutil.ToFloat64(m) - before; got != 1 {
		t.Fatalf("counter delta = %v, want 1", got)
	}
	// backend override should count under class="backend"
	mb := transformErrorsTotal.WithLabelValues("backend", "OTHER", normalizeVersion("2.0"))
	b := testutil.ToFloat64(mb)
	logTransformError("backend", "2.0", "daemon unavailable", req, "", "key", "203.0.113.7")
	if got := testutil.ToFloat64(mb) - b; got != 1 {
		t.Fatalf("backend counter delta = %v, want 1", got)
	}
}

// A log line above 16 KB is split by containerd and never reassembled, so it
// reaches Loki as fragments that `| json` cannot parse. On 2026-09-18 that was
// 92% of these lines. Whatever the stylesheet size, one parseable line has to
// come out, and it has to say which fields it had to drop.
func TestLogTransformErrorLineStaysParseable(t *testing.T) {
	huge := strings.Repeat("<xsl:template match='a'/>", 40_000) // ~1 MB
	req := TransformRequest{
		XSLT:       huge,
		Parameters: map[string]string{"input": huge},
	}

	stdout := os.Stdout
	r, w, err := os.Pipe()
	if err != nil {
		t.Fatalf("pipe: %v", err)
	}
	os.Stdout = w
	logTransformError("", "3.0", "XTSE0020: Invalid QName {}", req, huge, "input", "203.0.113.7")
	w.Close()
	os.Stdout = stdout

	line, err := io.ReadAll(r)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	if len(line) > errLogLineMax+1 { // +1 for the newline
		t.Fatalf("line is %d bytes, above the %d budget", len(line), errLogLineMax)
	}
	var entry map[string]interface{}
	if err := json.Unmarshal(line, &entry); err != nil {
		t.Fatalf("line does not parse as JSON, which is the whole point: %v", err)
	}
	// The fields that identify and classify the failure must survive; only the
	// payload is expendable.
	for _, key := range []string{"event", "class", "error_code", "version", "error", "client_ip"} {
		if _, ok := entry[key]; !ok {
			t.Errorf("%q was dropped, but it is what makes the line useful", key)
		}
	}
}

// The per-field caps handle the huge case on their own; the drop loop is for
// the awkward middle, where a stylesheet small enough to earn a repro URL still
// pushes the line over the budget once everything is base64.
func TestLogTransformErrorDropsFieldsAndSaysSo(t *testing.T) {
	body := strings.Repeat("<a/>", 700) // 2.8 KB: under errLogReproURLMax
	req := TransformRequest{
		XSLT:       body,
		Parameters: map[string]string{"input": body},
	}

	stdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	logTransformError("", "3.0", strings.Repeat("e", errLogMessageMax), req, body, "input", "203.0.113.7")
	w.Close()
	os.Stdout = stdout

	line, _ := io.ReadAll(r)
	if len(line) > errLogLineMax+1 {
		t.Fatalf("line is %d bytes, above the %d budget", len(line), errLogLineMax)
	}
	var entry map[string]interface{}
	if err := json.Unmarshal(line, &entry); err != nil {
		t.Fatalf("line does not parse as JSON: %v", err)
	}
	dropped, _ := entry["dropped"].(string)
	if dropped == "" {
		t.Fatal("expected this shape to trip the drop loop; if the budget changed, pick another size")
	}
	// Least useful first: params before the stylesheet, and the repro URL last
	// because it carries both documents on its own.
	if !strings.HasPrefix(dropped, "params_b64") {
		t.Errorf("dropped = %q, want params_b64 to go first", dropped)
	}
	if _, ok := entry["repro_url"]; !ok {
		t.Error("repro_url was dropped before the rest; it is the most useful field")
	}
}

func TestParseHotspot(t *testing.T) {
	h, ok := parseHotspot("TRACE_HOT|4312|xsl:template|match=\"item\"|12")
	if !ok {
		t.Fatalf("expected the line to parse")
	}
	if h.Count != 4312 || h.Kind != "xsl:template" || h.Label != `match="item"` || h.Line != 12 {
		t.Fatalf("unexpected hotspot: %+v", h)
	}
	for _, bad := range []string{
		"TRACE_HOT|not-a-number|xsl:template|x|1",
		"TRACE_HOT|1|too|few",
		"TRACE_HOT|0|xsl:template|x|1", // a zero count is not a hotspot
	} {
		if _, ok := parseHotspot(bad); ok {
			t.Errorf("expected %q to be rejected", bad)
		}
	}
	// A missing line number degrades instead of dropping the whole entry.
	if h, ok := parseHotspot("TRACE_HOT|7|xsl:for-each|sel|?"); !ok || h.Line != -1 {
		t.Errorf("expected an unparseable line number to become -1, got %+v", h)
	}
}
