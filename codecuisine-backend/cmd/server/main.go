package main

import (
	"codecuisine-backend/internal/config"
	"codecuisine-backend/internal/database"
	"codecuisine-backend/internal/handlers"
	"codecuisine-backend/internal/middleware"
	"codecuisine-backend/internal/service"
	"log"

	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	// load env files
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: .env file not found, using system env")
	}

	// load configuration from environment variables
	cfg := config.Load()

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

	// get apiKey from environment
	apiKey := os.Getenv("GOOGLE_PLACES_API_KEY")
	if apiKey == "" {
		log.Fatal("GOOGLE_PLACES_API_KEY environment variable is required")
	}

	searchService := service.NewSearchService(db, apiKey)

	// start cache cleanup (once an hour automatically)
	go service.StartCacheCleanup(searchService)

	// all api routes start with /api
	api := r.Group("/api")
	{
		// create handlers
		imageService, err := service.NewImageService(
			os.Getenv("CLOUDINARY_CLOUD_NAME"),
			os.Getenv("CLOUDINARY_API_KEY"),
			os.Getenv("CLOUDINARY_API_SECRET"),
		)
		if err != nil {
			log.Fatal("failed to init cloudinary:", err)
		}

		authHandler := handlers.NewAuthHandler(db, cfg.JWTSecret)
		reviewHandler := handlers.NewReviewHandler(db, searchService)
		verificationHandler := handlers.NewVerificationHandler(db, searchService, imageService)
		searchHandler := handlers.NewSearchHandler(service.NewSearchService(db, apiKey))
		wishlistHandler := handlers.NewWishlistHandler(db)

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
			protected.GET("/search/restaurants", searchHandler.SearchRestaurants)
			protected.GET("/search/cuisines", searchHandler.GetCuisineTypes)
			protected.POST("/verifications/gps", verificationHandler.GPSCheckin)
			protected.POST("/wishlist", wishlistHandler.AddToWishlist)
			protected.GET("/wishlist", wishlistHandler.GetWishlist)
			protected.POST("/wishlist//:restaurant_id", wishlistHandler.RemoveFromWishlist)
		}
	}

	// start server
	r.Run(cfg.ServerAddr)
}
