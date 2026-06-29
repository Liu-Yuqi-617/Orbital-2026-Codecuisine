package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"strings"
	"time"
	"unicode/utf8"

	"codecuisine-backend/internal/dto"
	"codecuisine-backend/internal/models"
	"codecuisine-backend/pkg/utils"

	"gorm.io/gorm"
)

type SearchService struct {
	db           *gorm.DB
	placesClient *GooglePlacesClient
	cacheTTL     time.Duration
}

func NewSearchService(db *gorm.DB, apiKey string) *SearchService {
	return &SearchService{
		db:           db,
		placesClient: NewGooglePlacesClient(apiKey),
		cacheTTL:     30 * time.Minute,
	}
}

// Search main search entry point
func (s *SearchService) Search(ctx context.Context, req dto.SearchRequest) (*dto.SearchResponse, error) {
	// Default values
	if req.Radius == 0 {
		req.Radius = 5000
	}
	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 10
	}
	if req.SortBy == "" {
		req.SortBy = "trust"
	}

	// Try to read from cache
	cacheKey := s.generateCacheKey(req)
	cached, err := s.getFromCache(cacheKey)
	if err == nil && cached != nil {
		return s.paginateCache(cached, req.Page, req.PageSize), nil
	}

	// Get base data from Google Places
	places, err := s.placesClient.SearchNearby(ctx, req.Lat, req.Lng, req.Radius, req.Query)
	if err != nil {
		// Degrade: return existing data from database
		return s.searchFromDB(req)
	}

	// Update to local database
	restaurants := s.syncPlacesToDB(places)

	// Apply local filtering and sorting
	filtered := s.applyFilters(restaurants, req)
	sorted := s.applySorting(filtered, req.SortBy, req.Lat, req.Lng)

	// Write to cache
	fullResponse := s.paginateResults(sorted, 1, len(sorted), req)
	s.saveToCache(cacheKey, fullResponse.Restaurants)

	// Return paginated results
	return s.paginateResults(sorted, req.Page, req.PageSize, req), nil
}

// syncPlacesToDB syncs Google Places data to local DB, or returns existing data
func (s *SearchService) syncPlacesToDB(places []RestaurantResult) []models.Restaurant {
	var results []models.Restaurant

	for _, place := range places {
		var restaurant models.Restaurant

		// Try to find existing record
		err := s.db.Where("place_id = ?", place.PlaceID).First(&restaurant).Error

		if err == gorm.ErrRecordNotFound {
			// Create new
			restaurant = models.Restaurant{
				PlaceID:     place.PlaceID,
				Name:        place.Name,
				Address:     place.Address,
				Latitude:    place.Lat,
				Longitude:   place.Lng,
				CuisineType: utils.InferCuisineType(place.Types),
				PriceRange:  place.PriceLevel,
				Phone:       place.Phone,
				PhotoURL:    place.PhotoURL,
			}
			s.db.Create(&restaurant)
		} else {
			// Update basic info (optional)
			s.db.Model(&restaurant).Updates(map[string]interface{}{
				"name":      place.Name,
				"address":   place.Address,
				"lat":       place.Lat,
				"lng":       place.Lng,
				"photo_url": place.PhotoURL,
			})
		}

		// Recalculate aggregate scores
		s.recalculateScores(restaurant.ID)

		// Reload (with latest scores)
		s.db.First(&restaurant, restaurant.ID)
		results = append(results, restaurant)
	}

	return results
}

// recalculateScores recalculates the restaurant's aggregate score and trust-weighted score
func (s *SearchService) recalculateScores(restaurantID uint) {
	var stats struct {
		AvgTaste      float64
		AvgValue      float64
		AvgAmbiance   float64
		TotalCount    int64
		VerifiedCount int64
		SumTrustScore float64
	}

	// Base aggregation
	s.db.Model(&models.Review{}).
		Select(`
            AVG(taste_rating) as avg_taste,
            AVG(value_rating) as avg_value,
            AVG(ambiance_rating) as avg_ambiance,
            COUNT(*) as total_count,
            SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified_count
        `).
		Where("restaurant_id = ?", restaurantID).
		Scan(&stats)

	// Trust weighting: high-trust users' ratings have higher weight
	var weightedSum float64
	var weightTotal float64

	var reviews []models.Review
	s.db.Preload("User").Where("restaurant_id = ?", restaurantID).Find(&reviews)

	for _, r := range reviews {
		weight := 1.0
		if r.IsVerified {
			weight *= 1.5 // Verified reviews get 1.5x weight
		}

		trustBonus := r.User.TrustScore / 100.0 // Trust score 0-1
		weight *= (1 + trustBonus)

		avgRating := (float64)(r.TasteRating+r.ValueRating+r.AmbianceRating) / 3.0
		weightedSum += avgRating * weight
		weightTotal += weight
	}

	trustWeighted := 0.0
	if weightTotal > 0 {
		trustWeighted = weightedSum / weightTotal
	}

	composite := (stats.AvgTaste + stats.AvgValue + stats.AvgAmbiance) / 3.0

	s.db.Model(&models.Restaurant{}).Where("id = ?", restaurantID).Updates(map[string]interface{}{
		"avg_taste":             stats.AvgTaste,
		"avg_value":             stats.AvgValue,
		"avg_ambiance":          stats.AvgAmbiance,
		"composite_score":       composite,
		"total_review_count":    stats.TotalCount,
		"verified_review_count": stats.VerifiedCount,
		"trust_weighted_score":  trustWeighted,
	})
}

