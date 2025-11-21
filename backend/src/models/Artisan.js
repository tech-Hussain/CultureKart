/**
 * Artisan Model
 * Represents artisan profiles with verification and portfolio information
 */

const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema(
  {
    // Reference to User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    // Display name for artisan profile (can be different from user name)
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      minlength: [2, 'Display name must be at least 2 characters long'],
      maxlength: [100, 'Display name cannot exceed 100 characters'],
    },

    // Artisan biography/description
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      minlength: [20, 'Bio must be at least 20 characters long'],
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },

    // Location/address
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },

    // Verification status (approved by admin)
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Date when artisan was approved/verified
    approvalDate: {
      type: Date,
      default: null,
    },

    // Portfolio URLs (links to external work, social media, etc.)
    portfolio: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          // Validate each URL in the array
          return arr.every((url) => {
            try {
              new URL(url);
              return true;
            } catch (e) {
              return false;
            }
          });
        },
        message: 'All portfolio entries must be valid URLs',
      },
    },

    // Artisan specialty/craft type
    specialty: {
      type: String,
      trim: true,
      maxlength: [100, 'Specialty cannot exceed 100 characters'],
      default: '',
    },

    // Rating and reviews aggregates
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Total products created
    totalProducts: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total sales
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Stripe Connect Account ID for payouts
    stripeAccountId: {
      type: String,
      sparse: true,
      index: true,
    },

    // Stripe onboarding complete
    stripeOnboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
artisanSchema.index({ verified: 1, isActive: 1 });
artisanSchema.index({ 'rating.average': -1 });
artisanSchema.index({ createdAt: -1 });

// Virtual: Check if artisan is verified and active
artisanSchema.virtual('isVerifiedAndActive').get(function () {
  return this.verified && this.isActive;
});

// Instance method: Verify artisan
artisanSchema.methods.verify = async function () {
  this.verified = true;
  this.approvalDate = Date.now();
  return await this.save();
};

// Instance method: Unverify artisan
artisanSchema.methods.unverify = async function () {
  this.verified = false;
  this.approvalDate = null;
  return await this.save();
};

// Instance method: Add portfolio link
artisanSchema.methods.addPortfolioLink = async function (url) {
  if (!this.portfolio.includes(url)) {
    this.portfolio.push(url);
    return await this.save();
  }
  return this;
};

// Static method: Find verified artisans
artisanSchema.statics.findVerified = function () {
  return this.find({ verified: true, isActive: true }).populate('user', 'name email');
};

// Static method: Find artisan by user ID
artisanSchema.statics.findByUser = function (userId) {
  return this.findOne({ user: userId }).populate('user');
};

// Pre-save hook: Set approval date when verified
artisanSchema.pre('save', function (next) {
  if (this.isModified('verified') && this.verified && !this.approvalDate) {
    this.approvalDate = Date.now();
  }
  next();
});

// Create and export the Artisan model
const Artisan = mongoose.model('Artisan', artisanSchema);

module.exports = Artisan;
