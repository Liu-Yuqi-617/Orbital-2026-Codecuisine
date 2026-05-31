package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all app settings
type Config struct {
	DBHost     string // database host
	DBPort     string // database port
	DBUser     string // database username
	DBPassword string // database password
	DBName     string // database name
	JWTSecret  string // secret key for jwt
	ServerAddr string // server listen address
}

// Load reads config from environment variables
func Load() *Config {
	// load .env file if exists
	godotenv.Load()

	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "codecuisine"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "codecuisine_db"),
		JWTSecret:  getEnv("JWT_SECRET", "my-secret-key"),
		ServerAddr: getEnv("SERVER_ADDR", ":8080"),
	}
}

// DSN builds mysql connection string
func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

// getEnv reads env var, returns fallback if not set
func getEnv(key, fallback string) string {
	v := os.Getenv(key)
	if v != "" {
		return v
	}
	return fallback
}
