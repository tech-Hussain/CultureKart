/**
 * Test Order Confirmation Email
 * Run this to test if order placement emails are being sent
 */

require('dotenv').config();
const { sendOrderPlacedEmail } = require('./src/services/paymentEscrowService');

// Mock order data
const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  buyer: {
    name: 'Test Buyer',
    email: 'ccngroupb5@gmail.com', // Send to your own email for testing
  },
  items: [
    {
      product: { name: 'Test Product' },
      artisan: { name: 'Test Artisan' },
    },
  ],
  total: 5000,
  createdAt: new Date(),
  shippingDetails: {
    fullName: 'Test Buyer',
    phone: '+92 300 1234567',
    address: '123 Test Street',
    city: 'Lahore',
    postalCode: '54000',
  },
};

async function testEmail() {
  console.log('🧪 Testing order confirmation email...');
  console.log('📧 Sending to:', mockOrder.buyer.email);
  
  try {
    const result = await sendOrderPlacedEmail(mockOrder);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check your inbox:', mockOrder.buyer.email);
    } else {
      console.log('❌ Email failed to send');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

testEmail();
