/**
 * JWT Token Verification Middleware
 * Verifies JWT tokens for email/password authenticated users
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 * Expects Authorization: Bearer <jwtToken>
 * Sets req.user with decoded token data and full user object
 */
const verifyJWT = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header must be in format: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // Attach user data to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      fullUser: user, // Full user object for additional data
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    console.error('JWT verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message,
    });
  }
};

module.exports = verifyJWT;
