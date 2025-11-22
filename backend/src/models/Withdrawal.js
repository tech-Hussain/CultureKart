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
      enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'failed', 'cancelled'],
      default: 'pending',
    },
    
    // Admin approval tracking
    adminApproval: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      rejectedAt: Date,
      rejectionReason: String,
      adminNotes: String,
    },
    
    // Escrow tracking
    escrowDetails: {
      totalEscrow: {
        type: Number,
        default: 0,
      },
      availableBalance: {
        type: Number,
        default: 0,
      },
      pendingBalance: {
        type: Number,
        default: 0,
      },
      orders: [{
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        amount: Number,
        status: String,
      }],
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
withdrawalSchema.methods.approveRequest = async function(adminId, notes) {
  this.status = 'approved';
  this.adminApproval.status = 'approved';
  this.adminApproval.approvedBy = adminId;
  this.adminApproval.approvedAt = new Date();
  if (notes) this.adminApproval.adminNotes = notes;
  return this.save();
};

withdrawalSchema.methods.rejectRequest = async function(adminId, reason, notes) {
  this.status = 'rejected';
  this.adminApproval.status = 'rejected';
  this.adminApproval.approvedBy = adminId;
  this.adminApproval.rejectedAt = new Date();
  this.adminApproval.rejectionReason = reason;
  if (notes) this.adminApproval.adminNotes = notes;
  return this.save();
};

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
withdrawalSchema.statics.getPendingApprovals = async function() {
  return this.find({ 
    'adminApproval.status': 'pending',
    status: 'pending'
  })
  .populate('artisan', 'businessName email phone')
  .sort({ createdAt: -1 });
};

withdrawalSchema.statics.getTotalPendingAmount = async function() {
  const result = await this.aggregate([
    {
      $match: {
        'adminApproval.status': 'pending',
        status: 'pending'
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

withdrawalSchema.statics.getArtisanEscrowSummary = async function(artisanId) {
  const Order = mongoose.model('Order');
  
  // Get all PAID orders for this artisan with UNRELEASED escrow
  const unreleasedOrders = await Order.find({
    'items.artisan': artisanId,
    status: { $in: ['pending', 'processing', 'shipped', 'delivered'] },
    'paymentDistribution.escrowReleased': false,
    $or: [
      { 'paymentInfo.status': 'completed' }, // Stripe payments
      { paymentMethod: 'cod', status: { $in: ['processing', 'shipped', 'delivered'] } } // COD confirmed
    ]
  });
  
  // Get all orders with RELEASED escrow (not yet paid out)
  const releasedOrders = await Order.find({
    'items.artisan': artisanId,
    'paymentDistribution.escrowReleased': true,
    'paymentDistribution.artisanPayout.paid': { $ne: true } // Not marked as paid
  });
  
  let totalEscrow = 0;
  let releasedEscrowTotal = 0; // Total released escrow
  let pendingBalance = 0; // Unreleased escrow (held, awaiting admin approval)
  const orders = [];
  
  // Process unreleased orders (pending escrow)
  for (const order of unreleasedOrders) {
    const artisanAmount = order.paymentDistribution?.artisanPayout?.amount || 0;
    totalEscrow += artisanAmount;
    pendingBalance += artisanAmount; // All unreleased escrow is pending
    
    orders.push({
      orderId: order._id,
      amount: artisanAmount,
      status: order.status,
      escrowReleased: false,
      orderNumber: order._id.toString().slice(-8)
    });
  }
  
  // Process released orders (potentially available for withdrawal)
  for (const order of releasedOrders) {
    const artisanAmount = order.paymentDistribution?.artisanPayout?.amount || 0;
    totalEscrow += artisanAmount;
    releasedEscrowTotal += artisanAmount;
    
    orders.push({
      orderId: order._id,
      amount: artisanAmount,
      status: order.status,
      escrowReleased: true,
      orderNumber: order._id.toString().slice(-8)
    });
  }
  
  // Get total approved/processing withdrawals (not yet completed)
  const approvedWithdrawals = await this.aggregate([
    {
      $match: {
        artisan: artisanId,
        status: { $in: ['approved', 'processing'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  const approvedWithdrawalTotal = approvedWithdrawals.length > 0 ? approvedWithdrawals[0].total : 0;
  
  // Available balance = Released escrow - Approved withdrawals
  const availableBalance = releasedEscrowTotal - approvedWithdrawalTotal;
  
  return {
    totalEscrow,
    availableBalance, // Released escrow minus approved withdrawals
    pendingBalance, // Unreleased escrow (awaiting admin release)
    orders
  };
};

withdrawalSchema.statics.getPendingTotal = async function(artisanId) {
  const result = await this.aggregate([
    {
      $match: {
        artisan: artisanId,
        status: { $in: ['pending', 'approved', 'processing'] }
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
