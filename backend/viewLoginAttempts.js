/**
 * Admin Login Attempts Viewer
 * View all admin login attempts from the database
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'your-mongodb-uri';

async function viewLoginAttempts() {
  try {
    console.log('📊 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all login attempts, sorted by most recent
    const attempts = await AdminLoginAttempt.find({})
      .sort({ createdAt: -1 })
      .limit(20);
    
    if (attempts.length === 0) {
      console.log('ℹ️  No login attempts found');
      process.exit(0);
    }
    
    console.log('🔐 Recent Admin Login Attempts (Last 20)');
    console.log('='.repeat(80));
    
    attempts.forEach((attempt, index) => {
      const status = attempt.success ? '✅ SUCCESS' : '❌ FAILED';
      const lockStatus = attempt.lockUntil && new Date(attempt.lockUntil) > new Date()
        ? `🔒 LOCKED until ${new Date(attempt.lockUntil).toLocaleString()}`
        : '';
      
      console.log(`\n${index + 1}. ${status} ${lockStatus}`);
      console.log(`   Email: ${attempt.email}`);
      console.log(`   IP: ${attempt.ipAddress}`);
      console.log(`   Time: ${attempt.createdAt.toLocaleString()}`);
      
      if (!attempt.success) {
        console.log(`   Reason: ${attempt.failureReason || 'unknown'}`);
        console.log(`   Attempt #: ${attempt.attemptNumber}`);
      }
      
      if (attempt.userAgent && attempt.userAgent !== 'Unknown') {
        console.log(`   User Agent: ${attempt.userAgent.substring(0, 60)}...`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Get statistics for admin email
    const adminEmail = 'admin@culturekart.com';
    const stats = await AdminLoginAttempt.getStatistics(adminEmail, 7);
    
    console.log(`\n📈 Statistics for ${adminEmail} (Last 7 days):`);
    console.log(`   Total Attempts: ${stats.totalAttempts}`);
    console.log(`   Successful: ${stats.successfulAttempts}`);
    console.log(`   Failed: ${stats.failedAttempts}`);
    console.log(`   Unique IPs: ${stats.uniqueIPs}`);
    
    // Check if currently locked
    const lockStatus = await AdminLoginAttempt.isAccountLocked(adminEmail);
    if (lockStatus.locked) {
      console.log(`\n🔒 Account Status: LOCKED`);
      console.log(`   Lock Until: ${lockStatus.lockUntil.toLocaleString()}`);
      console.log(`   Remaining: ${Math.ceil(lockStatus.remainingTime / 60)} minutes`);
    } else {
      console.log(`\n✅ Account Status: UNLOCKED`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

viewLoginAttempts();
