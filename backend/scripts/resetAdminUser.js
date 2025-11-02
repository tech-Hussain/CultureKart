/**
 * Delete and Recreate Admin User with Email/Password Authentication
 * Run with: node scripts/resetAdminUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Admin credentials
const ADMIN_EMAIL = 'admin@culturekart.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'CultureKart Admin';

async function resetAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete any existing admin users
    console.log('🗑️  Checking for existing admin users...');
    const existingAdmins = await User.find({ 
      $or: [
        { email: ADMIN_EMAIL },
        { role: 'admin' }
      ]
    });

    if (existingAdmins.length > 0) {
      console.log(`   Found ${existingAdmins.length} existing admin user(s):`);
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.authProvider})`);
      });
      
      console.log('\n🗑️  Deleting existing admin users...');
      const deleteResult = await User.deleteMany({ 
        $or: [
          { email: ADMIN_EMAIL },
          { role: 'admin' }
        ]
      });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} admin user(s)\n`);
    } else {
      console.log('   No existing admin users found\n');
    }

    // Create new admin user with email/password
    console.log('📝 Creating new admin user...');
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
    console.log('=' .repeat(60));
    console.log('📋 ADMIN ACCOUNT DETAILS');
    console.log('=' .repeat(60));
    console.log('ID:              ', admin._id);
    console.log('Email:           ', admin.email);
    console.log('Name:            ', admin.name);
    console.log('Role:            ', admin.role);
    console.log('Auth Provider:   ', admin.authProvider);
    console.log('Email Verified:  ', admin.emailVerified);
    console.log('Active:          ', admin.isActive);
    console.log('Created:         ', admin.createdAt);
    console.log('=' .repeat(60));
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('=' .repeat(60));
    console.log('Email:           ', ADMIN_EMAIL);
    console.log('Password:        ', ADMIN_PASSWORD);
    console.log('=' .repeat(60));
    console.log('\n📍 ADMIN LOGIN URLS:');
    console.log('   Local:        http://localhost:5173/admin/login');
    console.log('   Production:   https://yourdomain.com/admin/login');
    console.log('\n⚠️  SECURITY REMINDER:');
    console.log('   1. Change the admin password after first login');
    console.log('   2. Keep admin credentials secure');
    console.log('   3. Use strong passwords in production');

    await mongoose.connection.close();
    console.log('\n✅ Done! Admin user is ready to use.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error - Check database for existing entries');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
resetAdminUser();
