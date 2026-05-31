package handlers

import (
	"net/http"

	"codecuisine-backend/internal/middleware"
	"codecuisine-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ReviewHandler handles review crud
type ReviewHandler struct {
	db *gorm.DB
}

// NewReviewHandler creates handler
func NewReviewHandler(db *gorm.DB) *ReviewHandler {
	return &ReviewHandler{db: db}
}

// CreateReviewRequest is the review form
type CreateReviewRequest struct {
	RestaurantID   uint   `json:"restaurantId"`
	TasteRating    int    `json:"tasteRating"`
	ValueRating    int    `json:"valueRating"`
	AmbianceRating int    `json:"ambianceRating"`
	Title          string `json:"title"`
	Body           string `json:"body"`
}

// Create adds new review
func (h *ReviewHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// build review
	review := models.Review{
		UserID:         userID,
		RestaurantID:   req.RestaurantID,
		TasteRating:    req.TasteRating,
		ValueRating:    req.ValueRating,
		AmbianceRating: req.AmbianceRating,
		Title:          req.Title,
		Body:           req.Body,
	}

	// save
	if result := h.db.Create(&review); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
		return
	}

	// load user info for response
	h.db.Preload("User").First(&review, review.ID)

	c.JSON(http.StatusCreated, review)
}

// GetByRestaurant lists reviews for a place
func (h *ReviewHandler) GetByRestaurant(c *gin.Context) {
	restaurantID := c.Param("id")

	var reviews []models.Review
	result := h.db.Where("restaurant_id = ?", restaurantID).
		Preload("User").
		Order("created_at DESC").
		Find(&reviews)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// GetMyReviews lists current user's reviews
func (h *ReviewHandler) GetMyReviews(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var reviews []models.Review
	result := h.db.Where("user_id = ?", userID).
		Preload("Restaurant").
		Order("created_at DESC").
		Find(&reviews)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// Update modifies existing review
func (h *ReviewHandler) Update(c *gin.Context) {
	userID := middleware.GetUserID(c)
	reviewID := c.Param("id")

	// find review
	var review models.Review
	result := h.db.First(&review, reviewID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	// check ownership
	if review.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	// bind new data
	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// update fields
	review.TasteRating = req.TasteRating
	review.ValueRating = req.ValueRating
	review.AmbianceRating = req.AmbianceRating
	review.Title = req.Title
	review.Body = req.Body

	h.db.Save(&review)
	c.JSON(http.StatusOK, review)
}

// Delete removes review
func (h *ReviewHandler) Delete(c *gin.Context) {
	userID := middleware.GetUserID(c)
	reviewID := c.Param("id")

	// find review
	var review models.Review
	result := h.db.First(&review, reviewID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	// check ownership
	if review.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	h.db.Delete(&review)
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
