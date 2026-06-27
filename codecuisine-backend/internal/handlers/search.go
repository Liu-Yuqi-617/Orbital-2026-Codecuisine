package handlers

import (
	"net/http"

	"codecuisine-backend/internal/dto"
	"codecuisine-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	searchService *service.SearchService
}

func NewSearchHandler(searchService *service.SearchService) *SearchHandler {
	return &SearchHandler{searchService: searchService}
}

// RegisterRoutes registers search-related routes
func (h *SearchHandler) RegisterRoutes(r *gin.RouterGroup) {
	search := r.Group("/search")
	{
		search.GET("/restaurants", h.SearchRestaurants)
		search.GET("/cuisines", h.GetCuisineTypes) // Get available cuisine types list
	}
}

// SearchRestaurants handles restaurant search requests
func (h *SearchHandler) SearchRestaurants(c *gin.Context) {
	var req dto.SearchRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.searchService.Search(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetCuisineTypes retrieves distinct cuisine types from the database
func (h *SearchHandler) GetCuisineTypes(c *gin.Context) {
	var cuisines []string
	c.JSON(http.StatusOK, gin.H{"cuisines": cuisines})
}
