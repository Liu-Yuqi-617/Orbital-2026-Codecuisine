package models

// Photo struct represents a restaurant photo with metadata
type Photo struct {
	// Unique identifier for each photo record in the database
	ID uint `gorm:"primaryKey" json:"id"`

	// Foreign key linking this photo to a specific restaurant
	RestaurantID uint `gorm:"index;not null" json:"restaurantId"`

	// Direct URL to the image file
	URL string `gorm:"size:500;not null" json:"url"`

	// Image width in pixels
	Width int `json:"width"`

	// Image height in pixels
	Height int `json:"height"`

	// Photo credit / copyright attribution text
	// Required by Google Places API terms of service when displaying their photos
	Attribution string `gorm:"size:255" json:"attribution"`

	// Display order priority (0 = first/cover image, higher numbers = later in gallery)
	// Used for sorting in gallery views and carousel displays
	SortOrder int `gorm:"default:0" json:"sortOrder"`

	// Belongs-to association: links back to the parent restaurant
	// foreignKey:RestaurantID tells GORM which field owns the relationship
	Restaurant Restaurant `gorm:"foreignKey:RestaurantID" json:"-"`
}
