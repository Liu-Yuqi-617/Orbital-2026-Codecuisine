package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims is the data stored inside jwt token
type Claims struct {
	UserID   uint   `json:"userId"`   // user's id
	Username string `json:"username"` // user's name
	jwt.RegisteredClaims
}

// GenerateToken creates a new jwt for a user
func GenerateToken(userID uint, username, secret string) (string, error) {
	// set expiration to 24 hours
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// sign with secret key
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken validates and extracts data from jwt
func ParseToken(tokenString, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	// extract custom claims
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}
