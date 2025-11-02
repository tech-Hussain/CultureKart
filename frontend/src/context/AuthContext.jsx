/**
 * Authentication Context
 * Manages global authentication state across the app
 * Supports both Firebase OAuth and Email/Password (JWT) authentication
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUserProfile } from '../services/authService';

const AuthContext = createContext(null);

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // Check for JWT token (email/password auth)
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        // User logged in with email/password, fetch profile from backend
        try {
          const userProfile = await getCurrentUserProfile();
          if (userProfile && isMounted) {
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Token might be expired or invalid, clear it
          if (isMounted) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      // Check for Firebase auth or initialize Firebase listener
      const unsubscribe = onAuthStateChange((firebaseUser) => {
        if (!isMounted) return;

        if (firebaseUser) {
          // Get user data from localStorage (set by backend after login)
          const userDataStr = localStorage.getItem('user');
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              setUser(userData);
            } catch (error) {
              console.error('Error parsing user data:', error);
              setUser(null);
            }
          }
        } else {
          // No Firebase user
          setUser(null);
        }
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => {
        isMounted = false;
        unsubscribe();
      };
    };

    initAuth();
  }, []);

  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('firebaseToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
export default AuthContext;
