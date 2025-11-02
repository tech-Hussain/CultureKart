/**
 * Create Admin User with Email/Password Authentication
 * Run with: node scripts/createAdminEmailPassword.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Admin credentials
const ADMIN_EMAIL = 'admin@culturekart.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'CultureKart Admin';

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('   Auth Provider:', existingAdmin.authProvider);
      console.log('   Created:', existingAdmin.createdAt);

      // Ask if user wants to delete and recreate
      console.log('\n❓ To recreate admin, first delete the existing one from MongoDB.');
      console.log('   Or update the password using the password reset functionality.');
      
      await mongoose.connection.close();
      return;
    }

    // Create new admin user with email/password
    console.log('📝 Creating admin user...');
    const admin = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Will be hashed by pre-save hook
      name: ADMIN_NAME,
      role: 'admin',
      authProvider: 'email-password',
      emailVerified: true, // Admin is pre-verified
      isActive: true,
      profile: {
        bio: 'Platform Administrator',
        location: 'CultureKart HQ',
        phone: '',
        avatar: '',
      },
    });

    await admin.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('   ID:', admin._id);
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   Auth Provider:', admin.authProvider);
    console.log('   Email Verified:', admin.emailVerified);
    console.log('   Created:', admin.createdAt);
    console.log('\n🔐 Login Credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n📍 Admin Login URL:');
    console.log('   Local: http://localhost:5173/admin/login');
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

    await mongoose.connection.close();
    console.log('\n✅ Done! Admin user is ready to use.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error - Admin email already exists');
    }
    process.exit(1);
  }
}

// Run the script
createAdminUser();
