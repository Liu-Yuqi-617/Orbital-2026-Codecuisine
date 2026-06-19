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

	db = db.Debug()

	if err := db.AutoMigrate(&models.User{}); err != nil {
		return nil, fmt.Errorf("migrate User failed: %w", err)
	}

	if err := db.AutoMigrate(&models.Restaurant{}); err != nil {
		return nil, fmt.Errorf("migrate Restaurant failed: %w", err)
	}

	if err := db.AutoMigrate(&models.Review{}); err != nil {
		return nil, fmt.Errorf("migrate Review failed: %w", err)
	}

	if err := db.AutoMigrate(&models.Photo{}); err != nil {
		return nil, fmt.Errorf("migrate Photo failed: %w", err)
	}

	if err := db.AutoMigrate(&models.Verification{}); err != nil {
		return nil, fmt.Errorf("migrate Verification failed: %w", err)
	}

	return db, nil
}
