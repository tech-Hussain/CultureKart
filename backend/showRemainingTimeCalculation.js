/**
 * Demonstrate how remainingTime is calculated from lockUntil
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function showCalculation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Find locked IPs
    const now = new Date();
    const lockedAttempts = await AdminLoginAttempt.find({
      lockUntil: { $gt: now }
    }).sort({ lockUntil: -1 });
    
    if (lockedAttempts.length === 0) {
      console.log('ℹ️  No currently locked IPs found');
      console.log('📝 Note: Locks expire after 5 minutes\n');
    } else {
      console.log(`🔒 Found ${lockedAttempts.length} locked IP(s)\n`);
      
      lockedAttempts.forEach((attempt, index) => {
        console.log(`${index + 1}. IP Address: ${attempt.ipAddress}`);
        console.log(`   Email: ${attempt.email}`);
        console.log(`   Created: ${attempt.createdAt}`);
        console.log(`   Lock Until: ${attempt.lockUntil}`);
        
        // Calculate remaining time (this is what the API does)
        const remainingMs = attempt.lockUntil - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        console.log(`   📊 CALCULATION:`);
        console.log(`      lockUntil: ${attempt.lockUntil.getTime()}`);
        console.log(`      now:       ${now.getTime()}`);
        console.log(`      difference: ${remainingMs} ms`);
        console.log(`   ⏱️  Remaining Time: ${remainingSeconds} seconds (${minutes}m ${seconds}s)`);
        console.log('');
      });
    }
    
    // Now call the isIPLocked method to see what it returns
    console.log('📡 Testing isIPLocked() method:\n');
    
    const testIP = '::1'; // localhost
    const lockStatus = await AdminLoginAttempt.isIPLocked(testIP);
    
    console.log(`IP: ${testIP}`);
    console.log(`Locked: ${lockStatus.locked}`);
    if (lockStatus.locked) {
      console.log(`Lock Until: ${lockStatus.lockUntil}`);
      console.log(`Remaining Time: ${lockStatus.remainingTime} seconds`);
      console.log(`\n✅ See? remainingTime is CALCULATED, not stored!`);
    } else {
      console.log('Not locked or lock expired');
    }
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showCalculation();
