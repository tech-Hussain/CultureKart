/**
 * Authentication Context
 * Manages global authentication state across the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../services/authService';

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
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
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
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      localStorage.removeItem('user');
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
