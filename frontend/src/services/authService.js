import { 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { setAuthToken } from '../api/api';
import api from '../api/api';

/**
 * Sign in with Google using Firebase
 * @returns {Promise<Object>} User data with Firebase token
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get Firebase ID token
    const token = await user.getIdToken();
    
    // Store token in localStorage
    setAuthToken(token);
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      token,
      authProvider: 'firebase-oauth',
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Register with email and password (Backend handles user creation)
 * @param {Object} userData - { email, password, name, role }
 * @returns {Promise<Object>} Response data with requiresVerification flag
 */
export const registerWithEmail = async (userData) => {
  try {
    const { email, password, name, role } = userData;

    // Call backend API to register user
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      role: role || 'user',
    });

    if (response.data.success) {
      // Check if verification is required
      if (response.data.requiresVerification) {
        return {
          requiresVerification: true,
          pendingRegistration: response.data.pendingRegistration,
          message: response.data.message,
        };
      } else {
        // Direct registration (shouldn't happen with new flow)
        const { user, token } = response.data;
        setAuthToken(token, 'jwt');
        return {
          ...user,
          token,
          authProvider: 'email-password',
        };
      }
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Error registering with email:', error);
    throw error.response?.data || error;
  }
};

/**
 * Verify OTP for email registration
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} User data with JWT token
 */
export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', {
      email,
      otp,
    });

    if (response.data.success) {
      const { user, token } = response.data;
      
      // Store JWT token
      setAuthToken(token, 'jwt');
      
      return {
        ...user,
        token,
        authProvider: 'email-password',
      };
    } else {
      throw new Error(response.data.message || 'OTP verification failed');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error.response?.data || error;
  }
};

/**
 * Resend OTP for email verification
 * @param {string} email - User's email
 * @returns {Promise<Object>} Success response
 */
export const resendOTP = async (email) => {
  try {
    const response = await api.post('/auth/resend-otp', {
      email,
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to resend OTP');
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error.response?.data || error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User data with JWT token
 */
export const signInWithEmail = async (email, password) => {
  try {
    // Call backend API to login
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      const { user, token } = response.data;
      
      // Store JWT token
      setAuthToken(token, 'jwt');
      
      return {
        ...user,
        token,
        authProvider: 'email-password',
      };
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error.response?.data || error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    setAuthToken(null); // Clear token from localStorage
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in with Firebase, get fresh token
      const token = await user.getIdToken();
      setAuthToken(token);
      
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
        authProvider: 'firebase-oauth',
      });
    } else {
      // Check if user has JWT token (email/password auth)
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        // User might be logged in with email/password
        // Token is already set, callback will be handled by context
        callback(null); // Let the app check with backend
      } else {
        // User is completely signed out
        setAuthToken(null);
        callback(null);
      }
    }
  });
};

/**
 * Get current user profile from backend
 * Works with both Firebase and JWT authentication
 * @returns {Promise<Object|null>}
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data.success) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Get the current user's ID token
 * @returns {Promise<string|null>}
 */
export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
