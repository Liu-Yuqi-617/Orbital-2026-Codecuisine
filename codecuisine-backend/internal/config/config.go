package config

import "fmt"

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

// Load returns hardcoded config
func Load() *Config {
	return &Config{
		DBHost:     "localhost",
		DBPort:     "3306",
		DBUser:     "root",
		DBPassword: "123456",
		DBName:     "codecuisine",
		JWTSecret:  "my-secret-key",
		ServerAddr: ":8080",
	}
}

// DSN builds mysql connection string
func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&allowNativePasswords=true",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}
