package main

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	httpRequestsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "xslt_http_requests_total",
		Help: "Total HTTP requests processed, by method, route and status code.",
	}, []string{"method", "route", "status"})

	httpRequestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "xslt_http_request_duration_seconds",
		Help:    "HTTP request latency in seconds, by method and route.",
		Buckets: prometheus.DefBuckets,
	}, []string{"method", "route"})

	httpRequestsInFlight = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "xslt_http_requests_in_flight",
		Help: "HTTP requests currently being served.",
	})

	transformationsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "xslt_transformations_total",
		Help: "Total XSLT transformations, by version and outcome.",
	}, []string{"version", "status"})

	transformationDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "xslt_transformation_duration_seconds",
		Help:    "XSLT transformation (Saxon) duration in seconds, by version.",
		Buckets: []float64{0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10},
	}, []string{"version"})

	transformationPayloadBytes = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "xslt_transformation_payload_bytes",
		Help:    "Size of submitted XSLT stylesheet in bytes, by version.",
		Buckets: []float64{256, 1024, 4096, 16384, 65536, 262144, 1048576},
	}, []string{"version"})

	traceRequestsTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "xslt_trace_requests_total",
		Help: "Transformation requests with trace enabled.",
	})
)

// normalizeVersion maps the requested XSLT version to a bounded set of label
// values, keeping metric cardinality low. Empty defaults to 3.0 (the backend
// default daemon); anything unrecognized is "invalid".
func normalizeVersion(v string) string {
	switch v {
	case "1.0", "2.0", "3.0":
		return v
	case "":
		return "3.0"
	default:
		return "invalid"
	}
}

func metricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		httpRequestsInFlight.Inc()
		c.Next()
		httpRequestsInFlight.Dec()

		route := c.FullPath()
		if route == "" {
			route = "unmatched"
		}
		status := strconv.Itoa(c.Writer.Status())
		httpRequestsTotal.WithLabelValues(c.Request.Method, route, status).Inc()
		httpRequestDuration.WithLabelValues(c.Request.Method, route).Observe(time.Since(start).Seconds())
	}
}

// startMetricsServer exposes /metrics on a dedicated port so it is never routed
// through the public ingress that fronts the main API port.
func startMetricsServer(port string) {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	srv := &http.Server{Addr: ":" + port, Handler: mux}
	log.Printf("metrics server listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Printf("metrics server stopped: %v", err)
	}
}
