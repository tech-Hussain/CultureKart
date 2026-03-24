/**
 * Cleanup Task for Pending Users
 * Removes expired pending registrations periodically
 */

const PendingUser = require('../models/PendingUser');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientMongoNetworkError = (error) => {
  const message = (error?.message || '').toLowerCase();
  const name = (error?.name || '').toLowerCase();

  return (
    name.includes('poolclearedonnetworkerror') ||
    name.includes('mongonetworktimeouterror') ||
    message.includes('server monitor timeout') ||
    message.includes('connection <monitor>') ||
    message.includes('timed out')
  );
};

/**
 * Clean up expired pending users
 * Runs every 30 minutes to remove expired pending registrations
 */
const cleanupExpiredPendingUsers = async () => {
  try {
    const result = await PendingUser.cleanupExpired();
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired pending registrations`);
    }
  } catch (error) {
    if (isTransientMongoNetworkError(error)) {
      console.warn('⚠️ Transient MongoDB network issue during cleanup. Retrying once...');
      try {
        await sleep(2000);
        const retryResult = await PendingUser.cleanupExpired();
        if (retryResult.deletedCount > 0) {
          console.log(`🧹 Cleaned up ${retryResult.deletedCount} expired pending registrations (after retry)`);
        }
        return;
      } catch (retryError) {
        console.error('❌ Pending user cleanup failed after retry:', retryError.message || retryError);
        return;
      }
    }

    console.error('❌ Error cleaning up pending users:', error.message || error);
  }
};

/**
 * Start the cleanup job
 * Runs immediately and then every 30 minutes
 */
const startCleanupJob = () => {
  // Run cleanup immediately
  cleanupExpiredPendingUsers();

  // Schedule cleanup to run every 30 minutes (1800000 ms)
  const cleanupInterval = setInterval(cleanupExpiredPendingUsers, 30 * 60 * 1000);

  console.log('🧹 Pending user cleanup job started (runs every 30 minutes)');

  return cleanupInterval;
};

/**
 * Stop the cleanup job
 */
const stopCleanupJob = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('🛑 Pending user cleanup job stopped');
  }
};

/**
 * Get statistics about pending users
 */
const getPendingUserStats = async () => {
  try {
    const total = await PendingUser.countDocuments();
    const expiredCount = await PendingUser.countDocuments({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      total,
      expired: expiredCount,
      active: total - expiredCount
    };
  } catch (error) {
    console.error('❌ Error getting pending user stats:', error);
    return { total: 0, expired: 0, active: 0 };
  }
};

module.exports = {
  cleanupExpiredPendingUsers,
  startCleanupJob,
  stopCleanupJob,
  getPendingUserStats,
};