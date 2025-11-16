/**
 * Script to set admin role for a user by email
 * Usage: node setAdminRole.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node setAdminRole.js <email>');
  process.exit(1);
}

async function setAdminRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('\n💡 Make sure you have logged in at least once with this email');
      process.exit(1);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User role updated successfully!');
    console.log('\nUser Details:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Firebase UID:', user.firebaseUid);
    console.log('\n🎉 You can now access the admin dashboard!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminRole();
