package handlers

import (
	"net/http"

	"codecuisine-backend/internal/dto"
	"codecuisine-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type SearchLocalHandler struct {
	syncService *service.RestaurantSyncService
}

func NewSearchLocalHandler(syncService *service.RestaurantSyncService) *SearchLocalHandler {
	return &SearchLocalHandler{syncService: syncService}
}

func (h *SearchLocalHandler) SearchLocal(c *gin.Context) {
	var req dto.SearchRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Radius == 0 {
		req.Radius = 5000
	}
	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 10
	}

	result, err := h.syncService.SearchFromLocalDB(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