// applyFilters applies filter conditions
func (s *SearchService) applyFilters(restaurants []models.Restaurant, req dto.SearchRequest) []models.Restaurant {
	var filtered []models.Restaurant

	for _, r := range restaurants {
		// Distance filter (already handled by Google Places, but can be further refined)
		distance := utils.Distance(req.Lat, req.Lng, r.Latitude, r.Longitude)
		if distance > float64(req.Radius) {
			continue
		}

		// Cuisine filter
		if req.Cuisine != "" && r.CuisineType != req.Cuisine {
			continue
		}

		// Price filter
		if req.PriceLevel > 0 && r.PriceRange != req.PriceLevel {
			continue
		}

		// Minimum score filter
		if req.MinScore > 0 {
			score := r.CompositeScore
			if req.SortBy == "trust" {
				score = r.TrustWeightedScore
			}
			if score < req.MinScore {
				continue
			}
		}

		// Verified reviews only
		if req.VerifiedOnly && r.VerifiedReviewCount == 0 {
			continue
		}

		filtered = append(filtered, r)
	}

	return filtered
}

// applySorting applies sorting
func (s *SearchService) applySorting(restaurants []models.Restaurant, sortBy string, lat, lng float64) []models.Restaurant {
	switch sortBy {
	case "trust":
		// Most Trusted: trust-weighted score descending
		utils.SortBy(restaurants, func(a, b models.Restaurant) bool {
			return a.TrustWeightedScore > b.TrustWeightedScore
		})
	case "composite":
		utils.SortBy(restaurants, func(a, b models.Restaurant) bool {
			return a.CompositeScore > b.CompositeScore
		})
	case "distance":
		utils.SortBy(restaurants, func(a, b models.Restaurant) bool {
			da := utils.Distance(lat, lng, a.Latitude, a.Longitude)
			db := utils.Distance(lat, lng, b.Latitude, b.Longitude)
			return da < db
		})
	case "popularity":
		utils.SortBy(restaurants, func(a, b models.Restaurant) bool {
			return a.TotalReviewCount > b.TotalReviewCount
		})
	}

	return restaurants
}

