/**
 * Role-Based Access Control Middleware
 * Checks if authenticated user has required role(s)
 */

const User = require('../models/User');

/**
 * Middleware factory to check user roles
 * @param {Array<String>} allowedRoles - Array of allowed roles (e.g., ['admin', 'artisan'])
 * @returns {Function} Express middleware
 */
const requireRole = (allowedRoles) => {
  // Validate input
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('requireRole middleware requires an array of allowed roles');
  }

  return async (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by verifyFirebaseToken middleware)
      if (!req.user || !req.user.uid) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Find user in database by Firebase UID
      const user = await User.findOne({ firebaseUid: req.user.uid });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found in database',
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({
          status: 'error',
          message: 'Your account has been deactivated',
        });
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          userRole: user.role,
        });
      }

      // Attach full user object to request for use in route handlers
      req.dbUser = user;

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      console.error('❌ Role check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking user permissions',
        error: error.message,
      });
    }
  };
};

/**
 * Convenience middleware for admin-only routes
 */
const requireAdmin = requireRole(['admin']);

/**
 * Convenience middleware for artisan-only routes
 */
const requireArtisan = requireRole(['artisan']);

/**
 * Convenience middleware for artisan or admin routes
 */
const requireArtisanOrAdmin = requireRole(['artisan', 'admin']);

module.exports = {
  requireRole,
  requireAdmin,
  requireArtisan,
  requireArtisanOrAdmin,
};
