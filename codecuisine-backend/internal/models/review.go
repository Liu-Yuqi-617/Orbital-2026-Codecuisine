package models

import "time"

// Review struct represents a user-generated restaurant review with multi-dimensional ratings
type Review struct {
	ID uint `gorm:"primaryKey" json:"id"`

	// Foreign key referencing the user who wrote this review
	UserID uint `gorm:"not null;index" json:"userId"`

	// Foreign key referencing the reviewed restaurant
	RestaurantID uint `gorm:"not null;index" json:"restaurantId"`

	// Taste quality rating (1-5 scale: 1=terrible, 2=poor, 3=average, 4=good, 5=excellent)
	TasteRating int `gorm:"check:taste_rating BETWEEN 1 AND 5" json:"tasteRating"`

	// Value for money rating (1-5 scale)
	ValueRating int `gorm:"check:value_rating BETWEEN 1 AND 5" json:"valueRating"`

	// Atmosphere and environment rating (1-5 scale)
	AmbianceRating int `gorm:"check:ambiance_rating BETWEEN 1 AND 5" json:"ambianceRating"`

	// Short review headline / summary (optional)
	Title string `gorm:"size:150" json:"title"`

	// Full review text content (optional)
	Body string `gorm:"type:text" json:"body"`

	// Whether the user has proven they actually visited (receipt upload, location check-in, etc.)
	IsVerified bool `gorm:"default:false" json:"isVerified"`

	// Number of helpfulness upvotes from other users
	LikesCount int `gorm:"default:0" json:"likesCount"`

	// Record creation timestamp (GORM auto-populated on insert)
	CreatedAt time.Time `json:"createdAt"`

	// Last modification timestamp (GORM auto-updated on save)
	UpdatedAt time.Time `json:"updatedAt"`

	// Belongs-to association: the author of this review
	// foreignKey:UserID links to User.ID
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	// Belongs-to association: the restaurant being reviewed
	// foreignKey:RestaurantID links to Restaurant.ID
	Restaurant Restaurant `gorm:"foreignKey:RestaurantID" json:"restaurant,omitempty"`

	// Has-one association: optional verification record (receipt, check-in proof)
	// Separate table enables flexible verification methods (photo receipt, GPS, QR code)
	Verification *Verification `json:"verification,omitempty"`
}

// OverallRating calculates the arithmetic mean of the three rating dimensions and returns a float64 for decimal precision
// Used for display on review cards and aggregation into restaurant average scores
func (r *Review) OverallRating() float64 {
	// Sum all three ratings and divide by 3.0
	return float64(r.TasteRating+r.ValueRating+r.AmbianceRating) / 3.0
}
