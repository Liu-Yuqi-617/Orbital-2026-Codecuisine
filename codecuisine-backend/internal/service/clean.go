package service

import (
	"log"
	"time"
)

// start cache cleanup automatically
func StartCacheCleanup(searchService *SearchService) {
	ticker := time.NewTicker(1 * time.Hour) // clean once an hour
	defer ticker.Stop()

	for range ticker.C {
		if err := searchService.CleanExpiredCache(); err != nil {
			log.Printf("Cache cleanup failed: %v", err)
		}
	}
}
