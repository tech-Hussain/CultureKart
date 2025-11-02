/**
 * Unlock Admin Account
 * Manually clear the lock on an admin account
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'your-mongodb-uri';

async function unlockAccount(email) {
  try {
    console.log('📊 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check current lock status
    const lockStatus = await AdminLoginAttempt.isAccountLocked(email);
    
    if (!lockStatus.locked) {
      console.log(`ℹ️  Account ${email} is not currently locked`);
      process.exit(0);
    }
    
    console.log(`🔒 Current Status:`);
    console.log(`   Email: ${email}`);
    console.log(`   Locked Until: ${lockStatus.lockUntil.toLocaleString()}`);
    console.log(`   Remaining: ${Math.ceil(lockStatus.remainingTime / 60)} minutes\n`);
    
    // Clear the lock
    await AdminLoginAttempt.clearLock(email);
    
    console.log(`✅ Lock cleared successfully!`);
    console.log(`   ${email} can now login again\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Usage: node unlockAccount.js <email>');
  console.log('   Example: node unlockAccount.js admin@culturekart.com');
  process.exit(1);
}

unlockAccount(email);
