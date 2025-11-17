/**
 * Transaction Model
 * Tracks all payment transactions, escrow, and commission distributions
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Order reference
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },

  // Artisan receiving payment
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Buyer who made payment
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Transaction type
  type: {
    type: String,
    enum: ['payment_received', 'escrow_hold', 'artisan_payout', 'platform_commission', 'refund'],
    required: true,
  },

  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'held', 'completed', 'failed', 'refunded'],
    default: 'pending',
    required: true,
  },

  // Amount details (in PKR or smallest currency unit)
  amounts: {
    total: {
      type: Number,
      required: true,
    },
    artisanShare: {
      type: Number, // 90% of total
      default: 0,
    },
    platformCommission: {
      type: Number, // 10% of total
      default: 0,
    },
    paidToArtisan: {
      type: Number,
      default: 0,
    },
  },

  // Stripe payment details
  stripe: {
    paymentIntentId: String,
    chargeId: String,
    transferId: String, // For artisan payout
    refundId: String,
  },

  // Delivery confirmation details
  deliveryConfirmation: {
    confirmedAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    buyerNotified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: Date,
  },

  // Metadata
  metadata: {
    paymentMethod: String,
    customerEmail: String,
    notes: String,
  },

  // Audit trail
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    reason: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],

  // Error tracking
  errors: [{
    errorType: String,
    errorMessage: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
transactionSchema.index({ order: 1, type: 1 });
transactionSchema.index({ artisan: 1, status: 1 });
transactionSchema.index({ buyer: 1 });
transactionSchema.index({ 'stripe.paymentIntentId': 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware: Update timestamp
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method: Add status to history
transactionSchema.methods.updateStatus = function(newStatus, reason, updatedBy) {
  this.statusHistory.push({
    status: newStatus,
    reason,
    updatedBy,
    timestamp: new Date(),
  });
  this.status = newStatus;
  return this.save();
};

// Instance method: Log error
transactionSchema.methods.logError = function(errorType, errorMessage) {
  this.errors.push({
    errorType,
    errorMessage,
    timestamp: new Date(),
  });
  return this.save();
};

// Static method: Calculate commission split (90/10)
transactionSchema.statics.calculateCommissionSplit = function(totalAmount) {
  const platformCommission = Math.round(totalAmount * 0.10); // 10%
  const artisanShare = totalAmount - platformCommission; // 90%
  
  return {
    total: totalAmount,
    artisanShare,
    platformCommission,
  };
};

// Static method: Get pending payouts for artisan
transactionSchema.statics.getPendingPayouts = async function(artisanId) {
  return this.find({
    artisan: artisanId,
    status: 'held',
    type: 'escrow_hold',
  }).populate('order');
};

// Static method: Get platform commission total
transactionSchema.statics.getPlatformCommission = async function(startDate, endDate) {
  const match = {
    type: 'platform_commission',
    status: 'completed',
  };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: '$amounts.platformCommission' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalCommission: 0, count: 0 };
};

// Virtual: Format amounts for display
transactionSchema.virtual('formattedAmounts').get(function() {
  return {
    total: `Rs ${this.amounts.total.toLocaleString()}`,
    artisanShare: `Rs ${this.amounts.artisanShare.toLocaleString()}`,
    platformCommission: `Rs ${this.amounts.platformCommission.toLocaleString()}`,
  };
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
