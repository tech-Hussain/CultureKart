/**
 * Check if login attempts are saved in MongoDB Atlas
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function checkData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...\n');
    console.log('📍 Connection string:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('');
    
    // Count total documents
    const totalCount = await AdminLoginAttempt.countDocuments();
    console.log(`📈 Total login attempts: ${totalCount}`);
    
    // Get recent attempts
    const recentAttempts = await AdminLoginAttempt.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\n📋 Last ${recentAttempts.length} login attempts:\n`);
    
    recentAttempts.forEach((attempt, index) => {
      console.log(`${index + 1}. Email: ${attempt.email}`);
      console.log(`   IP: ${attempt.ipAddress}`);
      console.log(`   Success: ${attempt.success}`);
      console.log(`   Reason: ${attempt.failureReason || 'N/A'}`);
      console.log(`   Time: ${attempt.createdAt}`);
      console.log(`   Locked Until: ${attempt.lockUntil || 'Not locked'}`);
      console.log('');
    });
    
    // Check for currently locked IPs
    const now = new Date();
    const lockedIPs = await AdminLoginAttempt.find({
      lockUntil: { $gt: now }
    });
    
    console.log(`🔒 Currently locked IPs: ${lockedIPs.length}\n`);
    
    lockedIPs.forEach((attempt, index) => {
      const remainingSeconds = Math.ceil((attempt.lockUntil - now) / 1000);
      console.log(`${index + 1}. IP: ${attempt.ipAddress}`);
      console.log(`   Email: ${attempt.email}`);
      console.log(`   Locked until: ${attempt.lockUntil}`);
      console.log(`   Remaining: ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`);
      console.log('');
    });
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
