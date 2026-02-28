import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ UPDATED: Validate token on app load
    const validateToken = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken) {
        try {
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // ✅ Try to make a simple API call to validate token
          // If token is expired, this will fail with 401
          await api.get('/api/auth/verify'); // We'll create this endpoint
          
          // Token is valid
          setUser(JSON.parse(savedUser));
        } catch (error) {
          // ✅ Token is invalid or expired - clear everything
          console.log('Token validation failed:', error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);

      return { success: true, user };
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error('Cannot connect to server');
      }

      if (error.response?.status === 401 || error.response?.status === 400) {
        throw new Error('Invalid email or password');
      }

      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};