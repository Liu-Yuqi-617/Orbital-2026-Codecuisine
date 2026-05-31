package models

import (
	"time"

	"golang.org/x/crypto/bcrypt" // Industry-standard password hashing library              // ORM framework for database mapping
)

// User struct represents the user entity in the database
type User struct {
	// Primary key with auto-increment; exposed as "id" in JSON responses
	ID uint `gorm:"primaryKey" json:"id"`

	// Unique username with max 50 chars, uniqueIndex ensures database-level uniqueness enforcement
	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`

	// Bcrypt-hashed password, size:255 accommodates bcrypt output which can exceed 60 characters
	PasswordHash string `gorm:"size:255;not null" json:"-"`

	// Optional email field, limited to 100 characters
	Email string `gorm:"size:100" json:"email"`

	// Trust score with database default of 1.00, float64 for decimal precision in reputation calculations
	TrustScore float64 `gorm:"default:1.00" json:"trustScore"`

	// Auto-managed timestamps: GORM populates these on create/update
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// One-to-many relationship: a user has many reviews
	// `omitempty` prevents null slice from appearing as "reviews": null in JSON
	Reviews []Review `json:"reviews,omitempty"`
}

// SetPassword hashes a plaintext password using bcrypt and stores the hash
func (u *User) SetPassword(password string) error {
	// Generate salted hash from plaintext password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		// Propagate error
		return err
	}
	// Store the encoded hash string
	u.PasswordHash = string(hash)
	return nil
}

// CheckPassword verifies a plaintext password against the stored bcrypt hash
// Returns true if password matches, false otherwise
func (u *User) CheckPassword(password string) bool {
	// Returns nil on match, error on mismatch or malformed hash
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}
