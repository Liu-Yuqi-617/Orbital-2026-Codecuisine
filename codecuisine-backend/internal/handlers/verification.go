package handlers

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	"codecuisine-backend/internal/middleware"
	"codecuisine-backend/internal/models"
	"codecuisine-backend/internal/service"
	"codecuisine-backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// VerificationHandler handles receipt uploads
type VerificationHandler struct {
	db            *gorm.DB
	searchService *service.SearchService
	imageService  *service.ImageService
}

// NewVerificationHandler creates handler
func NewVerificationHandler(db *gorm.DB, searchService *service.SearchService, imageService *service.ImageService) *VerificationHandler {
	return &VerificationHandler{
		db:            db,
		searchService: searchService,
		imageService:  imageService,
	}
}

// UploadReceipt saves receipt image
func (h *VerificationHandler) UploadReceipt(c *gin.Context) {
	userID := middleware.GetUserID(c)
	reviewID := c.PostForm("reviewId")

	// Wrap all database operations in a transaction
	err := h.db.Transaction(func(tx *gorm.DB) error {
		// verify review belongs to user
		var review models.Review
		if err := tx.Where("id = ? AND user_id = ?", reviewID, userID).First(&review).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		// get uploaded file
		file, err := c.FormFile("receipt")
		if err != nil {
			return fmt.Errorf("please upload a file")
		}

		// check file extension
		ext := filepath.Ext(file.Filename)
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			return fmt.Errorf("only jpg/png allowed")
		}

		// check file size (5MB)
		if file.Size > 5*1024*1024 {
			return fmt.Errorf("file too large, max 5MB")
		}

		// Upload to Cloudinary
		imageURL, err := h.imageService.UploadReceipt(c.Request.Context(), file)
		if err != nil {
			return fmt.Errorf("failed to upload to cloud: %w", err)
		}

		// create verification record
		verification := models.Verification{
			ReviewID: review.ID,
			Type:     "receipt",
			ImageURL: imageURL,
			Status:   "pending",
		}

		if err := tx.Create(&verification).Error; err != nil {
			return fmt.Errorf("failed to create verification: %w", err)
		}

		// mark review as verified
		review.IsVerified = true
		if err := tx.Save(&review).Error; err != nil {
			return fmt.Errorf("failed to update review: %w", err)
		}

		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"code":    403,
				"message": "unauthorized",
			})
			return
		}
		if err.Error() == "please upload a file" || err.Error() == "only jpg/png allowed" || err.Error() == "file too large, max 5MB" {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    201,
		"message": "uploaded successfully",
	})
}

// GetByReview shows verification for a review
func (h *VerificationHandler) GetByReview(c *gin.Context) {
	reviewID := c.Param("reviewId")
	userID := middleware.GetUserID(c)

	// verify ownership
	var review models.Review
	result := h.db.Where("id = ? AND user_id = ?", reviewID, userID).First(&review)
	if result.Error != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"code":    403,
			"message": "unauthorized",
		})
		return
	}

	// find verification
	var verification models.Verification
	result = h.db.Where("review_id = ?", reviewID).First(&verification)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "verification not found",
		})
		return
	}

	c.JSON(http.StatusOK, verification)
}

// GPS check-in
type GPSCheckinRequest struct {
	ReviewID  uint    `json:"reviewId" binding:"required"`
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
}

func (h *VerificationHandler) GPSCheckin(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req GPSCheckinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"code":    400,
			"message": err.Error(),
		})
		return
	}

	var verification models.Verification
	err := h.db.Transaction(func(tx *gorm.DB) error {
		// verify that this review belongs to the current user
		var review models.Review
		if err := tx.Where("id = ? AND user_id = ?", req.ReviewID, userID).First(&review).Error; err != nil {
			return gorm.ErrRecordNotFound
		}

		// Get the restaurant position
		var restaurant models.Restaurant
		if err := tx.First(&restaurant, review.RestaurantID).Error; err != nil {
			return fmt.Errorf("restaurant not found")
		}

		// Compute the distance (allow 100-meter margin of error)
		distance := utils.Distance(req.Latitude, req.Longitude, restaurant.Latitude, restaurant.Longitude)
		if distance > 100 {
			return fmt.Errorf("too far from restaurant: %.0f meters", distance)
		}

		// Create verification record
		verification = models.Verification{
			ReviewID:     req.ReviewID,
			Type:         models.VerificationGPS,
			GPSLatitude:  req.Latitude,
			GPSLongitude: req.Longitude,
			Status:       models.StatusApproved,
		}
		if err := tx.Create(&verification).Error; err != nil {
			return fmt.Errorf("failed to create verification")
		}

		// update the status of review
		review.IsVerified = true
		if err := tx.Save(&review).Error; err != nil {
			return fmt.Errorf("failed to update review")
		}

		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(403, gin.H{
				"code":    403,
				"message": "unauthorized",
			})
			return
		}
		if err.Error() == "failed to create verification" || err.Error() == "failed to update review" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code":    500,
				"message": err.Error(),
			})
			return
		}
		c.JSON(400, gin.H{
			"code":    400,
			"message": err.Error(),
		})
		return
	}

	// asynchronous trigger of trust score recalculation
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("UpdateUserTrustScore panic recovered: %v", r)
			}
		}()
		if err := h.searchService.UpdateUserTrustScore(userID); err != nil {
			log.Printf("Failed to update trust score for user %d: %v", userID, err)
		}
	}()

	c.JSON(200, verification)
}