// Cache related
func (s *SearchService) generateCacheKey(req dto.SearchRequest) string {
	data := fmt.Sprintf("%f|%f|%d|%s|%d|%f|%v|%s",
		req.Lat, req.Lng, req.Radius, req.Cuisine, req.PriceLevel,
		req.MinScore, req.VerifiedOnly, req.Query)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

func (s *SearchService) getFromCache(key string) ([]dto.SimpleRestaurant, error) {
	var cache models.SearchCache
	err := s.db.Where("query_hash = ? AND expires_at > ?", key, time.Now()).First(&cache).Error
	if err != nil {
		return nil, err
	}
	var results []dto.SimpleRestaurant
	err = json.Unmarshal([]byte(cache.Results), &results)
	return results, err
}

func (s *SearchService) saveToCache(key string, results []dto.SimpleRestaurant) {
	data, _ := json.Marshal(results)
	cache := models.SearchCache{
		QueryHash: key,
		Results:   string(data),
		ExpiresAt: time.Now().Add(s.cacheTTL),
	}
	s.db.Where("query_hash = ?", key).Delete(&models.SearchCache{})
	s.db.Create(&cache)
}

// Add method to clean expired cache
func (s *SearchService) CleanExpiredCache() error {
	result := s.db.Where("expires_at < ?", time.Now()).Delete(&models.SearchCache{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected > 0 {
		log.Printf("Cleaned %d expired cache entries", result.RowsAffected)
	}
	return nil
}

func (s *SearchService) paginateCache(cached []dto.SimpleRestaurant, page, pageSize int) *dto.SearchResponse {
	total := len(cached)
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	return &dto.SearchResponse{
		Total:       total,
		Page:        page,
		PageSize:    pageSize,
		Restaurants: cached[start:end],
	}
}

func normalizeSearchQuery(query string) string {
	if utf8.RuneCountInString(query) > 100 {
		query = string([]rune(query)[:100])
	}
	query = strings.TrimSpace(query)
	query = strings.ReplaceAll(query, "%", "\\%")
	query = strings.ReplaceAll(query, "_", "\\_")
	return query
}

// Pagination and conversion
func (s *SearchService) paginateResults(restaurants []models.Restaurant, page, pageSize int, req dto.SearchRequest) *dto.SearchResponse {
	total := len(restaurants)
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	var summaries []dto.SimpleRestaurant
	for _, r := range restaurants[start:end] {
		distance := utils.Distance(req.Lat, req.Lng, r.Latitude, r.Longitude)

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
			Distance:            math.Round(distance*100) / 100,
			AvgTaste:            math.Round(r.AvgTaste*10) / 10,
			AvgValue:            math.Round(r.AvgValue*10) / 10,
			AvgAmbiance:         math.Round(r.AvgAmbiance*10) / 10,
			CompositeScore:      math.Round(r.CompositeScore*10) / 10,
			TrustWeightedScore:  math.Round(r.TrustWeightedScore*10) / 10,
			VerifiedReviewCount: r.VerifiedReviewCount,
			TotalReviewCount:    r.TotalReviewCount,
		})
	}

	return &dto.SearchResponse{
		Total:       total,
		Page:        page,
		PageSize:    pageSize,
		Restaurants: summaries,
	}
}

// searchFromDB fallback solution: search from local database
func (s *SearchService) searchFromDB(req dto.SearchRequest) (*dto.SearchResponse, error) {
	var restaurants []models.Restaurant

	// Base query
	query := s.db.Model(&models.Restaurant{})

	// Keyword fuzzy match
	if req.Query != "" {
		query = query.Where("name LIKE ?", "%"+req.Query+"%")
	}

	// Cuisine filter
	if req.Cuisine != "" {
		query = query.Where("cuisine_type = ?", req.Cuisine)
	}

	// Price filter
	if req.PriceLevel > 0 {
		query = query.Where("price_range = ?", req.PriceLevel)
	}

	// Fetch data
	if err := query.Find(&restaurants).Error; err != nil {
		return nil, fmt.Errorf("database search failed: %w", err)
	}

	// Apply distance, score, verification filters in memory + sorting + pagination
	filtered := s.applyFilters(restaurants, req)
	sorted := s.applySorting(filtered, req.SortBy, req.Lat, req.Lng)

	return s.paginateResults(sorted, req.Page, req.PageSize, req), nil
}

// calculate and update the user's trust score
func (s *SearchService) UpdateUserTrustScore(userID uint) error {
	var stats struct {
		TotalReviews       int64
		VerifiedReviews    int64
		TotalVerifications int64
		GPSVerifications   int64
		PhotoVerifications int64
	}

	// Count user's total reviews
	if err := s.db.Model(&models.Review{}).
		Where("user_id = ?", userID).
		Count(&stats.TotalReviews).Error; err != nil {
		return err
	}

	// Count verified reviews
	if err := s.db.Model(&models.Review{}).
		Where("user_id = ? AND is_verified = ?", userID, true).
		Count(&stats.VerifiedReviews).Error; err != nil {
		return err
	}

	// Count total verification records
	if err := s.db.Model(&models.Verification{}).
		Joins("JOIN reviews ON verifications.review_id = reviews.id").
		Where("reviews.user_id = ?", userID).
		Count(&stats.TotalVerifications).Error; err != nil {
		return err
	}

	// Count GPS verifications
	if err := s.db.Model(&models.Verification{}).
		Joins("JOIN reviews ON verifications.review_id = reviews.id").
		Where("reviews.user_id = ? AND verifications.type = ?", userID, models.VerificationGPS).
		Count(&stats.GPSVerifications).Error; err != nil {
		return err
	}

	// Count photo verifications
	if err := s.db.Model(&models.Verification{}).
		Joins("JOIN reviews ON verifications.review_id = reviews.id").
		Where("reviews.user_id = ? AND verifications.type = ?", userID, models.VerificationPhotoMetadata).
		Count(&stats.PhotoVerifications).Error; err != nil {
		return err
	}

	// Calculate trust score
	trustScore := s.calculateTrustScore(stats)

	// Update user table
	if err := s.db.Model(&models.User{}).
		Where("id = ?", userID).
		Update("trust_score", trustScore).Error; err != nil {
		return err
	}

	log.Printf("Updated trust score for user %d: %d", userID, trustScore)
	return nil
}

// calculate the trust score
func (s *SearchService) calculateTrustScore(stats struct {
	TotalReviews       int64
	VerifiedReviews    int64
	TotalVerifications int64
	GPSVerifications   int64
	PhotoVerifications int64
}) int {
	// Base score 30
	score := 30.0

	// Verification rate bonus (max 40 points)
	if stats.TotalReviews > 0 {
		verificationRate := float64(stats.VerifiedReviews) / float64(stats.TotalReviews)
		score += verificationRate * 40.0
	}

	// Verification count bonus (max 20 points, +2 points per verification)
	score += math.Min(float64(stats.TotalVerifications)*2.0, 20.0)

	// Verification diversity bonus (max 10 points)
	if stats.GPSVerifications > 0 {
		score += 5.0
	}
	if stats.PhotoVerifications > 0 {
		score += 5.0
	}

	// Cap at 100
	return int(math.Min(score, 100.0))
}
