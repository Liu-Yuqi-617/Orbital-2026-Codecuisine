package dto

import (
	"time"
)

// Register Request
type RegisterRequest struct {
	Username        string `json:"username" binding:"required,min=3,max=20"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

// Login Request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Authentication Response
type AuthResponse struct {
	Token      string  `json:"token"`
	Username   string  `json:"username"`
	Email      string  `json:"email"`
	TrustScore float64 `json:"trustScore"`
}

// User Information Response
type UserResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}
