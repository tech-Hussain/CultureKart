/**
 * Check specific artisan balance by email
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Withdrawal = require('./src/models/Withdrawal');
const Order = require('./src/models/Order');
const Artisan = require('./src/models/Artisan');
const User = require('./src/models/User');

async function checkSpecificArtisan() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email: 'hussainextra10@gmail.com' });
    if (!user) {
      console.log('❌ User not found with email: hussainextra10@gmail.com');
      process.exit(1);
    }

    console.log(`👤 User found: ${user.name}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   Email: ${user.email}\n`);

    // Find artisan profile
    const artisan = await Artisan.findOne({ user: user._id });
    if (!artisan) {
      console.log('❌ No artisan profile found for this user');
      process.exit(1);
    }

    console.log(`🎨 Artisan found: ${artisan.businessName || artisan.displayName}`);
    console.log(`   Artisan ID: ${artisan._id}\n`);

    // Get escrow summary
    console.log('💰 Calculating escrow summary...\n');
    const escrowSummary = await Withdrawal.getArtisanEscrowSummary(artisan._id);
    
    console.log('📊 Escrow Summary:');
    console.log(`   Total Escrow: ₹${escrowSummary.totalEscrow}`);
    console.log(`   Available Balance: ₹${escrowSummary.availableBalance}`);
    console.log(`   Pending Balance: ₹${escrowSummary.pendingBalance}`);
    console.log(`   Orders found: ${escrowSummary.orders?.length || 0}\n`);

    // Check all orders with this artisan
    const allOrders = await Order.find({
      'items.artisan': artisan._id
    }).select('_id status paymentInfo paymentDistribution items.artisan').sort({ createdAt: -1 });

    console.log(`📦 All orders for this artisan: ${allOrders.length}\n`);

    allOrders.forEach((order, idx) => {
      console.log(`Order ${idx + 1}:`);
      console.log(`   ID: ${order._id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentInfo?.status}`);
      console.log(`   Payment Method: ${order.paymentInfo?.method}`);
      console.log(`   Escrow Released: ${order.paymentDistribution?.escrowReleased || false}`);
      console.log(`   Artisan Payout: ₹${order.paymentDistribution?.artisanPayout?.amount || 0}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSpecificArtisan();
