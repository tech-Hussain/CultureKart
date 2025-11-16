/**
 * Test QR Code Generation
 * This script generates QR codes for an existing order
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const { generateOrderAuthenticationCodes } = require('./src/services/orderAuthenticationService');

async function testQRGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the most recent order
    const recentOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .populate('items.product');

    if (!recentOrder) {
      console.log('❌ No orders found in database');
      process.exit(1);
    }

    console.log(`\n📦 Found order: ${recentOrder._id}`);
    console.log(`   Order Date: ${recentOrder.createdAt}`);
    console.log(`   Total: Rs ${recentOrder.total}`);
    console.log(`   Items: ${recentOrder.items.length}`);
    console.log(`   Current QR Codes: ${recentOrder.authenticationCodes?.length || 0}`);

    // Generate QR codes
    console.log('\n🔄 Generating QR codes...');
    const authCodes = await generateOrderAuthenticationCodes(recentOrder._id);

    console.log(`\n✅ Generated ${authCodes.length} QR codes:`);
    authCodes.forEach((code, index) => {
      console.log(`   ${index + 1}. Product ID: ${code.productId}`);
      console.log(`      Verification Code: ${code.publicCode.substring(0, 20)}...`);
      console.log(`      QR Code URL: ${code.verificationUrl}`);
    });

    // Reload order to verify
    const updatedOrder = await Order.findById(recentOrder._id);
    console.log(`\n✅ Order updated! Authentication codes saved: ${updatedOrder.authenticationCodes.length}`);

    console.log('\n🎉 Test completed successfully!');
    console.log(`\n📱 To test verification, visit:`);
    console.log(`   ${authCodes[0].verificationUrl}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

testQRGeneration();
