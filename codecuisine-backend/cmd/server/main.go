package main

import (
	"codecuisine-backend/internal/config"
	"codecuisine-backend/internal/database"
	"codecuisine-backend/internal/handlers"
	"codecuisine-backend/internal/middleware"

	"fmt"

	"github.com/gin-gonic/gin"
)

func main() {
	// load env variables
	cfg := config.Load()

	fmt.Println("DSN:", cfg.DSN())

	// connect to mysql
	db, err := database.Connect(cfg.DSN())
	if err != nil {
		// if db fails, crash immediately
		panic("database connection failed: " + err.Error())
	}

	// create gin router
	r := gin.Default()

	// enable CORS middleware
	r.Use(middleware.CORS())

	// all api routes start with /api
	api := r.Group("/api")
	{
		// create handlers
		authHandler := handlers.NewAuthHandler(db, cfg.JWTSecret)
		reviewHandler := handlers.NewReviewHandler(db)
		verificationHandler := handlers.NewVerificationHandler(db)

		// public routes - no login needed
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// public read routes
		api.GET("/restaurants/:id/reviews", reviewHandler.GetByRestaurant)
		api.GET("/reviews/:reviewId/verification", verificationHandler.GetByReview)

		// protected routes - need jwt token
		protected := api.Group("")
		protected.Use(middleware.JWTAuth(cfg.JWTSecret))
		{
			protected.GET("/profile", authHandler.GetMe)
			protected.POST("/reviews", reviewHandler.Create)
			protected.GET("/reviews/profile", reviewHandler.GetMyReviews)
			protected.PUT("/reviews/:id", reviewHandler.Update)
			protected.DELETE("/reviews/:id", reviewHandler.Delete)
			protected.POST("/verifications/upload", verificationHandler.UploadReceipt)
		}
	}

	// start server
	r.Run(cfg.ServerAddr)
}
