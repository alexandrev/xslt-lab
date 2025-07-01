// xslt-playground-backend/main.go
package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

type TransformRequest struct {
	XSLT       string            `json:"xslt"`
	Version    string            `json:"version"`
	Parameters map[string]string `json:"parameters"`
}

type TransformResponse struct {
	Result string `json:"result"`
}

type AppConfig struct {
	Port       string `json:"port"`
	SaxonPath  string `json:"saxon_path"`
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
	return &config, nil
}

func main() {
	config, err := loadConfig("app.config")
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	r := gin.Default()

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
			"-cp", config.SaxonPath,
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

		c.JSON(http.StatusOK, TransformResponse{Result: string(result)})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.Run(":" + config.Port)
}
