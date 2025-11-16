require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Artisan = require('./src/models/Artisan');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const Cart = require('./src/models/Cart');

const clearAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete everything
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    
    console.log('🗑️  All data cleared');

    // Keep only admin account
    const admin = await User.create({
      email: 'admin@culturekart.com',
      name: 'CultureKart Admin',
      role: 'admin',
      isActive: true,
      authProvider: 'email-password',
      profile: {},
    });

    console.log('✅ Admin account created:', admin.email);
    console.log('\n📊 Database is now clean with only admin account');
    console.log('   Users: 1 (admin@culturekart.com)');
    console.log('   Products: 0');
    console.log('   Orders: 0');
    console.log('   Artisans: 0');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
};

clearAllData();
