package middleware

import (
	"net/http"
	"strings"

	"codecuisine-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

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
		c.Next()
	}
}

// GetUserID extracts user id from context
func GetUserID(c *gin.Context) uint {
	userID, _ := c.Get("userID")
	return userID.(uint)
}
