package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"codecuisine-backend/internal/dto"
	"codecuisine-backend/internal/service"
	"codecuisine-backend/pkg/utils"

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
	cuisines := utils.GetAllCuisineTypes()
	c.JSON(http.StatusOK, cuisines)
}

// GetRestaurantByPlaceID gets restaurant details by place_id
func (h *SearchHandler) GetRestaurantByPlaceID(c *gin.Context) {
	placeID := c.Param("placeId")

	if placeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "place_id is required",
		})
		return
	}

	restaurant, err := h.searchService.GetRestaurantByPlaceID(c.Request.Context(), placeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "success",
		"data":    restaurant,
	})
}

// GetRestaurantByID gets restaurant details by local id
func (h *SearchHandler) GetRestaurantByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid restaurant id",
		})
		return
	}

	restaurant, err := h.searchService.GetRestaurantByID(c.Request.Context(), uint(id))
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{
				"code":    404,
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

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "success",
		"data":    restaurant,
	})
}
