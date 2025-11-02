/**
 * Script to create admin user
 * Run: node scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const User = require('../src/models/User');

const ADMIN_EMAIL = 'admin@culturekart.com';
const ADMIN_PASSWORD = 'Admin@123456';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const auth = admin.auth();

    // Create or get Firebase user
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('📧 Firebase user already exists');
      
      // Update password
      await auth.updateUser(firebaseUser.uid, {
        password: ADMIN_PASSWORD,
      });
      console.log('🔑 Password updated');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        firebaseUser = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'Admin User',
          emailVerified: true,
        });
        console.log('✅ Firebase user created');
      } else {
        throw err;
      }
    }

    // Create or update user in MongoDB
    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (!user) {
      user = new User({
        firebaseUid: firebaseUser.uid,
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
      console.log('✅ Admin user created in MongoDB');
    } else {
      user.role = 'admin';
      user.firebaseUid = firebaseUser.uid;
      user.isActive = true;
      await user.save();
      console.log('✅ Existing user updated to admin role');
    }

    console.log('\n=================================');
    console.log('🎉 ADMIN ACCOUNT READY');
    console.log('=================================');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('👤 Role: admin');
    console.log('🔗 Login URL: http://localhost:5173/login');
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
