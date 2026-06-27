package models

import "time"

type SearchCache struct {
	ID         uint   `gorm:"primaryKey"`
	QueryHash  string `gorm:"uniqueIndex;size:64"`
	Lat        float64
	Lng        float64
	Radius     int
	Cuisine    string
	PriceLevel int
	Results    string    `gorm:"type:json"`
	ExpiresAt  time.Time `gorm:"index"`
	CreatedAt  time.Time
}
