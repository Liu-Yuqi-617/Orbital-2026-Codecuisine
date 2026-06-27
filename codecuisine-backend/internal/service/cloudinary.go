package service

import (
	"context"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type ImageService struct {
	cl *cloudinary.Cloudinary
}

func NewImageService(cloudName, apiKey, apiSecret string) (*ImageService, error) {
	cl, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, err
	}
	return &ImageService{cl: cl}, nil
}

// UploadReceipt directly receives multipart.FileHeader, no need to save locally first
func (s *ImageService) UploadReceipt(ctx context.Context, fileHeader *multipart.FileHeader) (string, error) {
	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	resp, err := s.cl.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:       "codecuisine/receipts",
		ResourceType: "image",
		// Optional: limit image size to reduce storage
		// Transformation: "w_1200,q_auto",
	})
	if err != nil {
		return "", err
	}
	return resp.SecureURL, nil
}
