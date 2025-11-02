/**
 * Unlock IP Address
 * Removes all login attempts and clears lock for a specific IP address
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'your-mongodb-uri';

async function unlockIP(ipAddress) {
  try {
    console.log('📊 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all attempts for this IP
    const attempts = await AdminLoginAttempt.find({ ipAddress });
    
    if (attempts.length === 0) {
      console.log(`ℹ️  No login attempts found for IP: ${ipAddress}\n`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📋 Found ${attempts.length} login attempt(s) for IP: ${ipAddress}`);
    
    // Check if IP is currently locked
    const lockedAttempts = attempts.filter(a => a.lockUntil && new Date(a.lockUntil) > new Date());
    
    if (lockedAttempts.length > 0) {
      console.log(`🔒 IP is currently locked until: ${lockedAttempts[0].lockUntil}`);
    } else {
      console.log(`ℹ️  IP is not currently locked`);
    }

    // Delete all attempts for this IP
    const result = await AdminLoginAttempt.deleteMany({ ipAddress });
    
    console.log(`\n✅ Deleted ${result.deletedCount} login attempt(s) for IP: ${ipAddress}`);
    console.log(`✅ IP ${ipAddress} has been unlocked!\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error unlocking IP:', error);
    process.exit(1);
  }
}

// Get IP from command line argument
const ipAddress = process.argv[2];

if (!ipAddress) {
  console.log('❌ Usage: node unlockIP.js <IP_ADDRESS>');
  console.log('📌 Example: node unlockIP.js 192.168.1.100');
  console.log('📌 Example: node unlockIP.js ::1 (for localhost)');
  process.exit(1);
}

unlockIP(ipAddress);
