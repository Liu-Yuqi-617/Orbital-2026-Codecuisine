// User types
export interface User {
  id: number;
  username: string;
  email: string;
  trustScore: number;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    username: string;
    email: string;
  }
}

// Review types
export interface Review {
  id: number;
  userId: number;
  restaurantId: number;
  tasteRating: number;
  valueRating: number;
  ambianceRating: number;
  title: string;
  body: string;
  isVerified: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  restaurant?: SimpleRestaurant;
  verification?: Verification;
}

export interface CreateReviewRequest {
  restaurantId: number;
  tasteRating: number;
  valueRating: number;
  ambianceRating: number;
  title: string;
  body: string;
}

// Search types
export interface SearchRequest {
  query?: string;
  lat: number;
  lng: number;
  radius?: number;
  cuisine?: string;
  price_level?: number;
  min_score?: number;
  verified_only?: boolean;
  sort_by?: 'composite' | 'trust' | 'distance' | 'popularity';
  page?: number;
  page_size?: number;
}

export interface SimpleRestaurant {
  id: number;
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  cuisine_type: string;
  price_level: number;
  photo_url: string;
  distance: number;
  avg_taste: number;
  avg_value: number;
  avg_ambiance: number;
  composite_score: number;
  trust_weighted_score: number;
  verified_review_count: number;
  total_review_count: number;
}

export interface SearchResponse {
  total: number;
  page: number;
  page_size: number;
  restaurants: SimpleRestaurant[];
}

// Verification types
export interface Verification {
  id: number;
  reviewId: number;
  type: 'receipt' | 'gps' | 'photo_metadata';
  imageUrl?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: string;
  createdAt: string;
}

export interface GPSCheckinRequest {
  reviewId: number;
  latitude: number;
  longitude: number;
}
