package models

import "time"

type VerificationType string

const (
	// verification via uploaded receipt or invoice.
	VerificationReceipt VerificationType = "receipt"
	// verification via geographic coordinates.
	VerificationGPS VerificationType = "gps"
	// verification via EXIF or other photo metadata.
	VerificationPhotoMetadata VerificationType = "photo_metadata"
)

type VerificationStatus string

const (
	// the verification is submitted and awaiting review.
	StatusPending VerificationStatus = "pending"
	// the verification has been accepted.
	StatusApproved VerificationStatus = "approved"
	// the verification has been declined.
	StatusRejected VerificationStatus = "rejected"
)

// Verification stores verification details for a review, supporting multiple verification methods.
type Verification struct {
	ID uint `gorm:"primaryKey" json:"id"`

	// ReviewID is the associated review ID
	ReviewID uint `gorm:"not null;uniqueIndex" json:"reviewId"`

	// Type specifies the verification method
	Type VerificationType `gorm:"size:20;not null" json:"type"`

	// ImageURL is the URL of the uploaded verification image
	ImageURL string `gorm:"size:500" json:"imageUrl"`

	// GPSLatitude is the latitude coordinate for GPS-based verification.
	GPSLatitude float64 `json:"gpsLatitude"`

	// GPSLongitude is the longitude coordinate for GPS-based verification.
	GPSLongitude float64 `json:"gpsLongitude"`

	// Status is the current review status
	Status VerificationStatus `gorm:"default:'pending'" json:"status"`

	// ProcessedAt is the timestamp when the verification was reviewed
	ProcessedAt *time.Time `json:"processedAt"`

	// CreatedAt is the record creation timestamp
	CreatedAt time.Time `json:"createdAt"`

	// Review is the associated review model, linked by ReviewID foreign key.
	Review Review `gorm:"foreignKey:ReviewID" json:"-"`
}
