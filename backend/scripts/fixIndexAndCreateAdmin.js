/**
 * Fix Firebase UID Index and Create Admin User
 * This script drops the old firebaseUid index and recreates it properly
 * Run with: node scripts/fixIndexAndCreateAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Admin credentials
const ADMIN_EMAIL = 'admin@culturekart.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'CultureKart Admin';

async function fixIndexAndCreateAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Drop the problematic firebaseUid index
    console.log('🔧 Fixing firebaseUid index...');
    try {
      await User.collection.dropIndex('firebaseUid_1');
      console.log('   ✅ Dropped old firebaseUid index');
    } catch (error) {
      if (error.code === 27) {
        console.log('   ℹ️  Index already dropped or doesn\'t exist');
      } else {
        console.log('   ⚠️  Could not drop index:', error.message);
      }
    }

    // Step 2: Create new sparse unique index for firebaseUid
    console.log('   Creating new sparse unique index...');
    try {
      await User.collection.createIndex(
        { firebaseUid: 1 }, 
        { unique: true, sparse: true }
      );
      console.log('   ✅ Created sparse unique index for firebaseUid\n');
    } catch (error) {
      console.log('   ⚠️  Index creation warning:', error.message);
    }

    // Step 3: Check for existing admin users
    console.log('🔍 Checking for existing admin users...');
    const existingAdmins = await User.find({ 
      $or: [
        { email: ADMIN_EMAIL },
        { role: 'admin' }
      ]
    });

    if (existingAdmins.length > 0) {
      console.log(`   Found ${existingAdmins.length} existing admin user(s):`);
      existingAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.authProvider || 'N/A'})`);
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

    // Step 4: Clean up any users with null firebaseUid and email/password auth
    console.log('🧹 Cleaning up orphaned users with null firebaseUid...');
    const orphanedUsers = await User.find({ 
      firebaseUid: null,
      authProvider: { $ne: 'email-password' }
    });
    
    if (orphanedUsers.length > 0) {
      console.log(`   Found ${orphanedUsers.length} orphaned user(s)`);
      await User.deleteMany({ 
        firebaseUid: null,
        authProvider: { $ne: 'email-password' }
      });
      console.log('   ✅ Cleaned up orphaned users\n');
    } else {
      console.log('   No orphaned users found\n');
    }

    // Step 5: Create new admin user with email/password
    console.log('📝 Creating new admin user...');
    const admin = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Will be hashed by pre-save hook
      name: ADMIN_NAME,
      role: 'admin',
      authProvider: 'email-password',
      emailVerified: true,
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
    console.log('=' .repeat(70));
    console.log('📋 ADMIN ACCOUNT DETAILS');
    console.log('=' .repeat(70));
    console.log('ID:              ', admin._id);
    console.log('Email:           ', admin.email);
    console.log('Name:            ', admin.name);
    console.log('Role:            ', admin.role);
    console.log('Auth Provider:   ', admin.authProvider);
    console.log('Email Verified:  ', admin.emailVerified);
    console.log('Active:          ', admin.isActive);
    console.log('Created:         ', admin.createdAt);
    console.log('=' .repeat(70));
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('=' .repeat(70));
    console.log('Email:           ', ADMIN_EMAIL);
    console.log('Password:        ', ADMIN_PASSWORD);
    console.log('=' .repeat(70));
    console.log('\n📍 ADMIN LOGIN URL:');
    console.log('   Local:        http://localhost:5173/admin/login');
    console.log('\n💡 HOW TO LOGIN:');
    console.log('   1. Go to http://localhost:5173/admin/login');
    console.log('   2. Enter email: admin@culturekart.com');
    console.log('   3. Enter password: Admin@123456');
    console.log('   4. Click "Sign In"');
    console.log('\n⚠️  SECURITY REMINDERS:');
    console.log('   • Change the admin password after first login');
    console.log('   • Keep admin credentials secure');
    console.log('   • Use strong passwords in production');
    console.log('   • Enable 2FA when available');

    await mongoose.connection.close();
    console.log('\n✅ Done! Admin user is ready to use.\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('\n   Duplicate key error detected.');
      console.error('   This usually means there are still conflicting records.');
      console.error('   You may need to manually clean the database.\n');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
fixIndexAndCreateAdmin();
