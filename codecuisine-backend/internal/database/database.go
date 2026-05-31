package database

import (
	"codecuisine-backend/internal/models"
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Connect establishes a connection to the MySQL database using the provided DSN,
// performs automatic schema migration, and creates necessary indexes.
func Connect(dsn string) (*gorm.DB, error) {
	// Open database connection with GORM MySQL driver
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// AutoMigrate creates or updates database tables to match the model structs
	err = db.AutoMigrate(
		&models.User{},
		&models.Restaurant{},
		&models.Review{},
		&models.Verification{},
		&models.Photo{},
	)
	if err != nil {
		return nil, fmt.Errorf("auto migration failed: %w", err)
	}

	// Create indexes to optimize common query patterns
	db.Exec("CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_reviews_is_verified ON reviews(is_verified)")

	return db, nil
}
