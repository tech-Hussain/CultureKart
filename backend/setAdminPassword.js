const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function setAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@culturekart.com';
    const password = 'Admin@123456';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update admin user with password
    const result = await User.updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          emailVerified: true,
          isActive: true
        } 
      }
    );

    console.log('✅ Admin password updated:', result);

    // Verify it works
    const admin = await User.findOne({ email: email }).select('+password');
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('✅ Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdminPassword();
