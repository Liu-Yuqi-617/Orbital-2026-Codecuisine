package handlers

import (
	"net/http"
	"strings"

	"codecuisine-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// WishlistHandler handles wishlist related requests
type WishlistHandler struct {
	db *gorm.DB
}

// NewWishlistHandler creates a new WishlistHandler
func NewWishlistHandler(db *gorm.DB) *WishlistHandler {
	return &WishlistHandler{
		db: db,
	}
}

// AddToWishlist adds a restaurant to the wishlist
func (h *WishlistHandler) AddToWishlist(c *gin.Context) {
	var input struct {
		RestaurantID string   `json:"restaurant_id" binding:"required"`
		Notes        string   `json:"notes"`
		Tags         []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": err.Error(),
		})
		return
	}

	// Get userID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "Unauthorized",
		})
		return
	}

	// Convert tags array to a comma-separated string
	tagsStr := strings.Join(input.Tags, ",")

	wishlistItem := models.Wishlist{
		UserID:       userID.(uint),
		RestaurantID: input.RestaurantID,
		Notes:        input.Notes,
		Tags:         tagsStr,
	}

	// Use OnConflict to handle duplicates (Upsert)
	result := h.db.Clauses(
		// If user_id and restaurant_id conflict, update notes and tags
		clause.OnConflict{
			Columns:   []clause.Column{{Name: "user_id"}, {Name: "restaurant_id"}},
			DoUpdates: clause.AssignmentColumns([]string{"notes", "tags"}),
		},
	).Create(&wishlistItem)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "Failed to save to wishlist",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Saved to wishlist successfully",
	})
}

// GetWishlist gets the current user's wishlist
func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "Unauthorized",
		})
		return
	}

	var wishlists []models.Wishlist
	if err := h.db.Where("user_id = ?", userID).Find(&wishlists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "Failed to fetch wishlist",
		})
		return
	}

	c.JSON(http.StatusOK, wishlists)
}

// RemoveFromWishlist removes a restaurant from the wishlist
func (h *WishlistHandler) RemoveFromWishlist(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "Unauthorized",
		})
		return
	}

	restaurantID := c.Param("restaurant_id")
	if restaurantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "Restaurant ID is required",
		})
		return
	}

	result := h.db.Where("user_id = ? AND restaurant_id = ?", userID, restaurantID).Delete(&models.Wishlist{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "Failed to remove from wishlist",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "Item not found in wishlist",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Removed from wishlist successfully",
	})
}
