package service

import (
	"context"
	"log"
	"math"
	"sync"
	"time"

	"codecuisine-backend/internal/dto"
	"codecuisine-backend/internal/models"
	"codecuisine-backend/pkg/utils"

	"gorm.io/gorm"
)

// RestaurantSyncService Background synchronization service
type RestaurantSyncService struct {
	db           *gorm.DB
	placesClient *GooglePlacesClient
	mu           sync.Mutex
	isRunning    bool
}

func NewRestaurantSyncService(db *gorm.DB, apiKey string) *RestaurantSyncService {
	return &RestaurantSyncService{
		db:           db,
		placesClient: NewGooglePlacesClient(apiKey),
	}
}

// StartBackgroundSync Starts background sync (called in main.go)
func (s *RestaurantSyncService) StartBackgroundSync() {
	go s.runSyncLoop()
}

func (s *RestaurantSyncService) runSyncLoop() {
	// Sync popular areas every hour
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	// Execute immediately on startup
	s.syncPopularAreas()

	for range ticker.C {
		s.syncPopularAreas()
	}
}

// syncPopularAreas Syncs restaurants in popular areas of Singapore
func (s *RestaurantSyncService) syncPopularAreas() {
	if s.isRunning {
		return
	}
	s.mu.Lock()
	s.isRunning = true
	defer func() {
		s.mu.Unlock()
		s.isRunning = false
	}()

	// Coordinates of popular areas in Singapore
	areas := []struct {
		Lat    float64
		Lng    float64
		Radius int
		Name   string
	}{
		{1.2833, 103.8600, 3000, "Marina Bay"},
		{1.3521, 103.8198, 2000, "Orchard Road"},
		{1.2801, 103.8500, 2000, "Chinatown"},
		{1.3000, 103.8550, 2000, "CBD"},
		{1.2930, 103.8550, 2000, "Raffles Place"},
		{1.3080, 103.8450, 2000, "Bugis"},
		{1.3140, 103.8450, 2000, "Little India"},
		{1.3210, 103.8440, 2000, "Kampong Glam"},
		{1.3300, 103.8700, 2000, "Geylang"},
		{1.3400, 103.8700, 2000, "Kallang"},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for _, area := range areas {
		log.Printf("Syncing restaurants in %s...", area.Name)

		places, err := s.placesClient.SearchNearby(ctx, area.Lat, area.Lng, area.Radius, "")
		if err != nil {
			log.Printf("Failed to sync %s: %v", area.Name, err)
			continue
		}

		// Sync to database
		for _, place := range places {
			s.upsertRestaurant(place)
		}

		log.Printf("Synced %d restaurants in %s", len(places), area.Name)

		// Avoid API rate limiting
		time.Sleep(500 * time.Millisecond)
	}
}

func (s *RestaurantSyncService) upsertRestaurant(place RestaurantResult) {
	var restaurant models.Restaurant

	err := s.db.Where("place_id = ?", place.PlaceID).First(&restaurant).Error
	if err == gorm.ErrRecordNotFound {
		restaurant = models.Restaurant{
			PlaceID:     place.PlaceID,
			Name:        place.Name,
			Address:     place.Address,
			Latitude:    place.Lat,
			Longitude:   place.Lng,
			CuisineType: utils.InferCuisineType(place.Types),
			PriceRange:  place.PriceLevel,
			PhotoURL:    place.PhotoURL,
		}
		s.db.Create(&restaurant)
	} else if err == nil {
		s.db.Model(&restaurant).Updates(map[string]interface{}{
			"name":         place.Name,
			"address":      place.Address,
			"latitude":     place.Lat,
			"longitude":    place.Lng,
			"price_range":  place.PriceLevel,
			"photo_url":    place.PhotoURL,
			"cuisine_type": utils.InferCuisineType(place.Types),
		})
	}
}

// SearchFromLocalDB Searches from local database (does not call API)
func (s *RestaurantSyncService) SearchFromLocalDB(req dto.SearchRequest) (*dto.SearchResponse, error) {
	var restaurants []models.Restaurant

	query := s.db.Model(&models.Restaurant{})

	// Calculate distance and filter
	if req.Query != "" {
		query = query.Where("name LIKE ?", "%"+req.Query+"%")
	}
	if req.Cuisine != "" {
		query = query.Where("cuisine_type = ?", req.Cuisine)
	}
	if req.PriceLevel > 0 {
		query = query.Where("price_range = ?", req.PriceLevel)
	}

	if err := query.Find(&restaurants).Error; err != nil {
		return nil, err
	}

	// Calculate distance and sort
	type RestaurantWithDistance struct {
		models.Restaurant
		Distance float64
	}

	var results []RestaurantWithDistance
	for _, r := range restaurants {
		dist := utils.Distance(req.Lat, req.Lng, r.Latitude, r.Longitude)
		if dist <= float64(req.Radius) {
			results = append(results, RestaurantWithDistance{
				Restaurant: r,
				Distance:   dist,
			})
		}
	}

	// Sort by distance
	utils.SortBy(results, func(a, b RestaurantWithDistance) bool {
		return a.Distance < b.Distance
	})

	// Convert to DTO
	var summaries []dto.SimpleRestaurant
	for _, r := range results {
		summaries = append(summaries, dto.SimpleRestaurant{
			ID:                  r.ID,
			PlaceID:             r.PlaceID,
			Name:                r.Name,
			Address:             r.Address,
			Lat:                 r.Latitude,
			Lng:                 r.Longitude,
			CuisineType:         r.CuisineType,
			PriceLevel:          r.PriceRange,
			PhotoURL:            r.PhotoURL,
			Distance:            math.Round(r.Distance*100) / 100,
			AvgTaste:            math.Round(r.AvgTaste*10) / 10,
			AvgValue:            math.Round(r.AvgValue*10) / 10,
			AvgAmbiance:         math.Round(r.AvgAmbiance*10) / 10,
			CompositeScore:      math.Round(r.CompositeScore*10) / 10,
			TrustWeightedScore:  math.Round(r.TrustWeightedScore*10) / 10,
			VerifiedReviewCount: r.VerifiedReviewCount,
			TotalReviewCount:    r.TotalReviewCount,
		})
	}

	// Pagination
	total := len(summaries)
	start := (req.Page - 1) * req.PageSize
	end := start + req.PageSize
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	return &dto.SearchResponse{
		Total:       total,
		Page:        req.Page,
		PageSize:    req.PageSize,
		Restaurants: summaries[start:end],
	}, nil
}
