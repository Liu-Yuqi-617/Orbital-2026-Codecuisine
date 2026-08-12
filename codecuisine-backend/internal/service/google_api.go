package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

type GooglePlacesClient struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client
}

type RestaurantResult struct {
	PlaceID    string   `json:"place_id"`
	Name       string   `json:"name"`
	Address    string   `json:"vicinity"`
	Lat        float64  `json:"lat"`
	Lng        float64  `json:"lng"`
	Types      []string `json:"types"`
	PriceLevel int      `json:"price_level"`
	Phone      string   `json:"formatted_phone_number"`
	Website    string   `json:"website"`
	PhotoURL   string   `json:"-"`
	Rating     float64  `json:"rating"`
}

func NewGooglePlacesClient(apiKey string) *GooglePlacesClient {
	return &GooglePlacesClient{
		apiKey:  apiKey,
		baseURL: "https://maps.googleapis.com/maps/api/place",
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// Search nearby restaurants
func (c *GooglePlacesClient) SearchNearby(ctx context.Context, lat, lng float64, radius int, keyword string) ([]RestaurantResult, error) {
	endpoint := fmt.Sprintf("%s/nearbysearch/json", c.baseURL)

	params := url.Values{}
	params.Set("location", fmt.Sprintf("%f,%f", lat, lng))
	params.Set("radius", fmt.Sprintf("%d", radius))
	params.Set("type", "restaurant")
	params.Set("key", c.apiKey)
	if keyword != "" {
		params.Set("keyword", keyword)
	}

	reqURL := fmt.Sprintf("%s?%s", endpoint, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Results []struct {
			PlaceID  string `json:"place_id"`
			Name     string `json:"name"`
			Vicinity string `json:"vicinity"`
			Geometry struct {
				Location struct {
					Lat float64 `json:"lat"`
					Lng float64 `json:"lng"`
				} `json:"location"`
			} `json:"geometry"`
			Types      []string `json:"types"`
			PriceLevel int      `json:"price_level"`
			Photos     []struct {
				PhotoReference string `json:"photo_reference"`
			} `json:"photos"`
			Rating float64 `json:"rating"`
		} `json:"results"`
		Status string `json:"status"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if result.Status != "OK" && result.Status != "ZERO_RESULTS" {
		return nil, fmt.Errorf("Google Places API error: %s", result.Status)
	}

	var places []RestaurantResult
	for _, r := range result.Results {
		photoURL := ""
		if len(r.Photos) > 0 {
			photoURL = c.buildPhotoURL(r.Photos[0].PhotoReference)
		}

		places = append(places, RestaurantResult{
			PlaceID:    r.PlaceID,
			Name:       r.Name,
			Address:    r.Vicinity,
			Lat:        r.Geometry.Location.Lat,
			Lng:        r.Geometry.Location.Lng,
			Types:      r.Types,
			PriceLevel: r.PriceLevel,
			PhotoURL:   photoURL,
			Rating:     r.Rating,
		})
	}

	return places, nil
}

// GetPlaceDetails
func (c *GooglePlacesClient) GetPlaceDetails(ctx context.Context, placeID string) (*RestaurantResult, error) {
	endpoint := fmt.Sprintf("%s/details/json", c.baseURL)

	params := url.Values{}
	params.Set("place_id", placeID)
	params.Set("fields", "name,formatted_phone_number,website,price_level")
	params.Set("key", c.apiKey)

	reqURL := fmt.Sprintf("%s?%s", endpoint, params.Encode())

	req, _ := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Result struct {
			Name       string `json:"name"`
			Phone      string `json:"formatted_phone_number"`
			Website    string `json:"website"`
			PriceLevel int    `json:"price_level"`
		} `json:"result"`
		Status string `json:"status"`
	}

	// Add error check for json.Decode
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode place details response: %w", err)
	}

	if result.Status != "OK" {
		return nil, fmt.Errorf("place details error: %s", result.Status)
	}

	return &RestaurantResult{
		Name:       result.Result.Name,
		Phone:      result.Result.Phone,
		Website:    result.Result.Website,
		PriceLevel: result.Result.PriceLevel,
	}, nil
}

func (c *GooglePlacesClient) buildPhotoURL(photoRef string) string {
	return fmt.Sprintf(
		"%s/photo?maxwidth=400&photoreference=%s&key=%s",
		c.baseURL, photoRef, c.apiKey,
	)
}
