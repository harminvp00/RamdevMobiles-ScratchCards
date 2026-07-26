import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
});

// Interceptor to attach Authorization tokens
API.interceptors.request.use(
  (config) => {
    // If request goes to admin paths, attach admin token
    if (config.url.includes('/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Otherwise, attach regular customer token
      const customerToken = localStorage.getItem('customerToken');
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear invalid tokens
      if (error.config.url.includes('/admin/')) {
        localStorage.removeItem('adminToken');
      } else {
        localStorage.removeItem('customerToken');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
