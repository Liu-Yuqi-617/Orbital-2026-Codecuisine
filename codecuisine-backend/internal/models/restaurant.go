package models

import "time"

// Restaurant struct represents a dining establishment in the system
type Restaurant struct {
	ID uint `gorm:"primaryKey" json:"id"`

	// Google Places API unique identifier
	PlaceID string `gorm:"uniqueIndex;size:100" json:"placeId"`

	// Restaurant display name (required field)
	Name string `gorm:"size:100;not null" json:"name"`

	// Full street address for display and geocoding fallback
	Address string `gorm:"size:200" json:"address"`

	// Cuisine category
	CuisineType string `gorm:"size:50" json:"cuisineType"`

	// Price level indicator: typically 1-4, 1=cheap, 2=moderate, 3=expensive, 4=very expensive
	PriceRange int `json:"priceRange"`

	// Geographic coordinates for map display and proximity search
	// float64 provides ~15 decimal digits of precision (sufficient for GPS)
	Latitude  float64 `gorm:"index:idx_location" json:"latitude"`
	Longitude float64 `gorm:"index:idx_location" json:"longitude"`

	// Contact phone number in international or local format
	Phone string `gorm:"size:20" json:"phone"`

	// Cover photo of the restaurant
	PhotoURL string `json:"photo_url"`

	// Different aspects of partial scores
	AvgTaste            float64 `gorm:"default:0" json:"avg_taste"`
	AvgValue            float64 `gorm:"default:0" json:"avg_value"`
	AvgAmbiance         float64 `gorm:"default:0" json:"avg_ambiance"`
	CompositeScore      float64 `gorm:"default:0;index" json:"composite_score"`
	VerifiedReviewCount int     `gorm:"default:0" json:"verified_review_count"`
	TotalReviewCount    int     `gorm:"default:0" json:"total_review_count"`

	// Trust weigted score for each restaurant
	TrustWeightedScore float64 `gorm:"default:0;index" json:"trust_weighted_score"`

	// Record creation and update timestamp (GORM auto-populates on insert)
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// One-to-many relationship: a restaurant has multiple reviews and photos
	// GORM foreign key defaults to restaurant_id in reviews table and photo table
	Reviews []Review `json:"reviews,omitempty"`
	Photos  []Photo  `json:"photos,omitempty"`
}
