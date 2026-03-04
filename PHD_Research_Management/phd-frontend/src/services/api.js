import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000',
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // only redirect to login if 401 happen(after successfull login)
    // Dont redirect for login attempts - let the login page handle it
    if (error.response?.status === 401 && error.config.url !== '/api/auth/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;