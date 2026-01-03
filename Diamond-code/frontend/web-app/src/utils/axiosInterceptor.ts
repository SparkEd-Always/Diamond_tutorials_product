import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

// Configure axios baseURL from environment variable
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API URL:', axios.defaults.baseURL);

/**
 * Axios Response Interceptor
 * Handles 401 Unauthorized errors globally
 * Automatically logs out user and redirects to login on token expiry
 */
axios.interceptors.response.use(
  (response) => {
    // Pass through successful responses
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401) {
      // Get current path to avoid infinite loops on login page
      const currentPath = window.location.pathname;

      // Only logout if not already on login page
      if (currentPath !== '/login') {
        console.log('Token expired or invalid - logging out user');

        // Dispatch logout action to clear state and localStorage
        store.dispatch(logout());

        // Redirect to login page
        window.location.href = '/login?session_expired=true';
      }
    }

    // Pass through other errors to be handled by components
    return Promise.reject(error);
  }
);

export default axios;
