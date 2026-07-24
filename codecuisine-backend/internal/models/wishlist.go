package models

import (
	"time"
)

// Wishlist represents a user's saved restaurant wishlist / favorites
type Wishlist struct {
	ID           uint      `gorm:"primaryKey"`
	UserID       uint      `gorm:"not null;index"`
	RestaurantID string    `gorm:"type:varchar(255);not null;index:idx_user_restaurant,unique"`
	Notes        string    // User's personal notes or comments about the restaurant
	Tags         string    // Comma-separated user-defined tags for categorization
	CreatedAt    time.Time // Timestamp when the restaurant was added to the wishlist
}
