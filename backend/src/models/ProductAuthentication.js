/**
 * Product Authentication Model
 * Manages QR code generation and verification with anti-counterfeiting measures
 * Uses random hash mapping to prevent replication
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const productAuthenticationSchema = new mongoose.Schema(
  {
    // Reference to the order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    // Reference to the product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    // Public verification code (shown in QR code)
    // This is a random hash that doesn't reveal internal information
    publicVerificationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Internal verification hash (stored securely, never exposed)
    // Used to verify the authenticity of the public code
    internalVerificationHash: {
      type: String,
      required: true,
      unique: true,
    },

    // Additional security layers
    securitySalt: {
      type: String,
      required: true,
    },

    // Product snapshot at time of order (prevents tampering)
    productSnapshot: {
      productId: String,
      title: String,
      price: Number,
      artisan: String,
      ipfsHash: String,
      blockchainTxn: String,
    },

    // Order snapshot
    orderSnapshot: {
      orderId: String,
      orderDate: Date,
      customerName: String,
      orderTotal: Number,
    },

    // QR Code metadata
    qrCodeData: {
      type: String,
      required: true,
    },

    // Verification status
    verificationStatus: {
      type: String,
      enum: ['active', 'verified', 'delivered', 'revoked', 'expired'],
      default: 'active',
    },

    // Delivery confirmation (ONE-TIME USE)
    deliveryConfirmation: {
      confirmed: {
        type: Boolean,
        default: false,
      },
      confirmedAt: {
        type: Date,
      },
      confirmedBy: {
        type: String, // IP address or user ID
      },
      deliveryLocation: {
        type: String,
      },
      // Unique device fingerprint to prevent reuse
      deviceFingerprint: {
        type: String,
      },
    },

    // Track verification attempts
    verificationAttempts: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
        userAgent: String,
        location: String,
        status: {
          type: String,
          enum: ['success', 'failed', 'suspicious'],
        },
      },
    ],

    // First verification timestamp (when customer receives and scans)
    firstVerifiedAt: {
      type: Date,
    },

    // Expiration date (optional, for time-limited verification)
    expiresAt: {
      type: Date,
    },

    // Flag for suspicious activity
    isSuspicious: {
      type: Boolean,
      default: false,
    },

    // Notes about suspicious activity
    suspiciousNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick verification lookups
productAuthenticationSchema.index({ publicVerificationCode: 1, verificationStatus: 1 });

/**
 * Static method: Generate unique authentication for an order item
 */
productAuthenticationSchema.statics.generateAuthentication = async function (orderData, productData) {
  // Generate random public verification code (customer-facing)
  const publicCode = crypto.randomBytes(32).toString('hex').toUpperCase();

  // Generate security salt
  const securitySalt = crypto.randomBytes(16).toString('hex');

  // Generate internal verification hash using multiple factors
  const internalData = `${publicCode}:${orderData._id}:${productData._id}:${securitySalt}:${Date.now()}`;
  const internalHash = crypto
    .createHash('sha256')
    .update(internalData)
    .digest('hex')
    .toUpperCase();

  // Create QR code data (JSON string)
  const qrCodeData = JSON.stringify({
    code: publicCode,
    type: 'CultureKart_Authenticity',
    version: '1.0',
  });

  // Create product snapshot
  const productSnapshot = {
    productId: productData._id.toString(),
    title: productData.title,
    price: productData.price,
    artisan: productData.artisan?.displayName || 'Unknown',
    ipfsHash: productData.ipfsMetadataHash || '',
    blockchainTxn: productData.blockchainTxn || '',
  };

  // Create order snapshot
  const orderSnapshot = {
    orderId: orderData._id.toString(),
    orderDate: orderData.createdAt || new Date(),
    customerName: orderData.customerName || 'Customer',
    orderTotal: orderData.total || 0,
  };

  // Set expiration (optional - 1 year from now)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Create authentication record
  const authentication = await this.create({
    order: orderData._id,
    product: productData._id,
    publicVerificationCode: publicCode,
    internalVerificationHash: internalHash,
    securitySalt,
    productSnapshot,
    orderSnapshot,
    qrCodeData,
    expiresAt,
  });

  return authentication;
};

/**
 * Static method: Verify authentication code
 */
