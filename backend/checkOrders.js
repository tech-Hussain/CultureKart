/**
 * Check Orders in Database
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Artisan = require('./src/models/Artisan');
const Product = require('./src/models/Product');

async function checkOrders() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all orders
    const orders = await Order.find({}).populate('items.product').lean();
    console.log(`📦 Total orders in database: ${orders.length}\n`);

    if (orders.length > 0) {
      console.log('📋 Sample Order Details:\n');
      const sampleOrder = orders[0];
      console.log('Order ID:', sampleOrder._id);
      console.log('Order Number:', sampleOrder.orderNumber);
      console.log('Status:', sampleOrder.status);
      console.log('Total:', sampleOrder.total);
      console.log('Buyer:', sampleOrder.buyer);
      console.log('\nItems:');
      sampleOrder.items.forEach((item, idx) => {
        console.log(`  ${idx + 1}. Product:`, item.product?.title || item.title);
        console.log(`     Quantity:`, item.qty);
        console.log(`     Price:`, item.price);
        console.log(`     Artisan ID:`, item.artisan);
      });
      console.log('\n');

      // Check all artisans
      const artisans = await Artisan.find({}).lean();
      console.log(`👥 Total artisans: ${artisans.length}`);
      if (artisans.length > 0) {
        console.log('\nArtisan IDs:');
        artisans.forEach(a => {
          console.log(`  - ${a._id} (User: ${a.user})`);
        });
      }

      // Check if any items have artisan field
      let itemsWithArtisan = 0;
      let itemsWithoutArtisan = 0;
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.artisan) {
            itemsWithArtisan++;
          } else {
            itemsWithoutArtisan++;
          }
        });
      });
      console.log(`\n📊 Items with artisan field: ${itemsWithArtisan}`);
      console.log(`📊 Items without artisan field: ${itemsWithoutArtisan}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOrders();
