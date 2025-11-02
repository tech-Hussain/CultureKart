/**
 * Clear All Login Attempts
 * Removes all login attempt records for testing
 */

const mongoose = require('mongoose');
const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'your-mongodb-uri';

async function clearAllAttempts() {
  try {
    console.log('📊 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Delete all login attempts
    const result = await AdminLoginAttempt.deleteMany({});
    
    console.log(`🗑️  Deleted ${result.deletedCount} login attempt records`);
    console.log('✅ All login attempts cleared!\n');
    console.log('You can now test the login flow from scratch.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

clearAllAttempts();
