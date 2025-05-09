import axios from 'axios';

// Get the environment variable or use a default value
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create the axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Constants for storage keys
const TOKEN_STORAGE_KEY = 'vision_tech_token';
const TOKEN_EXPIRY_KEY = 'vision_tech_token_expiry';

// Utility function to check if token is expired
const isTokenExpired = (): boolean => {
  const expiryString = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryString) return true;

  const expiry = new Date(expiryString);
  return new Date() > expiry;
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    // If token exists and is not expired, add it to headers
    if (token && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      // Token exists but is expired, clear it
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);

      // Only redirect if not already heading to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);

      // Only redirect if not already heading to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions for auth token management
export const setAuthToken = (token: string, expiresIn: number): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  // Calculate expiry time and store it
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export default axiosInstance;