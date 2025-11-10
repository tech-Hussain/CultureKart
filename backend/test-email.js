/**
 * Email Service Test
 * Quick test to verify email configuration works
 */

require('dotenv').config();
const { sendVerificationOTP } = require('./src/services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...');
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('🔑 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set ✅' : 'Not Set ❌');
  
  try {
    // Test sending OTP to your email
    console.log('\n📤 Sending test OTP email...');
    
    const result = await sendVerificationOTP(
      'hussainextra60@gmail.com', // Send to your own email
      'Test User',
      '123456'
    );
    
    if (result) {
      console.log('✅ SUCCESS: Test email sent successfully!');
      console.log('📩 Check your inbox for the verification email');
    } else {
      console.log('❌ FAILED: Email could not be sent');
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

// Run the test
testEmailService();