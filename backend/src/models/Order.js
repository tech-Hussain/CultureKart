/**
 * Order Model
 * Represents customer orders with payment and fulfillment tracking
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Reference to buyer (User)
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
      index: true,
    },

    // Order items
    items: [
      {
        // Reference to Product
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product reference is required'],
        },

        // Quantity ordered
        qty: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },

        // Price at time of purchase (to preserve historical pricing)
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },

        // Product title (snapshot at time of order)
        title: {
          type: String,
          required: true,
        },

        // Product image (snapshot at time of order)
        image: {
          type: String,
          default: '',
        },

        // Reference to artisan (for commission calculations)
        artisan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Artisan',
        },
      },
    ],

    // Total order amount
    total: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total cannot be negative'],
    },

    // Currency
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      enum: {
        values: ['USD', 'PKR', 'EUR', 'GBP'],
        message: 'Currency must be USD, PKR, EUR, or GBP',
      },
      default: 'PKR',
    },

    // Order status
    status: {
      type: String,
      required: [true, 'Order status is required'],
      enum: {
        values: [
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded',
          'failed',
        ],
        message: 'Invalid order status',
      },
      default: 'pending',
    },

    // Payment information
    paymentInfo: {
      // Payment method
      method: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: {
          values: ['stripe', 'jazzcash', 'cod'],
          message: 'Payment method must be stripe, jazzcash, or cod',
        },
      },

      // Payment status
      status: {
        type: String,
        required: [true, 'Payment status is required'],
        enum: {
          values: ['pending', 'completed', 'failed', 'refunded'],
          message: 'Invalid payment status',
        },
        default: 'pending',
      },

      // Transaction ID from payment gateway
      transactionId: {
        type: String,
        default: '',
      },

      // Payment gateway response (store raw response for debugging)
      gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      // Payment date
      paidAt: {
        type: Date,
        default: null,
      },
    },

    // Shipping information
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'Pakistan',
      },
    },

    // Shipping information
    shippingDetails: {
      carrier: {
        type: String,
        default: '',
      },
      trackingNumber: {
        type: String,
        default: '',
      },
      shippedAt: {
        type: Date,
        default: null,
      },
      deliveredAt: {
        type: Date,
        default: null,
      },
      estimatedDelivery: {
        type: Date,
        default: null,
      },
    },

    // Order notes (from buyer or admin)
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },

    // Admin/internal notes
    internalNotes: {
      type: String,
      trim: true,
      default: '',
    },

    // Cancellation information
    cancellation: {
      reason: {
        type: String,
        default: '',
      },
      cancelledAt: {
        type: Date,
        default: null,
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },

    // Refund information
    refund: {
      amount: {
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
        default: '',
      },
      refundedAt: {
        type: Date,
        default: null,
      },
      transactionId: {
        type: String,
        default: '',
      },
    },

    // Product Authentication Codes (one per item)
    authenticationCodes: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        authenticationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProductAuthentication',
        },
        publicCode: String,
        qrCodeUrl: String,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ 'paymentInfo.transactionId': 1 });
orderSchema.index({ createdAt: -1 });

// Virtual: Total items count
orderSchema.virtual('itemCount').get(function () {
  return this.items && Array.isArray(this.items) ? this.items.reduce((sum, item) => sum + item.qty, 0) : 0;
});

// Virtual: Check if order is paid
orderSchema.virtual('isPaid').get(function () {
  return this.paymentInfo && this.paymentInfo.status === 'completed';
});

// Virtual: Check if order is delivered
orderSchema.virtual('isDelivered').get(function () {
  return this.status === 'delivered';
});

// Virtual: Check if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed'].includes(this.status);
});

// Instance method: Mark as paid
orderSchema.methods.markAsPaid = async function (transactionId, gatewayResponse = {}) {
  this.paymentInfo.status = 'completed';
  this.paymentInfo.paidAt = Date.now();
  this.paymentInfo.transactionId = transactionId;
  this.paymentInfo.gatewayResponse = gatewayResponse;
  
  if (this.status === 'pending') {
    this.status = 'confirmed';
  }
  
  return await this.save();
};

// Instance method: Mark as shipped
orderSchema.methods.markAsShipped = async function (carrier, trackingNumber) {
  this.status = 'shipped';
  this.shippingDetails.carrier = carrier;
  this.shippingDetails.trackingNumber = trackingNumber;
  this.shippingDetails.shippedAt = Date.now();
  
  return await this.save();
};

// Instance method: Mark as delivered
orderSchema.methods.markAsDelivered = async function () {
  this.status = 'delivered';
  this.shippingDetails.deliveredAt = Date.now();
  
  return await this.save();
};

// Instance method: Cancel order
orderSchema.methods.cancel = async function (reason, cancelledBy) {
  if (!this.canBeCancelled) {
    throw new Error('Order cannot be cancelled in current status');
  }
  
  this.status = 'cancelled';
  this.cancellation.reason = reason;
  this.cancellation.cancelledAt = Date.now();
  this.cancellation.cancelledBy = cancelledBy;
  
  return await this.save();
};

// Instance method: Process refund
orderSchema.methods.refundOrder = async function (amount, reason, transactionId) {
  this.status = 'refunded';
  this.paymentInfo.status = 'refunded';
  this.refund.amount = amount;
  this.refund.reason = reason;
  this.refund.refundedAt = Date.now();
  this.refund.transactionId = transactionId;
  
  return await this.save();
};

// Static method: Find orders by buyer
orderSchema.statics.findByBuyer = function (buyerId) {
  return this.find({ buyer: buyerId })
    .populate('buyer', 'name email')
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 });
};

// Static method: Find orders by status
orderSchema.statics.findByStatus = function (status) {
  return this.find({ status })
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });
};

// Static method: Find pending orders
orderSchema.statics.findPending = function () {
  return this.find({ status: 'pending' })
    .populate('buyer', 'name email')
    .sort({ createdAt: 1 });
};

// Pre-save hook: Validate items array
orderSchema.pre('save', function (next) {
  if (this.items.length === 0) {
    return next(new Error('Order must have at least one item'));
  }
  next();
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
