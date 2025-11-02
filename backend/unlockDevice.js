/**
 * Unlock Device
 * Removes all login attempts and clears lock for a specific device ID
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'your-mongodb-uri';

async function unlockDevice(deviceId) {
  try {
    console.log('📊 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all attempts for this device
    const attempts = await AdminLoginAttempt.find({ deviceId });
    
    if (attempts.length === 0) {
      console.log(`ℹ️  No login attempts found for device: ${deviceId}\n`);
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📋 Found ${attempts.length} login attempt(s) for device: ${deviceId.substring(0, 20)}...`);
    
    // Check if device is currently locked
    const lockedAttempts = attempts.filter(a => a.lockUntil && new Date(a.lockUntil) > new Date());
    
    if (lockedAttempts.length > 0) {
      console.log(`🔒 Device is currently locked until: ${lockedAttempts[0].lockUntil}`);
    } else {
      console.log(`ℹ️  Device is not currently locked`);
    }

    // Delete all attempts for this device
    const result = await AdminLoginAttempt.deleteMany({ deviceId });
    
    console.log(`\n✅ Deleted ${result.deletedCount} login attempt(s) for device`);
    console.log(`✅ Device ${deviceId.substring(0, 20)}... has been unlocked!\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error unlocking device:', error);
    process.exit(1);
  }
}

// Get device ID from command line argument
const deviceId = process.argv[2];

if (!deviceId) {
  console.log('❌ Usage: node unlockDevice.js <DEVICE_ID>');
  console.log('📌 Example: node unlockDevice.js a1b2c3d4e5f6...');
  console.log('\n💡 Tip: Check the device ID from the browser console logs during login');
  console.log('   It will show as: 🆔 Device ID initialized');
  process.exit(1);
}

unlockDevice(deviceId);
