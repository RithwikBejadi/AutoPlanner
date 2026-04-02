import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await api.getCurrentUser();
      
      if (!userData && window.location.pathname !== '/login') {
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('error');
        const loginPath = oauthError ? `/login?error=${encodeURIComponent(oauthError)}` : '/login';
        navigate(loginPath, { replace: true });
        return;
      }
      
      setUser(userData);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.message);
      }
      setUser(null);
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
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
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      navigate('/login', { replace: true });
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
