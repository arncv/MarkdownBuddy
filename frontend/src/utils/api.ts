import axios from 'axios';

// Enable debug logging based on environment variable
const DEBUG = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add authorization header to every request if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(import.meta.env.VITE_AUTH_STORAGE_KEY || 'auth_token');
  
  if (DEBUG) {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      token: token ? 'exists' : 'missing'
    });
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  if (DEBUG) {
    console.error('API Request Error:', error);
  }
  return Promise.reject(error);
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (DEBUG) {
      console.error('API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(import.meta.env.VITE_AUTH_STORAGE_KEY || 'auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;