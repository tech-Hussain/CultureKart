/**
 * Check escrow data in database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function checkEscrowData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find paid orders with unreleased escrow
    const orders = await Order.find({
      status: { $in: ['pending', 'processing', 'shipped', 'delivered'] },
      'paymentDistribution.escrowReleased': false,
      $or: [
        { 'paymentInfo.status': 'completed' },
        { paymentMethod: 'cod', status: { $in: ['processing', 'shipped', 'delivered'] } }
      ]
    })
      .select('_id status paymentMethod paymentInfo paymentDistribution')
      .limit(5);

    console.log(`\n📊 Found ${orders.length} orders with unreleased escrow:\n`);

    orders.forEach((order, idx) => {
      console.log(`Order ${idx + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Method: ${order.paymentMethod}`);
      console.log(`  Payment Info Status: ${order.paymentInfo?.status || 'N/A'}`);
      console.log(`  Payment Distribution:`, JSON.stringify(order.paymentDistribution, null, 4));
      console.log(`  Artisan Payout Amount: ₹${order.paymentDistribution?.artisanPayout?.amount || 0}`);
      console.log('');
    });

    // Calculate total
    const total = orders.reduce((sum, order) => {
      return sum + (order.paymentDistribution?.artisanPayout?.amount || 0);
    }, 0);

    console.log(`💰 Total Pending Escrow: ₹${total}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEscrowData();
