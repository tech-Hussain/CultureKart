/**
 * Test artisan balance calculation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Withdrawal = require('./src/models/Withdrawal');
const Order = require('./src/models/Order');
const Artisan = require('./src/models/Artisan');
const User = require('./src/models/User');

async function testArtisanBalance() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find first artisan
    const artisan = await Artisan.findOne().populate('user', 'name email');
    if (!artisan) {
      console.log('❌ No artisan found');
      process.exit(1);
    }

    console.log(`📊 Testing balance for artisan: ${artisan.businessName || artisan.displayName}`);
    console.log(`   Artisan ID: ${artisan._id}`);
    console.log(`   User: ${artisan.user?.name || 'N/A'} (${artisan.user?.email || 'N/A'})\n`);

    // Get escrow summary
    const escrowSummary = await Withdrawal.getArtisanEscrowSummary(artisan._id);
    
    console.log('💰 Escrow Summary:');
    console.log(`   Total Escrow: ₹${escrowSummary.totalEscrow}`);
    console.log(`   Available Balance: ₹${escrowSummary.availableBalance}`);
    console.log(`   Pending Balance: ₹${escrowSummary.pendingBalance}`);
    console.log(`   Orders found: ${escrowSummary.orders?.length || 0}\n`);

    if (escrowSummary.orders && escrowSummary.orders.length > 0) {
      console.log('📦 Order details:');
      escrowSummary.orders.forEach((order, idx) => {
        console.log(`   ${idx + 1}. Order #${order.orderNumber} - ₹${order.amount} (Released: ${order.escrowReleased})`);
      });
    }

    // Check orders in database
    console.log('\n🔍 Checking orders in database...');
    const orders = await Order.find({
      'items.artisan': artisan._id,
      'paymentDistribution.escrowReleased': false
    }).select('_id status paymentInfo.status paymentDistribution items.artisan');

    console.log(`   Found ${orders.length} orders with unreleased escrow for this artisan\n`);

    orders.forEach((order, idx) => {
      const artisanIds = order.items.map(item => item.artisan?.toString()).filter(Boolean);
      const hasThisArtisan = artisanIds.includes(artisan._id.toString());
      console.log(`   Order ${idx + 1}:`);
      console.log(`      ID: ${order._id}`);
      console.log(`      Artisan in order: ${hasThisArtisan ? 'YES' : 'NO'}`);
      console.log(`      Artisan payout: ₹${order.paymentDistribution?.artisanPayout?.amount || 0}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testArtisanBalance();
