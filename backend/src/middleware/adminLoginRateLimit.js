/**
 * Admin Login Rate Limiting Middleware
 * Enforces 3 failed attempts = 5 minute account lock
 * Logs all admin login attempts to database
 */

const AdminLoginAttempt = require('../models/AdminLoginAttempt');
const logger = require('../utils/logger');
const { getDetailedNetworkInfo, getFullIPAddress, getPrimaryMacAddress } = require('../utils/networkInfo');

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'Unknown'
  );
};

/**
 * Get user agent from request
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

/**
 * Middleware to check if IP address is locked
 * Should be applied BEFORE authentication
 */
const checkAdminLoginLock = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const clientIP = getClientIP(req);

    // Check if IP is locked (for multiple failed attempts from same IP)
    const ipLockStatus = await AdminLoginAttempt.isIPLocked(clientIP);

    if (ipLockStatus.locked) {
      const minutes = Math.ceil(ipLockStatus.remainingTime / 60);
      const seconds = ipLockStatus.remainingTime % 60;

      // Log the locked attempt
      await AdminLoginAttempt.logAttempt({
        email: email.toLowerCase(),
        ipAddress: clientIP,
        userAgent: getUserAgent(req),
        success: false,
        failureReason: 'ip_locked',
      });

      // Send to live logging service with detailed network info
      const networkInfo = getDetailedNetworkInfo(req);
      
      logger.warn('🔒 IP Locked - Login attempt blocked', {
        event: 'admin_login_blocked',
        email: email.toLowerCase(),
        ipAddress: clientIP,
        fullIPAddress: networkInfo.fullIP,
        macAddress: networkInfo.macAddress,
        hostname: networkInfo.serverHostname,
        isLocalhost: networkInfo.isLocalhost,
        userAgent: getUserAgent(req),
        lockUntil: ipLockStatus.lockUntil,
        remainingTime: ipLockStatus.remainingTime,
        reason: 'ip_locked',
        networkDetails: networkInfo.allInterfaces,
      });

      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}.`,
        locked: true,
        lockUntil: ipLockStatus.lockUntil,
        remainingTime: ipLockStatus.remainingTime,
      });
    }

    // Get recent failed attempts count by IP
    const recentFailedAttempts = await AdminLoginAttempt.getRecentFailedAttemptsByIP(clientIP);

    // Attach info to request for use in route handler
    req.adminLoginInfo = {
      email: email.toLowerCase(),
      ipAddress: clientIP,
      userAgent: getUserAgent(req),
      recentFailedAttempts,
    };

    next();
  } catch (error) {
    console.error('Error in login rate limit middleware:', error);
    // Don't block login if there's an error with rate limiting
    next();
  }
};

/**
 * Helper function to log successful login
 * Should be called in route handler after successful authentication
 */
const logSuccessfulLogin = async (email, req) => {
  try {
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    const networkInfo = getDetailedNetworkInfo(req);
    
    await AdminLoginAttempt.logAttempt({
      email: email.toLowerCase(),
      ipAddress: clientIP,
      userAgent: userAgent,
      success: true,
    });

    // Send to live logging service with detailed network info
    logger.info('✅ Successful admin login', {
      event: 'admin_login_success',
      email: email.toLowerCase(),
      ipAddress: clientIP,
      fullIPAddress: networkInfo.fullIP,
      macAddress: networkInfo.macAddress,
      hostname: networkInfo.serverHostname,
      isLocalhost: networkInfo.isLocalhost,
      userAgent: userAgent,
      networkDetails: networkInfo.allInterfaces,
    });
  } catch (error) {
    console.error('Error logging successful login:', error);
    logger.error('❌ Error logging successful login', {
      event: 'admin_login_log_error',
      error: error.message,
    });
    // Don't throw error, just log it
  }
};

/**
 * Helper function to log failed login
 * Should be called in route handler after failed authentication
 */
const logFailedLogin = async (email, req, failureReason = 'invalid_credentials') => {
  try {
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    const attempt = await AdminLoginAttempt.logAttempt({
      email: email.toLowerCase(),
      ipAddress: clientIP,
      userAgent: userAgent,
      success: false,
      failureReason,
    });

    // Send to live logging service with detailed network info
    if (attempt.lockUntil) {
      const networkInfo = getDetailedNetworkInfo(req);
      
      logger.error('🔴 Failed login - IP LOCKED', {
        event: 'admin_login_failed_locked',
        email: email.toLowerCase(),
        ipAddress: clientIP,
        fullIPAddress: networkInfo.fullIP,
        macAddress: networkInfo.macAddress,
        hostname: networkInfo.serverHostname,
        isLocalhost: networkInfo.isLocalhost,
        userAgent: userAgent,
        attemptNumber: attempt.attemptNumber,
        lockUntil: attempt.lockUntil,
        reason: failureReason,
        networkDetails: networkInfo.allInterfaces,
      });
    } else {
      logger.warn('⚠️  Failed login attempt', {
        event: 'admin_login_failed',
        email: email.toLowerCase(),
        ipAddress: clientIP,
        userAgent: userAgent,
        attemptNumber: attempt.attemptNumber,
        remainingAttempts: 3 - attempt.attemptNumber,
        reason: failureReason,
      });
    }

    // Check if this attempt triggered a lock
    if (attempt.lockUntil) {
      return {
        locked: true,
        lockUntil: attempt.lockUntil,
        attemptNumber: attempt.attemptNumber,
      };
    }

    return {
      locked: false,
      attemptNumber: attempt.attemptNumber,
    };
  } catch (error) {
    console.error('Error logging failed login:', error);
    logger.error('❌ Error logging failed login', {
      event: 'admin_login_error',
      error: error.message,
      stack: error.stack,
    });
    return { locked: false, attemptNumber: 0 };
  }
};

module.exports = {
  checkAdminLoginLock,
  logSuccessfulLogin,
  logFailedLogin,
};
