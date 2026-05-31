package handlers

import (
	"net/http"

	"codecuisine-backend/internal/models"
	"codecuisine-backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthHandler handles login/register
type AuthHandler struct {
	db        *gorm.DB
	jwtSecret string
}

// NewAuthHandler creates handler with db and secret
func NewAuthHandler(db *gorm.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: jwtSecret}
}

// RegisterRequest is the signup form
type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

// LoginRequest is the login form
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Register creates new user account
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// check if username taken
	var existingUser models.User
	result := h.db.Where("username = ?", req.Username).First(&existingUser)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "username already exists"})
		return
	}

	// create user
	user := models.User{
		Username: req.Username,
		Email:    req.Email,
	}

	// hash password
	if err := user.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// save to db
	if result := h.db.Create(&user); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "registration successful",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}

// Login checks credentials and returns jwt
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// find user
	var user models.User
	result := h.db.Where("username = ?", req.Username).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	// check password
	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	// generate token
	token, err := utils.GenerateToken(user.ID, user.Username, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"trustScore": user.TrustScore,
		},
	})
}

// GetMe returns current user profile
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	result := h.db.First(&user, userID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"trustScore": user.TrustScore,
		"createdAt":  user.CreatedAt,
	})
}
