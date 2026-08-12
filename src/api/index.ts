import axios from 'axios';
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  Review,
  CreateReviewRequest,
  Verification,
  SearchRequest,
  SearchResponse,
  GPSCheckinRequest,
} from '../types';

const API_BASE_URL = '/backend-api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  });

// POST /api/auth/register
export const register = (data: RegisterRequest) => {
  return api.post('/auth/register', data);
};

// POST /api/auth/login
export const login = (data: LoginRequest) => {
  return api.post<AuthResponse>('/auth/login', data);
};

// GET /api/me
export const getMe = () => {
  return api.get<User>('/profile');
};

// POST /api/reviews
export const createReview = (data: CreateReviewRequest) => {
  return api.post<Review>('/reviews', data);
};

// GET /api/restaurants/:id/reviews
export const getRestaurantReviews = (restaurantId: string) => {
  return api.get<Review[]>(`/restaurants/${restaurantId}/reviews`);
};

// GET /api/reviews/me
export const getMyReviews = () => {
  return api.get<Review[]>('/reviews/profile');
};

// PUT /api/reviews/:id
export const updateReview = (id: number, data: CreateReviewRequest) => {
  return api.put<Review>(`/reviews/${id}`, data);
};

// DELETE /api/reviews/:id
export const deleteReview = (id: number) => {
  return api.delete(`/reviews/${id}`);
};

// GET /api/search/restaurants
export const searchRestaurants = (params: SearchRequest) => {
  return api.get<SearchResponse>('/search/restaurants', { params });
};

// GET /api/search/cuisines
export const getCuisineTypes = () => {
  return api.get('/search/cuisines');
};

// POST /api/verifications/upload
export const uploadReceipt = (reviewId: number, file: File) => {
  const formData = new FormData();
  formData.append('reviewId', reviewId.toString());
  formData.append('receipt', file);
  return api.post<Verification>('/verifications/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// GET /api/reviews/:reviewId/verification
export const getVerification = (reviewId: number) => {
  return api.get<Verification>(`/reviews/${reviewId}/verification`);
};

// POST /api/verifications/gps
export const gpsCheckin = (data: GPSCheckinRequest) => {
  return api.post<Verification>('/verifications/gps', data);
};

// POST /api/wishlist
export const addToWishlist = (restaurantId: string, notes?: string, tags?: string[]) => {
  return api.post('/wishlist', { restaurant_id: restaurantId, notes, tags });
};

// GET /api/wishlist
export const getWishlist = () => {
  return api.get('/wishlist');
};

// POST /api/wishlist/:restaurant_id (remove)
export const removeFromWishlist = (restaurantId: string) => {
  return api.post(`/wishlist/${restaurantId}`);
};

export const getRestaurantByPlaceId = (placeId: string) => {
  return api.get(`/restaurants/place/${placeId}`);
};

export default api;