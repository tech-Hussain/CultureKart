/**
 * Unified Authentication Middleware
 * Supports both Firebase OAuth and JWT (email/password) authentication
 */

const verifyFirebaseToken = require('./verifyFirebaseToken');
const verifyJWT = require('./verifyJWT');
const User = require('../models/User');

/**
 * Unified authentication middleware
 * Automatically detects and verifies Firebase or JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Authenticate middleware - Headers:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header or invalid format');
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token length:', token.length);

    // Try to determine token type
    // JWT tokens have 3 parts separated by dots
    // Firebase tokens are longer and have different structure
    const isJWT = token.split('.').length === 3 && token.length < 500;
    console.log('🔍 Token type:', isJWT ? 'JWT' : 'Firebase');

    if (isJWT) {
      // Try JWT verification first
      return verifyJWT(req, res, next);
    } else {
      // Try Firebase token verification
      return verifyFirebaseToken(req, res, next);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
};

/**
 * Get current authenticated user profile
 * Works with both Firebase and JWT authentication
 */
const getCurrentUser = async (req, res) => {
  try {
    let user;

    if (req.user.authProvider === 'firebase-oauth') {
      // Firebase user
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      // Email/password user
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const userProfile = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      authProvider: user.authProvider,
      profile: user.profile,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};

module.exports = { authenticate, getCurrentUser };
