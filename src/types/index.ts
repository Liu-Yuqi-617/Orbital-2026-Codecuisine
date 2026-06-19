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
}

export interface CreateReviewRequest {
  restaurantId: number;
  tasteRating: number;
  valueRating: number;
  ambianceRating: number;
  title: string;
  body: string;
}

// Verification types
export interface Verification {
  id: number;
  reviewId: number;
  type: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

// Restaurant types
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  cuisineType: string;
  priceRange: number;
}