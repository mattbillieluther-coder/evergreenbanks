import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(15); // Default 15 minutes

  // Function to check if user session is valid
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/session', { withCredentials: true });
      
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        setSessionTimeout(res.data.sessionTimeout || 15);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password }, { withCredentials: true });
      
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        setSessionTimeout(res.data.sessionTimeout || 15);
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Session activity tracking
  useEffect(() => {
    if (isAuthenticated) {
      let inactivityTimer;
      
      // Reset timer on user activity
      const resetTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        
        // Set timeout based on session timeout setting (convert minutes to ms)
        inactivityTimer = setTimeout(() => {
          logout();
        }, sessionTimeout * 60 * 1000);
      };
      
      // Events to track user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      // Add event listeners
      events.forEach(event => {
        document.addEventListener(event, resetTimer);
      });
      
      // Initial timer
      resetTimer();
      
      // Cleanup
      return () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        events.forEach(event => {
          document.removeEventListener(event, resetTimer);
        });
      };
    }
  }, [isAuthenticated, sessionTimeout, logout]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};