/**
 * Authentication Routes
 * Handles Firebase token verification and email/password authentication
 */

const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { authenticate, getCurrentUser } = require('../middleware/authenticate');
const { checkAdminLoginLock, logSuccessfulLogin, logFailedLogin } = require('../middleware/adminLoginRateLimit');
const AdminLoginAttempt = require('../models/AdminLoginAttempt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Secret - should be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper to get client IP address
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
 * GET /api/v1/auth/check-ip-lock
 * Check if the requesting IP address is currently locked
 * Returns lock status and remaining time if locked
 */
router.get('/check-ip-lock', async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    
    console.log(`🔍 Checking IP lock status for: ${clientIP}`);
    
    // Check if IP is locked
    const ipLockStatus = await AdminLoginAttempt.isIPLocked(clientIP);
    
    if (ipLockStatus.locked) {
      console.log(`🔒 IP ${clientIP} is locked until ${ipLockStatus.lockUntil}`);
      return res.status(200).json({
        success: true,
        locked: true,
        lockUntil: ipLockStatus.lockUntil,
        remainingTime: ipLockStatus.remainingTime,
      });
    }
    
    console.log(`✅ IP ${clientIP} is not locked`);
    return res.status(200).json({
      success: true,
      locked: false,
    });
  } catch (error) {
    console.error('Error checking IP lock status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking lock status',
      locked: false,
    });
  }
});

/**
 * POST /api/v1/auth/register
 * Register new user with email and password
 * Body: { email, password, name, role }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Validate role
    const validRoles = ['user', 'buyer', 'artisan'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by pre-save hook
      name,
      role: userRole,
      authProvider: 'email-password',
      emailVerified: false,
      isActive: true,
    });

    await user.save();

    // Generate JWT token for email/password users
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role,
        authProvider: 'email-password'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user profile (excluding password)
    const userProfile = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      authProvider: user.authProvider,
      profile: {
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        phone: user.profile.phone || '',
        avatar: user.profile.avatar || '',
      },
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userProfile,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Login user with email and password
 * Body: { email, password }
 * Includes rate limiting for admin accounts (3 attempts = 5 minute lock)
 */
