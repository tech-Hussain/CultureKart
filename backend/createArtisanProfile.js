require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Artisan = require('./src/models/Artisan');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function createArtisanProfile() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({email: 'hussainextra10@gmail.com'});
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.name, user.email, user.role);

    const existingArtisan = await Artisan.findOne({user: user._id});
    if (existingArtisan) {
      console.log('❌ Artisan profile already exists:', existingArtisan._id);
      return;
    }

    const newArtisan = new Artisan({
      user: user._id,
      displayName: user.name || 'Syed Hussain',
      bio: 'Welcome to my authentic Pakistani crafts shop! I specialize in traditional handmade items.',
      location: 'Pakistan',
      specialty: 'Traditional Crafts',
      verified: false,
      isActive: true
    });

    await newArtisan.save();
    console.log('✅ Artisan profile created successfully!');
    console.log('🆔 Artisan ID:', newArtisan._id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createArtisanProfile();