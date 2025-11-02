/**
 * Test Admin Login Rate Limiting
 * Tests that 3 failed attempts trigger a 5-minute lock
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1/auth/login';
const TEST_EMAIL = 'admin@culturekart.com';
const WRONG_PASSWORD = 'WrongPassword123';
const CORRECT_PASSWORD = 'Admin@123456';

async function testFailedAttempts() {
  console.log('🧪 Testing Admin Login Rate Limiting\n');
  console.log('=' .repeat(50));
  
  try {
    // Attempt 1
    console.log('\n📝 Attempt 1: Wrong password');
    try {
      await axios.post(API_URL, {
        email: TEST_EMAIL,
        password: WRONG_PASSWORD,
      });
    } catch (error) {
      console.log(`   Response: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.remainingAttempts !== undefined) {
        console.log(`   ⚠️  Remaining attempts: ${error.response.data.remainingAttempts}`);
      }
    }
    
    await sleep(1000);
    
    // Attempt 2
    console.log('\n📝 Attempt 2: Wrong password');
    try {
      await axios.post(API_URL, {
        email: TEST_EMAIL,
        password: WRONG_PASSWORD,
      });
    } catch (error) {
      console.log(`   Response: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.remainingAttempts !== undefined) {
        console.log(`   ⚠️  Remaining attempts: ${error.response.data.remainingAttempts}`);
      }
    }
    
    await sleep(1000);
    
    // Attempt 3 (should trigger lock)
    console.log('\n📝 Attempt 3: Wrong password (should trigger lock)');
    try {
      await axios.post(API_URL, {
        email: TEST_EMAIL,
        password: WRONG_PASSWORD,
      });
    } catch (error) {
      console.log(`   Response: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.locked) {
        console.log(`   🔒 ACCOUNT LOCKED until: ${new Date(error.response.data.lockUntil).toLocaleTimeString()}`);
        console.log(`   ⏱️  Remaining time: ${error.response.data.remainingTime} seconds`);
      }
    }
    
    await sleep(1000);
    
    // Attempt 4 (should be blocked)
    console.log('\n📝 Attempt 4: Correct password (should be blocked due to lock)');
    try {
      await axios.post(API_URL, {
        email: TEST_EMAIL,
        password: CORRECT_PASSWORD,
      });
      console.log('   ✅ Login successful');
    } catch (error) {
      console.log(`   Response: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.locked) {
        console.log(`   🔒 Still locked - ${Math.ceil(error.response.data.remainingTime / 60)} minutes remaining`);
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Rate limiting test completed!');
    console.log('⏳ Account will unlock automatically in 5 minutes');
    console.log('   OR manually clear lock from database');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
testFailedAttempts();
