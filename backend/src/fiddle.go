package main

import (
	"crypto/rand"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Saved fiddles: a workspace payload stored under a short id, with an
// append-only revision history. Available whenever DATABASE_URL is set —
// unlike /history this does not require Pro mode or authentication, because a
// fiddle is by definition a thing you share with someone who has no account.

type Fiddle struct {
	ID        string    `json:"id" gorm:"primaryKey;size:12"`
	Revision  int       `json:"revision" gorm:"primaryKey;autoIncrement:false"`
	Payload   string    `json:"payload"`
	CreatedAt time.Time `json:"created_at"`
}

const (
	fiddleIDLen     = 7
	fiddlePayloadMax = 200_000 // bytes; a workspace is KBs, this is sabotage headroom
	fiddleMaxRevs    = 200      // append-only cap per fiddle
)

// Base58: no 0/O/I/l lookalikes, so ids survive being read aloud or retyped.
const fiddleAlphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

func newFiddleID() (string, error) {
	buf := make([]byte, fiddleIDLen)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	id := make([]byte, fiddleIDLen)
	for i, b := range buf {
		id[i] = fiddleAlphabet[int(b)%len(fiddleAlphabet)]
	}
	return string(id), nil
}

func validFiddleID(id string) bool {
	if len(id) != fiddleIDLen {
		return false
	}
	for _, c := range id {
		ok := false
		for _, a := range fiddleAlphabet {
			if c == a {
				ok = true
				break
			}
		}
		if !ok {
			return false
		}
	}
	return true
}

func registerFiddleRoutes(r *gin.Engine, db *gorm.DB) {
	if db == nil {
		// Feature off (lightweight compose has no database): answer clearly
		// instead of 404, so the frontend can hide the Save button.
		off := func(c *gin.Context) {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "fiddle storage is not configured"})
		}
		r.POST("/fiddle", off)
		r.GET("/fiddle/:id", off)
		r.GET("/fiddle/:id/:rev", off)
		return
	}

	// Explicit, idempotent DDL instead of GORM's AutoMigrate: the migrator
	// chokes on this composite primary key when the table already exists
	// ("insufficient arguments" on its introspection query), which crashlooped
	// the first deployment. CREATE IF NOT EXISTS has no such moods.
	if err := db.Exec(`CREATE TABLE IF NOT EXISTS fiddles (
		id varchar(12) NOT NULL,
		revision integer NOT NULL,
		payload text NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now(),
		PRIMARY KEY (id, revision)
	)`).Error; err != nil {
		// Same degradation contract as a failed connection: fiddles off,
		// transforms unaffected.
		log.Printf("fiddle table create failed, fiddle storage disabled: %v", err)
		registerFiddleRoutes(r, nil)
		return
	}

	r.POST("/fiddle", func(c *gin.Context) {
		var req struct {
			ID      string `json:"id"`
			Payload string `json:"payload"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}
		if req.Payload == "" || len(req.Payload) > fiddlePayloadMax {
			c.JSON(http.StatusBadRequest, gin.H{"error": "payload missing or too large"})
			return
		}

		revision := 1
		id := req.ID
		if id != "" {
			// New revision of an existing fiddle.
			if !validFiddleID(id) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid fiddle id"})
				return
			}
			var last Fiddle
			err := db.Where("id = ?", id).Order("revision desc").First(&last).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "fiddle not found"})
				return
			} else if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
				return
			}
			if last.Revision >= fiddleMaxRevs {
				c.JSON(http.StatusTooManyRequests, gin.H{"error": "revision limit reached"})
				return
			}
			revision = last.Revision + 1
		} else {
			// Fresh fiddle: collisions are astronomically unlikely (58^7) but
			// retrying costs nothing.
			for attempt := 0; ; attempt++ {
				candidate, err := newFiddleID()
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "id generation failed"})
					return
				}
				var count int64
				db.Model(&Fiddle{}).Where("id = ?", candidate).Count(&count)
				if count == 0 {
					id = candidate
					break
				}
				if attempt >= 4 {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "id space exhausted"})
					return
				}
			}
		}

		rec := Fiddle{ID: id, Revision: revision, Payload: req.Payload, CreatedAt: time.Now()}
		if err := db.Create(&rec).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id, "revision": revision})
	})

	load := func(c *gin.Context, id string, revision int) {
		if !validFiddleID(id) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid fiddle id"})
			return
		}
		q := db.Where("id = ?", id)
		if revision > 0 {
			q = q.Where("revision = ?", revision)
		}
		var rec Fiddle
		if err := q.Order("revision desc").First(&rec).Error; errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "fiddle not found"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
			return
		}
		var total int64
		db.Model(&Fiddle{}).Where("id = ?", id).Count(&total)
		c.JSON(http.StatusOK, gin.H{
			"id":        rec.ID,
			"revision":  rec.Revision,
			"revisions": total,
			"payload":   rec.Payload,
		})
	}

	r.GET("/fiddle/:id", func(c *gin.Context) { load(c, c.Param("id"), 0) })
	r.GET("/fiddle/:id/:rev", func(c *gin.Context) {
		rev := 0
		if _, err := parseRev(c.Param("rev"), &rev); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid revision"})
			return
		}
		load(c, c.Param("id"), rev)
	})
}

func parseRev(s string, out *int) (int, error) {
	n := 0
	if s == "" {
		return 0, errors.New("empty")
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, errors.New("not a number")
		}
		n = n*10 + int(c-'0')
		if n > fiddleMaxRevs {
			return 0, errors.New("out of range")
		}
	}
	*out = n
	return n, nil
}
