/**
 * User Model
 * Represents users in the CultureKart platform (buyers, artisans, admins)
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Firebase UID - unique identifier from Firebase Authentication
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
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

// Static method: Find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

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
