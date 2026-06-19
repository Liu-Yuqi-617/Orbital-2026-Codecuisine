package middleware

import (
	"net/http"
	"strings"

	"codecuisine-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// CORS middleware allows frontend requests from different origins
func CORS() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Allow all origins
		ctx.Header("Access-Control-Allow-Origin", "*")

		// Allow custom headers
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Allow HTTP methods
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Cache preflight request for 24 hours
		ctx.Header("Access-Control-Max-Age", "86400")

		// Handle the pre-check request for OPTIONS
		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204) // No Content
			return
		}

		ctx.Next()
	}
}

// JWTAuth checks if request has valid token
func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// get auth header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		// split "Bearer token"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

		// validate token
		claims, err := utils.ParseToken(parts[1], secret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// store user info in context for handlers
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)

		c.Next()
	}
}

// GetUserID extracts user id from context
func GetUserID(c *gin.Context) uint {
	userID, _ := c.Get("userID")
	return userID.(uint)
}
