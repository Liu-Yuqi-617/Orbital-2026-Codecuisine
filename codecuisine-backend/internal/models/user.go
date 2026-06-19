package models

import (
	"time" // Industry-standard password hashing library              // ORM framework for database mapping
)

// User struct represents the user entity in the database
type User struct {
	// Primary key with auto-increment; exposed as "id" in JSON responses
	ID uint `gorm:"primaryKey" json:"id"`

	// Unique username with max 50 chars, uniqueIndex ensures database-level uniqueness enforcement
	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`

	// Bcrypt-hashed password, size:255 accommodates bcrypt output which can exceed 60 characters
	Password string `gorm:"size:255;not null" json:"-"`

	// Optional email field, limited to 100 characters
	Email string `gorm:"uniqueIndex;size:100;not null" json:"email"`

	// Trust score with database default of 1.00, float64 for decimal precision in reputation calculations
	TrustScore float64 `gorm:"default:1.00" json:"trustScore"`

	// Auto-managed timestamps: GORM populates these on create/update
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// One-to-many relationship: a user has many reviews
	// `omitempty` prevents null slice from appearing as "reviews": null in JSON
	Reviews []Review `json:"reviews,omitempty"`
}
