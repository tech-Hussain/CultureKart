/**
 * Withdrawal Model
 * Tracks artisan withdrawal requests and Stripe payouts
 */

const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000, // Minimum withdrawal Rs 1,000
    },
    processingFee: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'PKR',
      enum: ['PKR', 'USD'],
    },
    bankDetails: {
      bankName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      accountTitle: {
        type: String,
        required: true,
      },
      routingNumber: String, // For international transfers
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    stripePayoutId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeTransferId: {
      type: String,
      sparse: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    completedAt: Date,
    estimatedArrival: Date,
    failureReason: String,
    failureCode: String,
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceInfo: String,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
withdrawalSchema.index({ artisan: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ stripePayoutId: 1 });

// Calculate net amount before saving
withdrawalSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isNew) {
    this.processingFee = this.amount * 0.02; // 2% fee
    this.netAmount = this.amount - this.processingFee;
    
    // Set estimated arrival (3-5 business days)
    if (!this.estimatedArrival) {
      const arrival = new Date();
      arrival.setDate(arrival.getDate() + 5); // 5 business days
      this.estimatedArrival = arrival;
    }
  }
  next();
});

// Instance Methods
withdrawalSchema.methods.markAsProcessing = async function(stripePayoutId) {
  this.status = 'processing';
  this.processedAt = new Date();
  this.stripePayoutId = stripePayoutId;
  return this.save();
};

withdrawalSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

withdrawalSchema.methods.markAsFailed = async function(reason, code) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failureCode = code;
  return this.save();
};

// Static Methods
withdrawalSchema.statics.getPendingTotal = async function(artisanId) {
  const result = await this.aggregate([
    {
      $match: {
        artisan: artisanId,
        status: { $in: ['pending', 'processing'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

withdrawalSchema.statics.getCompletedTotal = async function(artisanId, startDate, endDate) {
  const match = {
    artisan: artisanId,
    status: 'completed'
  };
  
  if (startDate || endDate) {
    match.completedAt = {};
    if (startDate) match.completedAt.$gte = startDate;
    if (endDate) match.completedAt.$lte = endDate;
  }
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