router.post('/login', checkAdminLoginLock, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      // Log failed attempt - user not found (wrong email)
      // Apply rate limiting to ANY email on admin login endpoint
      console.log(`🔍 User not found: ${email}`); // DEBUG
      console.log(`📝 Logging failed attempt for: ${email}`); // DEBUG
      
      const failureInfo = await logFailedLogin(email, req, 'user_not_found');
        
      // If account is now locked due to repeated wrong email attempts
      if (failureInfo.locked) {
        const remainingTime = Math.ceil((failureInfo.lockUntil - new Date()) / 1000);
        return res.status(429).json({
          success: false,
          message: 'Too many failed login attempts. Your account has been locked for 5 minutes.',
          locked: true,
          lockUntil: failureInfo.lockUntil,
          remainingTime: remainingTime,
        });
      }
      
      // Return remaining attempts warning
      const remainingAttempts = 3 - failureInfo.attemptNumber;
      if (remainingAttempts > 0) {
        return res.status(401).json({
          success: false,
          message: `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lock.`,
          remainingAttempts,
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user uses email/password authentication
    if (user.authProvider !== 'email-password') {
      // Log failed attempt - wrong auth provider (apply to all users)
      const failureInfo = await logFailedLogin(email, req, 'invalid_credentials');
      
      // If account is now locked, return lock message
      if (failureInfo.locked) {
        const remainingTime = Math.ceil((failureInfo.lockUntil - new Date()) / 1000);
        return res.status(429).json({
          success: false,
          message: 'Too many failed login attempts. Your account has been locked for 5 minutes.',
          locked: true,
          lockUntil: failureInfo.lockUntil,
          remainingTime: remainingTime,
        });
      }
      
      // Return remaining attempts warning
      const remainingAttempts = 3 - failureInfo.attemptNumber;
      if (remainingAttempts > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid authentication method. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lock.`,
          remainingAttempts,
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'This account uses Firebase authentication. Please sign in with Google.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed attempt for all users
      const failureInfo = await logFailedLogin(email, req, 'invalid_credentials');
      
      // If account is now locked, return lock message
      if (failureInfo.locked) {
        const remainingTime = Math.ceil((failureInfo.lockUntil - new Date()) / 1000);
        return res.status(429).json({
          success: false,
          message: 'Too many failed login attempts. Your account has been locked for 5 minutes.',
          locked: true,
          lockUntil: failureInfo.lockUntil,
          remainingTime: remainingTime,
        });
      }
      
      // Return remaining attempts warning
      const remainingAttempts = 3 - failureInfo.attemptNumber;
      if (remainingAttempts > 0) {
        return res.status(401).json({
          success: false,
          message: `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lock.`,
          remainingAttempts,
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      // Log failed attempt
      await logFailedLogin(email, req, 'account_inactive');
      
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Login successful
    // Note: IP lock (if active) will persist for full 5 minutes
    // This prevents brute force attacks even if correct credentials are guessed

    // Log successful login with detailed network info
    await logSuccessfulLogin(email, req);

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role,
        authProvider: 'email-password'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user profile (excluding password)
    const userProfile = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      authProvider: user.authProvider,
      profile: {
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        phone: user.profile.phone || '',
        avatar: user.profile.avatar || '',
      },
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userProfile,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Log server error for admin attempts
    if (req.adminLoginInfo) {
      await logFailedLogin(req.body.email, req, 'server_error');
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/auth/verify
 * Verify Firebase ID token and return/create user profile
 * Expects: Authorization: Bearer <firebaseIdToken>
 * Returns: User profile with role and basic info
 */
router.post('/verify', verifyFirebaseToken, async (req, res) => {
  try {
    // req.user is set by verifyFirebaseToken middleware
    const { uid, email, name, picture, email_verified } = req.user;

    // Check if user exists in database by firebaseUid OR email
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: uid },
        { email: email }
      ]
    });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0], // Use email prefix as fallback name
        authProvider: 'firebase-oauth',
        profile: {
          avatar: picture || '',
        },
        emailVerified: email_verified || false,
        role: 'user', // Default role - will be updated after role selection
        isActive: true,
      });

      await user.save();
      console.log(`New user created: ${email} (${uid})`);
    } else {
      // User exists - update their information
      let updated = false;
      
      // Update firebaseUid if it changed (e.g., different auth provider)
      if (user.firebaseUid !== uid) {
        user.firebaseUid = uid;
        updated = true;
        console.log(`Updated firebaseUid for user: ${email}`);
      }
      
      // Update name if not set
      if (!user.name && name) {
        user.name = name;
        updated = true;
      }
      
      // Update avatar if not set
      if (picture && (!user.profile || !user.profile.avatar)) {
        if (!user.profile) user.profile = {};
        user.profile.avatar = picture;
        updated = true;
      }
      
      // Update email verification status if changed
      if (email_verified && !user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      
      // Save if any updates were made
      if (updated) {
        await user.save();
      }
      
      // Update last login
      await user.updateLastLogin();
    }

    // Return user profile (excluding sensitive fields)
    const userProfile = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: {
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        phone: user.profile.phone || '',
        avatar: user.profile.avatar || picture || '',
      },
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying user authentication',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/auth/profile
 * Get current user's full profile
 * Requires: Authorization header with Firebase or JWT token
 * Works with both authentication methods
 */
router.get('/profile', authenticate, getCurrentUser);

/**
 * PATCH /api/v1/auth/profile
 * Update current user's profile
 * Requires: Authorization header with Firebase or JWT token
 * Body: { name, profile: { bio, location, phone }, role }
 */
router.patch('/profile', authenticate, async (req, res) => {
  try {
    let user;

    // Find user based on auth provider
    if (req.user.authProvider === 'firebase-oauth') {
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Allow updating specific fields
    const { name, profile, role } = req.body;

    if (name) {
      user.name = name;
    }

    // Allow role update (only from 'user' to 'buyer' or 'artisan')
    if (role && user.role === 'user') {
      if (role === 'buyer' || role === 'artisan') {
        user.role = role;
        console.log(`User role updated: ${user.email} -> ${role}`);
      }
    }

    if (profile) {
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
      if (profile.location !== undefined) user.profile.location = profile.location;
      if (profile.phone !== undefined) user.profile.phone = profile.phone;
      if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
    }

    await user.save();

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
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message,
    });
  }
});

module.exports = router;
