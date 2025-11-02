/**
 * Admin Login Attempt Model
 * Logs all admin login attempts for security monitoring
 * Implements rate limiting: 3 failed attempts = 5 minute lock
 */

const mongoose = require('mongoose');

const adminLoginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    success: {
      type: Boolean,
      required: true,
      default: false,
    },
    failureReason: {
      type: String,
      enum: [
        'invalid_credentials',
        'user_not_found',
        'account_locked',
        'not_admin',
        'invalid_token',
        'server_error',
      ],
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for querying recent attempts by email
adminLoginAttemptSchema.index({ email: 1, createdAt: -1 });

// Index for querying attempts by IP address
adminLoginAttemptSchema.index({ ipAddress: 1, createdAt: -1 });

// Index for cleaning up old records (TTL index - expires after 30 days)
adminLoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Static method to check if account is locked
adminLoginAttemptSchema.statics.isAccountLocked = async function (email) {
  const now = new Date();
  
  // Find the most recent attempt for this email
  const recentAttempt = await this.findOne({
    email,
    lockUntil: { $gt: now },
  }).sort({ createdAt: -1 });

  if (recentAttempt) {
    return {
      locked: true,
      lockUntil: recentAttempt.lockUntil,
      remainingTime: Math.ceil((recentAttempt.lockUntil - now) / 1000), // seconds
    };
  }

  return { locked: false };
};

// Static method to get failed attempts count in last 5 minutes
adminLoginAttemptSchema.statics.getRecentFailedAttempts = async function (email) {
  const now = new Date();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Find the most recent successful login or expired lock
  const lastSuccess = await this.findOne({
    email,
    $or: [
      { success: true },
      { lockUntil: { $lt: now }, lockUntil: { $ne: null } } // Expired locks
    ]
  }).sort({ createdAt: -1 });

  // Count failed attempts since last success or after most recent expired lock
  const countSince = lastSuccess ? lastSuccess.createdAt : fiveMinutesAgo;
  
  const failedAttempts = await this.countDocuments({
    email,
    success: false,
    failureReason: { $ne: 'account_locked' }, // Don't count attempts while already locked
    createdAt: { $gte: countSince, $gte: fiveMinutesAgo }, // Within last 5 minutes AND after last success
  });

  return failedAttempts;
};

// Static method to get failed attempts count by IP address in last 5 minutes
// Used for tracking attempts from same IP with different wrong emails
// Does NOT reset on successful login - IP stays locked for full duration
adminLoginAttemptSchema.statics.getRecentFailedAttemptsByIP = async function (ipAddress) {
  const now = new Date();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Count all failed attempts from this IP in last 5 minutes
  // Do NOT reset counter on successful login - lock persists
  const failedAttempts = await this.countDocuments({
    ipAddress,
    success: false,
    failureReason: { $ne: 'account_locked', $ne: 'ip_locked' }, // Don't count attempts while already locked
    createdAt: { $gte: fiveMinutesAgo },
  });

  return failedAttempts;
};

// Static method to check if IP is locked
adminLoginAttemptSchema.statics.isIPLocked = async function (ipAddress) {
  const now = new Date();
  
  // Find the most recent attempt from this IP that has a lock
  const recentAttempt = await this.findOne({
    ipAddress,
    lockUntil: { $gt: now },
  }).sort({ createdAt: -1 });

  if (recentAttempt) {
    return {
      locked: true,
      lockUntil: recentAttempt.lockUntil,
      remainingTime: Math.ceil((recentAttempt.lockUntil - now) / 1000), // seconds
      email: recentAttempt.email,
    };
  }

  return { locked: false };
};

// Static method to log login attempt
adminLoginAttemptSchema.statics.logAttempt = async function ({
  email,
  ipAddress,
  userAgent,
  success,
  failureReason = null,
}) {
  const attemptData = {
    email,
    ipAddress,
    userAgent,
    success,
    failureReason,
  };

  // If failed, check if we need to lock the IP
  if (!success) {
    // Always count by IP address (not by email)
    const recentFailedAttempts = await this.getRecentFailedAttemptsByIP(ipAddress);
    
    console.log(`📊 Login attempt for ${email} from IP ${ipAddress}:`);
    console.log(`   Failure reason: ${failureReason}`);
    console.log(`   Recent failed attempts from IP: ${recentFailedAttempts}`);
      
    attemptData.attemptNumber = recentFailedAttempts + 1;
    console.log(`   New attempt number: ${attemptData.attemptNumber}`);

    // Lock IP after 3 failed attempts
    if (attemptData.attemptNumber >= 3) {
      attemptData.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      console.log(`   🔒 LOCKING IP - lockUntil: ${attemptData.lockUntil}`);
    }
  }

  const attempt = await this.create(attemptData);
  return attempt;
};

// Static method to clear lock (admin can manually unlock)
adminLoginAttemptSchema.statics.clearLock = async function (email) {
  await this.updateMany(
    { email },
    { $set: { lockUntil: null } }
  );
};

// Static method to get login statistics
adminLoginAttemptSchema.statics.getStatistics = async function (email, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    {
      $match: {
        email,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        successfulAttempts: {
          $sum: { $cond: ['$success', 1, 0] },
        },
        failedAttempts: {
          $sum: { $cond: ['$success', 0, 1] },
        },
        uniqueIPs: { $addToSet: '$ipAddress' },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      uniqueIPs: 0,
    };
  }

  return {
    ...stats[0],
    uniqueIPs: stats[0].uniqueIPs.length,
  };
};

const AdminLoginAttempt = mongoose.model('AdminLoginAttempt', adminLoginAttemptSchema);

module.exports = AdminLoginAttempt;
