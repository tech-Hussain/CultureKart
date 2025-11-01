import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { setAuthToken } from '../api/api';

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
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
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
      // User is signed in, get fresh token
      const token = await user.getIdToken();
      setAuthToken(token);
      
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
      });
    } else {
      // User is signed out
      setAuthToken(null);
      callback(null);
    }
  });
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
