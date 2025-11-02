/**
 * Test Lock Timer with Visual Demo
 * Creates a lock with short duration for quick testing
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1/auth/login';
const TEST_EMAIL = 'testlockdemo@culturekart.com';
const WRONG_PASSWORD = 'WrongPassword123';

async function quickLockDemo() {
  console.log('🎬 Lock Timer Visual Demo Test\n');
  console.log('This will trigger a lock so you can see the timer in action');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n🚀 Making 3 rapid failed login attempts...\n');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`   Attempt ${i}/3...`);
      try {
        await axios.post(API_URL, {
          email: TEST_EMAIL,
          password: WRONG_PASSWORD,
        });
      } catch (error) {
        const response = error.response?.data;
        if (i === 3 && response?.locked) {
          console.log(`   ✅ Lock triggered!`);
          console.log(`   🔒 Account locked until: ${new Date(response.lockUntil).toLocaleTimeString()}`);
        } else if (response?.remainingAttempts !== undefined) {
          console.log(`   ⚠️  ${response.remainingAttempts} attempts remaining`);
        }
      }
      await sleep(500);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Demo Setup Complete!\n');
    console.log('🌐 Now go to: http://localhost:5173/admin/login');
    console.log('📧 Email: testlockdemo@culturekart.com');
    console.log('🔑 Password: (any password)');
    console.log('\n💡 Try to login and you will see:');
    console.log('   1. ⏱️  Large countdown timer');
    console.log('   2. 🔒 Disabled "Sign In" button with countdown');
    console.log('   3. ⚡ Timer counts down every second');
    console.log('   4. ✅ Auto-unlock when timer reaches 0:00');
    console.log('\n⚙️  Or test with admin@culturekart.com instead\n');
    
  } catch (error) {
    console.error('\n❌ Demo error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
quickLockDemo();
