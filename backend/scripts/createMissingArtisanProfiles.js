/**
 * Create Artisan Profiles for Users with 'artisan' role
 * Fixes missing Artisan documents for users who have role='artisan' in User model
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Artisan = require('../src/models/Artisan');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culturekart';

async function createMissingArtisanProfiles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with role 'artisan'
    const artisanUsers = await User.find({ role: 'artisan' });
    console.log(`\n📊 Found ${artisanUsers.length} users with role 'artisan'`);

    if (artisanUsers.length === 0) {
      console.log('ℹ️  No artisan users found');
      await mongoose.connection.close();
      return;
    }

    let created = 0;
    let alreadyExists = 0;

    for (const user of artisanUsers) {
      // Check if Artisan profile already exists
      const existingArtisan = await Artisan.findOne({ user: user._id });

      if (existingArtisan) {
        console.log(`✓ Artisan profile already exists for: ${user.email}`);
        alreadyExists++;
      } else {
        // Create Artisan profile
        const artisan = await Artisan.create({
          user: user._id,
          displayName: user.name || user.email.split('@')[0],
          bio: user.profile?.bio || 'A passionate artisan creating unique handcrafted products.',
          location: user.profile?.location || user.profile?.city || user.profile?.country || 'Not specified',
          specialty: '',
          portfolio: [],
          verified: false,
          isActive: true,
        });

        console.log(`✅ Created Artisan profile for: ${user.email}`);
        created++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Already existed: ${alreadyExists}`);
    console.log(`   Total: ${artisanUsers.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
createMissingArtisanProfiles();
