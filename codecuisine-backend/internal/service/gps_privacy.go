package service

import (
	"log"
	"time"

	"codecuisine-backend/internal/models"

	"gorm.io/gorm"
)

// to ensure privacy: GPS data is used only at check-in time and not persistently stored
type GPSPrivacyCleaner struct {
	db *gorm.DB
}

// NewGPSPrivacyCleaner creates a new GPS privacy cleaner
func NewGPSPrivacyCleaner(db *gorm.DB) *GPSPrivacyCleaner {
	return &GPSPrivacyCleaner{db: db}
}

// StartGPSCleanup starts a background goroutine that periodically cleans GPS data
func StartGPSCleanup(db *gorm.DB) {
	cleaner := NewGPSPrivacyCleaner(db)
	go cleaner.runCleanupLoop()
}

func (c *GPSPrivacyCleaner) runCleanupLoop() {
	// Run cleanup every 15 minutes
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()

	// Run immediately on startup
	c.cleanOldGPSData()

	for range ticker.C {
		c.cleanOldGPSData()
	}
}

// cleanOldGPSData finds GPS verification records older than the grace period
func (c *GPSPrivacyCleaner) cleanOldGPSData() {
	gracePeriod := time.Now().Add(-1 * time.Hour)

	result := c.db.Model(&models.Verification{}).
		Where("type = ? AND created_at < ? AND gps_latitude != 0", models.VerificationGPS, gracePeriod).
		Updates(map[string]interface{}{
			"gps_latitude":  0,
			"gps_longitude": 0,
		})

	if result.Error != nil {
		log.Printf("GPS privacy cleanup failed: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		log.Printf("GPS privacy cleanup: cleared coordinates for %d verification records", result.RowsAffected)
	}
}

// ImmediateCleanGPS clears GPS coordinates for a specific verification record immediately.
func (c *GPSPrivacyCleaner) ImmediateCleanGPS(verificationID uint) {
	c.db.Model(&models.Verification{}).
		Where("id = ?", verificationID).
		Updates(map[string]interface{}{
			"gps_latitude":  0,
			"gps_longitude": 0,
		})
}
