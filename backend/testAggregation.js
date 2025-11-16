/**
 * Test Order Stats Aggregation
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Artisan = require('./src/models/Artisan');
const Product = require('./src/models/Product');

async function testAggregation() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check which artisans have orders
    const allOrders = await Order.find({}).lean();
    const artisanIdsInOrders = new Set();
    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.artisan) {
          artisanIdsInOrders.add(item.artisan.toString());
        }
      });
    });
    
    console.log('Artisan IDs that have orders:', Array.from(artisanIdsInOrders));
    console.log('');

    // Get an artisan ID that actually has orders
    const artisanIdStr = Array.from(artisanIdsInOrders)[0];
    if (!artisanIdStr) {
      console.log('❌ No artisan IDs found in orders');
      process.exit(1);
    }
    
    const artisanId = new mongoose.Types.ObjectId(artisanIdStr);
    const artisan = await Artisan.findById(artisanId).lean();
    
    console.log('Testing with Artisan ID:', artisanId);
    console.log('Artisan User:', artisan?.user, '\n');

    // Test the aggregation that's in the backend
    console.log('🔍 Testing aggregation...\n');
    const statusStats = await Order.aggregate([
      {
        $match: { 'items.artisan': new mongoose.Types.ObjectId(artisanId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Aggregation result:', JSON.stringify(statusStats, null, 2));

    // Convert to object format (same as backend)
    const stats = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };
    
    statusStats.forEach(stat => {
      if (stats.hasOwnProperty(stat._id)) {
        stats[stat._id] = stat.count;
      }
    });
    
    const totalOrders = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    console.log('\n📊 Final stats object:');
    console.log({
      ...stats,
      total: totalOrders
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAggregation();
