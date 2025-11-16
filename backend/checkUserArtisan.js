/**
 * Check User-Artisan Mapping
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Artisan = require('./src/models/Artisan');

async function checkUserArtisan() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // The artisan ID that has orders
    const artisanWithOrders = await Artisan.findById('6910ad59f429cc234a6e6acb').lean();
    if (artisanWithOrders) {
      console.log('👨‍🎨 Artisan with orders:');
      console.log('  Artisan ID:', artisanWithOrders._id);
      console.log('  User ID:', artisanWithOrders.user);
      
      const user = await User.findById(artisanWithOrders.user).lean();
      if (user) {
        console.log('  User Email:', user.email);
        console.log('  User Name:', user.name);
        console.log('  User Role:', user.role);
      }
    }

    console.log('\n📋 All Artisans:');
    const allArtisans = await Artisan.find({}).populate('user').lean();
    for (const artisan of allArtisans) {
      console.log(`\n  Artisan ID: ${artisan._id}`);
      console.log(`  User ID: ${artisan.user._id}`);
      console.log(`  Email: ${artisan.user.email}`);
      console.log(`  Name: ${artisan.user.name}`);
      console.log(`  Role: ${artisan.user.role}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserArtisan();
