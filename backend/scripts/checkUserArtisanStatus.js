/**
 * Check user and artisan status by email
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Artisan = require('../src/models/Artisan');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culturekart';

async function checkUser(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      await mongoose.connection.close();
      return;
    }

    console.log('👤 User Information:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebaseUid || 'N/A'}`);
    console.log(`   Auth Provider: ${user.authProvider}`);
    console.log(`   Created: ${user.createdAt}`);

    const artisan = await Artisan.findOne({ user: user._id });
    
    if (artisan) {
      console.log('\n🎨 Artisan Profile:');
      console.log(`   Display Name: ${artisan.displayName}`);
      console.log(`   Bio: ${artisan.bio}`);
      console.log(`   Location: ${artisan.location}`);
      console.log(`   Verified: ${artisan.verified ? 'Yes ✅' : 'No ❌'}`);
      console.log(`   Active: ${artisan.isActive ? 'Yes' : 'No'}`);
      console.log(`   Total Products: ${artisan.totalProducts}`);
    } else {
      console.log('\n❌ No Artisan profile found');
      
      if (user.role === 'artisan') {
        console.log('\n⚠️  User has role "artisan" but no Artisan profile!');
        console.log('   Creating Artisan profile...');
        
        const newArtisan = await Artisan.create({
          user: user._id,
          displayName: user.name || user.email.split('@')[0],
          bio: user.profile?.bio || 'A passionate artisan creating unique handcrafted products.',
          location: user.profile?.location || 'Not specified',
          specialty: '',
          portfolio: [],
          verified: false,
          isActive: true,
        });
        
        console.log('   ✅ Artisan profile created successfully!');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2] || 'hussainextra10@gmail.com';
checkUser(email);
