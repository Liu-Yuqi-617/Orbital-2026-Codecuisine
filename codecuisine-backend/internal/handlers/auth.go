package handlers

import (
	"net/http"

	"codecuisine-backend/internal/dto"
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

// Register creates new user account
func (h *AuthHandler) Register(c *gin.Context) {
	// Parse request
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "Request parameter error: " + err.Error(),
		})
		return
	}

	// Check whether the two passwords are the same
	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "The two passwords are different",
		})
		return
	}

	// Check whether the email address has been registered
	var existingUser models.User
	result := h.db.Where("email = ?", req.Email).First(&existingUser)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{
			"code":    409,
			"message": "This email address has been registered",
		})
		return
	}

	// Password encryption
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "Failed to encryt the password",
		})
		return
	}

	// Create a new user
	user := models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	if result := h.db.Create(&user); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "Failed to create a new user" + result.Error.Error(),
		})
		return
	}

	// Success
	c.JSON(http.StatusCreated, gin.H{
		"code":    201,
		"message": "Registered successfully",
		"data": gin.H{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// Login checks credentials and returns jwt
func (h *AuthHandler) Login(c *gin.Context) {
	// Parse request
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "Request parameter error: " + err.Error(),
		})
		return
	}

	// Search for users based on email address
	var user models.User
	result := h.db.Where("email = ?", req.Email).First(&user)

	// Block login when the email address is unregistered
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "The email address is unregistered. Please register first",
		})
		return
	}

	// Password varification
	if !utils.CheckPassword(user.Password, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "Incorrect email address or password",
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Email, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "Failed to generate JWT token",
		})
		return
	}

	// Success
	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Login successfully",
		"data": dto.AuthResponse{
			Token:    token,
			Username: user.Username,
			Email:    user.Email,
		},
	})
}

// GetMe returns current user profile
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	result := h.db.First(&user, userID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "Inexistent user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Fetch successfully",
		"data": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"trustScore": user.TrustScore,
			"createdAt":  user.CreatedAt,
		},
	})
}
