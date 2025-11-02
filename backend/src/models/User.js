/**
 * User Model
 * Represents users in the CultureKart platform (buyers, artisans, admins)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Firebase UID - unique identifier from Firebase Authentication
    // Optional for email/password users until they verify
    firebaseUid: {
      type: String,
      sparse: true, // Allows multiple null values
      index: true,
    },

    // Email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    // Password hash - for email/password authentication
    // Only required if not using Firebase OAuth
    password: {
      type: String,
      select: false, // Don't return password by default in queries
    },

    // Authentication provider type
    authProvider: {
      type: String,
      enum: ['firebase-oauth', 'email-password'],
      default: 'firebase-oauth',
      required: true,
    },

    // User's display name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // User role - determines access permissions
    role: {
      type: String,
      enum: {
        values: ['user', 'buyer', 'artisan', 'admin'],
        message: 'Role must be either user, buyer, artisan, or admin',
      },
      default: 'user',
      required: true,
    },

    // User profile information
    profile: {
      // Biography or description
      bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: '',
      },

      // Location/address information
      location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters'],
        default: '',
      },

      // Phone number (optional)
      phone: {
        type: String,
        trim: true,
        default: '',
      },

      // Profile picture URL (from Firebase or uploaded)
      avatar: {
        type: String,
        default: '',
      },
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Email verification status
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Last login timestamp
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function () {
  return {
    id: this._id,
    firebaseUid: this.firebaseUid,
    email: this.email,
    name: this.name,
    role: this.role,
    profile: this.profile,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
});

// Instance method: Update last login time
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = Date.now();
  return await this.save();
};

// Instance method: Check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// Instance method: Check if user is artisan
userSchema.methods.isArtisan = function () {
  return this.role === 'artisan';
};

// Static method: Find user by Firebase UID
userSchema.statics.findByFirebaseUid = function (firebaseUid) {
  return this.findOne({ firebaseUid });
};

// Static method: Find user by email (for email/password auth)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method: Find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Instance method: Check if user uses email/password authentication
userSchema.methods.usesEmailPassword = function () {
  return this.authProvider === 'email-password';
};

// Instance method: Compare password for email/password users
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('This user does not have a password set');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save hook: Hash password if it's modified
userSchema.pre('save', async function (next) {
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

// Pre-save hook: Update lastLogin on save
userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.lastLogin = Date.now();
  }
  next();
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