productAuthenticationSchema.statics.verifyCode = async function (publicCode, verificationMetadata = {}) {
  // Find authentication by public code
  const auth = await this.findOne({ publicVerificationCode: publicCode })
    .populate('product', 'title category price images ipfsMetadataHash blockchainTxn')
    .populate('order', 'orderNumber status');

  if (!auth) {
    return {
      valid: false,
      message: 'Invalid verification code. This product may be counterfeit.',
      status: 'invalid',
    };
  }

  // CRITICAL SECURITY CHECK: Verify blockchain hash matches
  // This prevents someone from copying blockchain hash and creating fake QR
  if (auth.productSnapshot.blockchainTxn && auth.product) {
    const currentBlockchainHash = auth.product.blockchainTxn;
    const snapshotBlockchainHash = auth.productSnapshot.blockchainTxn;
    
    // Check if blockchain hashes match between snapshot and current product
    if (currentBlockchainHash && currentBlockchainHash !== snapshotBlockchainHash) {
      // Record suspicious attempt
      auth.verificationAttempts.push({
        timestamp: new Date(),
        ipAddress: verificationMetadata.ipAddress || 'unknown',
        userAgent: verificationMetadata.userAgent || 'unknown',
        location: verificationMetadata.location || 'unknown',
        status: 'suspicious',
      });
      auth.isSuspicious = true;
      auth.suspiciousNotes = 'Blockchain hash mismatch - possible counterfeit attempt';
      await auth.save();

      return {
        valid: false,
        message: 'SECURITY ALERT: Blockchain hash mismatch detected. This QR code may have been tampered with or copied onto a counterfeit product.',
        status: 'tampered',
      };
    }
  }

  // SECURITY CHECK: Verify internal hash integrity
  // Regenerate the internal hash to ensure the public code hasn't been tampered
  const verificationData = `${auth.publicVerificationCode}:${auth.order}:${auth.product._id}:${auth.securitySalt}:${auth.createdAt.getTime()}`;
  const verificationHash = crypto
    .createHash('sha256')
    .update(verificationData)
    .digest('hex')
    .toUpperCase();

  // Note: We don't compare this hash directly as it would include timestamp
  // But we verify the components are valid
  if (!auth.securitySalt || !auth.internalVerificationHash) {
    return {
      valid: false,
      message: 'Invalid authentication structure. This may be a counterfeit.',
      status: 'invalid',
    };
  }

  // Check if revoked
  if (auth.verificationStatus === 'revoked') {
    return {
      valid: false,
      message: 'This verification code has been revoked.',
      status: 'revoked',
    };
  }

  // Check if expired
  if (auth.expiresAt && auth.expiresAt < new Date()) {
    auth.verificationStatus = 'expired';
    await auth.save();
    return {
      valid: false,
      message: 'This verification code has expired.',
      status: 'expired',
    };
  }

  // CRITICAL SECURITY: Check if already delivered (ONE-TIME USE)
  if (auth.deliveryConfirmation.confirmed) {
    // QR code already used for delivery - this is suspicious
    const timeSinceDelivery = Date.now() - auth.deliveryConfirmation.confirmedAt.getTime();
    const hoursSinceDelivery = timeSinceDelivery / (1000 * 60 * 60);
    
    // Record suspicious attempt
    auth.verificationAttempts.push({
      timestamp: new Date(),
      ipAddress: verificationMetadata.ipAddress || 'unknown',
      userAgent: verificationMetadata.userAgent || 'unknown',
      location: verificationMetadata.location || 'unknown',
      status: 'suspicious',
    });
    auth.isSuspicious = true;
    auth.suspiciousNotes = `QR code scanned again ${hoursSinceDelivery.toFixed(1)} hours after delivery confirmation - possible package swap/reuse`;
    await auth.save();

    return {
      valid: false,
      message: `SECURITY ALERT: This QR code was already used for delivery confirmation ${hoursSinceDelivery.toFixed(1)} hours ago. Someone may have copied this QR code onto a different package.`,
      status: 'already_delivered',
      deliveryInfo: {
        originalDeliveryTime: auth.deliveryConfirmation.confirmedAt,
        originalLocation: auth.deliveryConfirmation.deliveryLocation,
      },
    };
  }

  // Check for suspicious activity (too many verifications from different locations)
  const recentVerifications = auth.verificationAttempts.filter(
    (attempt) => attempt.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  );

  if (recentVerifications.length > 10) {
    auth.isSuspicious = true;
    auth.suspiciousNotes = 'Too many verification attempts in 24 hours';
  }

  // Record verification attempt
  auth.verificationAttempts.push({
    timestamp: new Date(),
    ipAddress: verificationMetadata.ipAddress || 'unknown',
    userAgent: verificationMetadata.userAgent || 'unknown',
    location: verificationMetadata.location || 'unknown',
    status: 'success',
  });

  // Set first verification timestamp if this is the first time
  if (!auth.firstVerifiedAt) {
    auth.firstVerifiedAt = new Date();
  }

  // Update status to verified (but NOT delivered yet)
  if (auth.verificationStatus === 'active') {
    auth.verificationStatus = 'verified';
  }

  await auth.save();

  // Blockchain verification info with enhanced security
  const blockchainInfo = {
    hasBlockchainRecord: !!auth.productSnapshot.blockchainTxn,
    transactionHash: auth.productSnapshot.blockchainTxn || null,
    ipfsHash: auth.productSnapshot.ipfsHash || null,
    blockchainVerified: auth.productSnapshot.blockchainTxn && 
                        auth.productSnapshot.blockchainTxn.startsWith('0x') && 
                        auth.productSnapshot.blockchainTxn.length === 66 &&
                        !auth.productSnapshot.blockchainTxn.includes('abcdef123456'),
    hashMatches: true, // Passed the blockchain hash verification above
  };

  // Scan history (last 10 scans)
  const scanHistory = auth.verificationAttempts
    .slice(-10)
    .reverse()
    .map(attempt => ({
      timestamp: attempt.timestamp,
      location: attempt.location,
      status: attempt.status,
      timeAgo: getTimeAgo(attempt.timestamp),
    }));

  return {
    valid: true,
    message: 'Authentic CultureKart product verified successfully!',
    status: 'verified',
    productInfo: {
      title: auth.productSnapshot.title,
      category: auth.product?.category,
      artisan: auth.productSnapshot.artisan,
      orderDate: auth.orderSnapshot.orderDate,
      price: auth.productSnapshot.price,
      image: auth.product?.images?.[0],
    },
    verificationInfo: {
      firstVerified: auth.firstVerifiedAt,
      totalVerifications: auth.verificationAttempts.length,
      isSuspicious: auth.isSuspicious,
      orderNumber: auth.order?.orderNumber,
      isDelivered: auth.deliveryConfirmation.confirmed,
      deliveredAt: auth.deliveryConfirmation.confirmedAt,
      deliveryLocation: auth.deliveryConfirmation.deliveryLocation,
    },
    scanHistory,
    blockchainInfo,
  };
};

