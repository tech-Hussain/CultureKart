/**
 * Pending User Model
 * Stores temporary registration data until email verification is completed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingUserSchema = new mongoose.Schema(
  {
    // Email address (primary identifier)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    // Password hash
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },

    // User's display name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // User role
    role: {
      type: String,
      enum: {
        values: ['user', 'buyer', 'artisan'],
        message: 'Role must be user, buyer, or artisan',
      },
      default: 'user',
      required: true,
    },

    // OTP for email verification
    emailOTP: {
      code: {
        type: String,
        required: true,
      },
      expires: {
        type: Date,
        required: true,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },

    // Automatic expiry - delete after 24 hours if not verified
    expiresAt: {
      type: Date,
      default: Date.now,
    },

    // IP address for security tracking
    registrationIP: {
      type: String,
      default: 'Unknown',
    },

    // User agent for security tracking
    userAgent: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Index for better query performance
pendingUserSchema.index({ createdAt: -1 });
pendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 }); // Auto-cleanup after 24 hours

// Instance method: Generate OTP for email verification
pendingUserSchema.methods.generateEmailOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP with 10 minutes expiry
  this.emailOTP = {
    code: otp,
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0,
  };
  
  return otp;
};

// Instance method: Verify OTP
pendingUserSchema.methods.verifyEmailOTP = function (candidateOTP) {
  // Check if OTP exists and hasn't expired
  if (!this.emailOTP || !this.emailOTP.code || !this.emailOTP.expires) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }
  
  // Check if OTP has expired
  if (new Date() > this.emailOTP.expires) {
    return { success: false, message: 'OTP has expired. Please register again.' };
  }
  
  // Check if too many attempts
  if (this.emailOTP.attempts >= 5) {
    return { success: false, message: 'Too many failed attempts. Please register again.' };
  }
  
  // Increment attempts
  this.emailOTP.attempts += 1;
  
  // Verify OTP
  if (this.emailOTP.code === candidateOTP.toString()) {
    return { success: true, message: 'OTP verified successfully.' };
  }
  
  return { 
    success: false, 
    message: `Invalid OTP. ${5 - this.emailOTP.attempts} attempts remaining.` 
  };
};

// Instance method: Clear expired OTP
pendingUserSchema.methods.clearExpiredOTP = function () {
  if (this.emailOTP && this.emailOTP.expires && new Date() > this.emailOTP.expires) {
    this.emailOTP = undefined;
    return true;
  }
  return false;
};

// Instance method: Check if user can request new OTP
pendingUserSchema.methods.canRequestNewOTP = function () {
  // Allow if no OTP exists or if current OTP has expired
  if (!this.emailOTP || !this.emailOTP.expires) {
    return true;
  }
  
  // Allow if current OTP has expired
  if (new Date() > this.emailOTP.expires) {
    return true;
  }
  
  // Don't allow if OTP was generated less than 1 minute ago
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const otpGeneratedTime = new Date(this.emailOTP.expires.getTime() - 10 * 60 * 1000);
  
  return otpGeneratedTime < oneMinuteAgo;
};

// Instance method: Compare password
pendingUserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('This pending user does not have a password set');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method: Convert to User data object
pendingUserSchema.methods.toUserData = function () {
  return {
    email: this.email,
    password: this.password, // Already hashed
    name: this.name,
    role: this.role,
    authProvider: 'email-password',
    emailVerified: true, // Will be true after OTP verification
    isActive: true,
    profile: {
      bio: '',
      location: '',
      phone: '',
      gender: '',
      country: '',
      city: '',
      avatar: '',
    },
    addresses: [],
  };
};

// Static method: Find pending user by email
pendingUserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method: Clean up expired pending users (manual cleanup)
pendingUserSchema.statics.cleanupExpired = function () {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
};

// Pre-save hook: Hash password if it's modified
pendingUserSchema.pre('save', async function (next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Hash password with salt rounds of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create and export the PendingUser model
const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;