/**
 * Check artisan IDs in orders
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Artisan = require('./src/models/Artisan');

async function checkArtisanIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get orders with unreleased escrow
    const orders = await Order.find({
      'paymentDistribution.escrowReleased': false,
      'paymentInfo.status': 'completed'
    }).select('_id items.artisan paymentDistribution');

    console.log(`📦 Found ${orders.length} orders with unreleased escrow\n`);

    const artisanIds = new Set();

    orders.forEach((order, idx) => {
      console.log(`Order ${idx + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Escrow Amount: ₹${order.paymentDistribution?.artisanPayout?.amount || 0}`);
      console.log(`  Items artisan IDs:`);
      
      order.items.forEach((item, itemIdx) => {
        const artisanId = item.artisan?.toString() || 'null';
        console.log(`    Item ${itemIdx + 1}: ${artisanId}`);
        if (artisanId !== 'null') {
          artisanIds.add(artisanId);
        }
      });
      console.log('');
    });

    console.log(`\n🔍 Unique artisan IDs in orders: ${artisanIds.size}\n`);

    for (const artisanId of artisanIds) {
      const artisan = await Artisan.findById(artisanId).populate('user', 'name email');
      if (artisan) {
        console.log(`✅ Artisan found: ${artisan.businessName || artisan.displayName}`);
        console.log(`   ID: ${artisan._id}`);
        console.log(`   User: ${artisan.user?.name || 'N/A'}`);
      } else {
        console.log(`❌ Artisan NOT found for ID: ${artisanId}`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkArtisanIds();
