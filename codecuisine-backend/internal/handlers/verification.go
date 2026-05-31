package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"codecuisine-backend/internal/middleware"
	"codecuisine-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// VerificationHandler handles receipt uploads
type VerificationHandler struct {
	db *gorm.DB
}

// NewVerificationHandler creates handler
func NewVerificationHandler(db *gorm.DB) *VerificationHandler {
	return &VerificationHandler{db: db}
}

// UploadReceipt saves receipt image
func (h *VerificationHandler) UploadReceipt(c *gin.Context) {
	userID := middleware.GetUserID(c)
	reviewID := c.PostForm("reviewId")

	// verify review belongs to user
	var review models.Review
	result := h.db.Where("id = ? AND user_id = ?", reviewID, userID).First(&review)
	if result.Error != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	// get uploaded file
	file, err := c.FormFile("receipt")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "please upload a file"})
		return
	}

	// check file extension
	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only jpg/png allowed"})
		return
	}

	// check file size (5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large, max 5MB"})
		return
	}

	// create upload directory
	os.MkdirAll("uploads/receipts", os.ModePerm)

	// save with unique name
	filename := fmt.Sprintf("uploads/receipts/%d_%d%s", userID, time.Now().UnixNano(), ext)
	if err := c.SaveUploadedFile(file, filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	// create verification record
	verification := models.Verification{
		ReviewID: review.ID,
		Type:     "receipt",
		ImageURL: filename,
		Status:   "pending",
	}

	if result := h.db.Create(&verification); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create verification"})
		return
	}

	// mark review as verified
	review.IsVerified = true
	h.db.Save(&review)

	c.JSON(http.StatusCreated, verification)
}

// GetByReview shows verification for a review
func (h *VerificationHandler) GetByReview(c *gin.Context) {
	reviewID := c.Param("reviewId")
	userID := middleware.GetUserID(c)

	// verify ownership
	var review models.Review
	result := h.db.Where("id = ? AND user_id = ?", reviewID, userID).First(&review)
	if result.Error != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
		return
	}

	// find verification
	var verification models.Verification
	result = h.db.Where("review_id = ?", reviewID).First(&verification)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "verification not found"})
		return
	}

	c.JSON(http.StatusOK, verification)
}
