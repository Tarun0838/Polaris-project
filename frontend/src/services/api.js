import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 25000
});

// Request interceptor to add bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vyom_token') || localStorage.getItem('polaris_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token expiration
    }
    return Promise.reject(error);
  }
);

export default api;
