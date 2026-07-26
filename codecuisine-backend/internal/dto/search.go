package dto

import (
	"time"
)

// search request
type SearchRequest struct {
	Query        string  `form:"query" binding:"omitempty,max=100"`
	Lat          float64 `form:"lat" binding:"required,latitude"`
	Lng          float64 `form:"lng" binding:"required,longitude"`
	Radius       int     `form:"radius" binding:"omitempty,min=100,max=50000"`
	Cuisine      string  `form:"cuisine" binding:"omitempty,max=50"`
	PriceLevel   int     `form:"price_level" binding:"omitempty,min=1,max=4"`
	MinScore     float64 `form:"min_score" binding:"omitempty,min=0,max=5"`
	VerifiedOnly bool    `form:"verified_only"`
	SortBy       string  `form:"sort_by" binding:"omitempty,oneof=composite trust distance popularity"`
	Page         int     `form:"page" binding:"omitempty,min=1"`
	PageSize     int     `form:"page_size" binding:"omitempty,min=1,max=50"`
}

// search response
type SearchResponse struct {
	Total       int                `json:"total"`
	Page        int                `json:"page"`
	PageSize    int                `json:"page_size"`
	Restaurants []SimpleRestaurant `json:"restaurants"`
}

type SimpleRestaurant struct {
	ID                  uint    `json:"id"`
	PlaceID             string  `json:"place_id"`
	Name                string  `json:"name"`
	Address             string  `json:"address"`
	Lat                 float64 `json:"lat"`
	Lng                 float64 `json:"lng"`
	CuisineType         string  `json:"cuisine_type"`
	PriceLevel          int     `json:"price_level"`
	PhotoURL            string  `json:"photo_url"`
	Distance            float64 `json:"distance"`
	AvgTaste            float64 `json:"avg_taste"`
	AvgValue            float64 `json:"avg_value"`
	AvgAmbiance         float64 `json:"avg_ambiance"`
	CompositeScore      float64 `json:"composite_score"`
	TrustWeightedScore  float64 `json:"trust_weighted_score"`
	VerifiedReviewCount int     `json:"verified_review_count"`
	TotalReviewCount    int     `json:"total_review_count"`
}

// RestaurantDetailResponse represents detailed restaurant information
type RestaurantDetailResponse struct {
	ID                  uint             `json:"id"`
	PlaceID             string           `json:"place_id"`
	Name                string           `json:"name"`
	Address             string           `json:"address"`
	Lat                 float64          `json:"lat"`
	Lng                 float64          `json:"lng"`
	CuisineType         string           `json:"cuisine_type"`
	PriceLevel          int              `json:"price_level"`
	Phone               string           `json:"phone"`
	PhotoURL            string           `json:"photo_url"`
	AvgTaste            float64          `json:"avg_taste"`
	AvgValue            float64          `json:"avg_value"`
	AvgAmbiance         float64          `json:"avg_ambiance"`
	CompositeScore      float64          `json:"composite_score"`
	TrustWeightedScore  float64          `json:"trust_weighted_score"`
	TotalReviewCount    int64            `json:"total_review_count"`
	VerifiedReviewCount int64            `json:"verified_review_count"`
	Reviews             []ReviewResponse `json:"reviews"`
}

// ReviewResponse represents a review in the restaurant detail response
type ReviewResponse struct {
	ID             uint      `json:"id"`
	UserID         uint      `json:"user_id"`
	Username       string    `json:"username"`
	TasteRating    int       `json:"taste_rating"`
	ValueRating    int       `json:"value_rating"`
	AmbianceRating int       `json:"ambiance_rating"`
	Title          string    `json:"title"`
	Body           string    `json:"body"`
	IsVerified     bool      `json:"is_verified"`
	CreatedAt      time.Time `json:"created_at"`
}
