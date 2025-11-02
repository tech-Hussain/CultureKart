/**
 * Script to create admin user directly in MongoDB
 * This creates the user entry that will be linked when they login via Firebase
 * Run: node scripts/createAdminSimple.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const ADMIN_EMAIL = 'admin@culturekart.com';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log('✅ Existing user updated to admin role');
    } else {
      // Create new admin user
      // Note: firebaseUid will be set when user logs in via Firebase
      user = new User({
        firebaseUid: 'admin-temp-uid', // Temporary UID, will be updated on login
        email: ADMIN_EMAIL,
        name: 'Admin User',
        role: 'admin',
        emailVerified: true,
        isActive: true,
        profile: {
          avatar: '',
        },
      });
      await user.save();
      console.log('✅ Admin user entry created in MongoDB');
    }

    console.log('\n=================================');
    console.log('🎉 ADMIN ACCOUNT SETUP');
    console.log('=================================');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password: Set via Firebase');
    console.log('👤 Role: admin');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Add user with email: admin@culturekart.com');
    console.log('4. Set password: Admin@123456 (or your choice)');
    console.log('\n🔗 Login URL: http://localhost:5173/login');
    console.log('🏠 Admin Dashboard: http://localhost:5173/admin/dashboard');
    console.log('=================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdminUser();
