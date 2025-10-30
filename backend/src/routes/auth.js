/**
 * Authentication Routes
 * Handles Firebase token verification and user profile management
 */

const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const User = require('../models/User');

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

    // Check if user exists in database
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0], // Use email prefix as fallback name
        profile: {
          avatar: picture || '',
        },
        emailVerified: email_verified || false,
        role: 'buyer', // Default role for new users
        isActive: true,
      });

      await user.save();
      console.log(`New user created: ${email} (${uid})`);
    } else {
      // Update last login for existing user
      await user.updateLastLogin();
      
      // Update email verification status if changed
      if (email_verified && !user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
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
 * Requires: Authorization header with Firebase token
 */
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

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
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/v1/auth/profile
 * Update current user's profile
 * Requires: Authorization header with Firebase token
 * Body: { name, profile: { bio, location, phone } }
 */
router.patch('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Allow updating specific fields
    const { name, profile } = req.body;

    if (name) {
      user.name = name;
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
