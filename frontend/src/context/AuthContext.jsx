import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await api.getCurrentUser();
      
      if (!userData && window.location.pathname !== '/login') {
        window.location.href = '/login';
        return;
      }
      
      setUser(userData);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.message);
      }
      setUser(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout: handleLogout,
    isAuthenticated: !!user,
    refetchUser: fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