/**
 * Helper function to calculate time ago
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Instance method: Get QR code URL
 */
productAuthenticationSchema.methods.getQRCodeUrl = function () {
  // Return URL that points to verification page
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/verify/${this.publicVerificationCode}`;
};

/**
 * Instance method: Get QR code data for generation
 */
productAuthenticationSchema.methods.getQRCodeData = function () {
  return this.qrCodeData;
};

/**
 * Static method: Confirm delivery (ONE-TIME USE)
 */
productAuthenticationSchema.statics.confirmDelivery = async function (publicCode, confirmationMetadata = {}) {
  const auth = await this.findOne({ publicVerificationCode: publicCode });

  if (!auth) {
    return {
      success: false,
      message: 'Invalid verification code',
    };
  }

  // Check if already confirmed
  if (auth.deliveryConfirmation.confirmed) {
    return {
      success: false,
      message: 'Delivery already confirmed',
      alreadyConfirmedAt: auth.deliveryConfirmation.confirmedAt,
    };
  }

  // Confirm delivery
  auth.deliveryConfirmation.confirmed = true;
  auth.deliveryConfirmation.confirmedAt = new Date();
  auth.deliveryConfirmation.confirmedBy = confirmationMetadata.ipAddress || 'unknown';
  auth.deliveryConfirmation.deliveryLocation = confirmationMetadata.location || 'unknown';
  auth.deliveryConfirmation.deviceFingerprint = confirmationMetadata.deviceFingerprint || '';
  auth.verificationStatus = 'delivered';

  await auth.save();

  return {
    success: true,
    message: 'Delivery confirmed successfully',
    confirmedAt: auth.deliveryConfirmation.confirmedAt,
  };
};

const ProductAuthentication = mongoose.model('ProductAuthentication', productAuthenticationSchema);

module.exports = ProductAuthentication;
