/**
 * Global Axios Instance
 * Configured with base URL and authentication
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor
 * Automatically adds authentication token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('firebaseToken');

    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error responses
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Log error
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`);

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.warn('⚠️ Unauthorized. Clearing authentication...');
          localStorage.removeItem('firebaseToken');
          localStorage.removeItem('user');
          
          // Only redirect if not already on auth page
          if (!window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.warn('⚠️ Access denied:', data.message);
          break;

        case 404:
          // Not found
          console.warn('⚠️ Resource not found');
          break;

        case 500:
          // Server error
          console.error('❌ Server error:', data.message);
          break;

        default:
          console.error('❌ Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from server. Check your internet connection.');
    } else {
      // Error in request setup
      console.error('❌ Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to set auth token
 * @param {string} token - Firebase ID token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('firebaseToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('firebaseToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Helper function to clear auth token
 */
export const clearAuthToken = () => {
  localStorage.removeItem('firebaseToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Authentication API
 */

/**
 * Verify Firebase token and login/register user
 * @param {string} token - Firebase ID token
 * @returns {Promise} User profile data
 */
export const loginUser = async (token) => {
  try {
    const response = await api.post('/auth/verify', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Store user data in localStorage
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} Updated user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.patch('/auth/profile', profileData);
    
    // Update user data in localStorage
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export default api;
