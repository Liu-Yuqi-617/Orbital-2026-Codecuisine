package models

import (
	"time"
)

type Wishlist struct {
	ID           uint   `gorm:"primaryKey"`
	UserID       uint   `gorm:"not null;index"`
	RestaurantID string `gorm:"type:varchar(255);not null;index:idx_user_restaurant,unique"`
	Notes        string
	Tags         string
	CreatedAt    time.Time
}
