require('dotenv').config();
const mongoose = require('mongoose');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = require('./src/models/User');
    const Artisan = require('./src/models/Artisan');
    const Product = require('./src/models/Product');
    const Order = require('./src/models/Order');

    const [users, artisans, products, orders] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Artisan.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    console.log('📊 Dashboard Data:');
    console.log('==================');
    console.log(`Users (active): ${users}`);
    console.log(`Artisans (active): ${artisans}`);
    console.log(`Products (total): ${products}`);
    console.log(`Orders (total): ${orders}`);
    
    // Get pending artisans
    const pendingArtisans = await Artisan.countDocuments({ 
      isActive: true, 
      isVerified: false 
    });
    console.log(`Artisans (pending): ${pendingArtisans}`);
    
    // Get some sample order data
    const sampleOrders = await Order.find().limit(3).select('total status createdAt');
    console.log('\n📦 Sample Orders:');
    sampleOrders.forEach(order => {
      console.log(`  - Total: Rs ${order.total}, Status: ${order.status}, Date: ${order.createdAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
