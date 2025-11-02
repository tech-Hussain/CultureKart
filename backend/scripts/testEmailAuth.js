/**
 * Test Email/Password Authentication
 * Run with: node scripts/testEmailAuth.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

// Test data
const testUser = {
  email: 'testuser@culturekart.com',
  password: 'Test@123456',
  name: 'Test User',
  role: 'buyer',
};

let authToken = '';

async function testRegistration() {
  console.log('\n🔍 Testing Email/Password Registration...');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log('   User ID:', response.data.user.id);
      console.log('   Email:', response.data.user.email);
      console.log('   Name:', response.data.user.name);
      console.log('   Role:', response.data.user.role);
      console.log('   Auth Provider:', response.data.user.authProvider);
      console.log('   Token:', response.data.token.substring(0, 50) + '...');
      
      authToken = response.data.token;
      return true;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  User already exists, proceeding to login test...');
      return false; // User exists, we'll test login instead
    }
    console.error('❌ Registration failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   Error:', error.response?.data?.error);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔍 Testing Email/Password Login...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('   User ID:', response.data.user.id);
      console.log('   Email:', response.data.user.email);
      console.log('   Name:', response.data.user.name);
      console.log('   Role:', response.data.user.role);
      console.log('   Auth Provider:', response.data.user.authProvider);
      console.log('   Last Login:', response.data.user.lastLogin);
      console.log('   Token:', response.data.token.substring(0, 50) + '...');
      
      authToken = response.data.token;
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   Error:', error.response?.data?.error);
    if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  Backend server is not running!');
    }
    return false;
  }
}

async function testGetProfile() {
  console.log('\n🔍 Testing Get Profile with JWT...');
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.data.success) {
      console.log('✅ Profile retrieved successfully!');
      console.log('   Email:', response.data.user.email);
      console.log('   Name:', response.data.user.name);
      console.log('   Role:', response.data.user.role);
      console.log('   Auth Provider:', response.data.user.authProvider);
      console.log('   Profile Bio:', response.data.user.profile.bio || '(empty)');
      return true;
    }
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateProfile() {
  console.log('\n🔍 Testing Update Profile...');
  try {
    const response = await axios.patch(
      `${API_URL}/auth/profile`,
      {
        profile: {
          bio: 'This is my updated bio from email/password auth test',
          location: 'Test City, Test Country',
          phone: '+1234567890',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    
    if (response.data.success) {
      console.log('✅ Profile updated successfully!');
      console.log('   Bio:', response.data.user.profile.bio);
      console.log('   Location:', response.data.user.profile.location);
      console.log('   Phone:', response.data.user.profile.phone);
      return true;
    }
  } catch (error) {
    console.error('❌ Update profile failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n🔍 Testing Login with Wrong Password...');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: 'WrongPassword123',
    });
    console.error('❌ Should have failed with wrong password!');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid password');
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Email/Password Authentication Tests\n');
  console.log('=' .repeat(60));
  
  let results = {
    registration: false,
    login: false,
    getProfile: false,
    updateProfile: false,
    invalidLogin: false,
  };

  // Test 1: Registration (or skip if user exists)
  results.registration = await testRegistration();
  
  // Test 2: Login
  results.login = await testLogin();
  
  if (!results.login) {
    console.log('\n❌ Cannot proceed without successful login');
    return;
  }
  
  // Test 3: Get Profile
  results.getProfile = await testGetProfile();
  
  // Test 4: Update Profile
  results.updateProfile = await testUpdateProfile();
  
  // Test 5: Invalid Login
  results.invalidLogin = await testInvalidLogin();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(60));
  console.log(`Registration:      ${results.registration ? '✅ PASS' : '⚠️  SKIP'}`);
  console.log(`Login:             ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Get Profile:       ${results.getProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Update Profile:    ${results.updateProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid Login:     ${results.invalidLogin ? '✅ PASS' : '❌ FAIL'}`);
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${passed}/${total} tests passed`);
  console.log('=' .repeat(60));
  
  if (passed === total || (passed === total - 1 && !results.registration)) {
    console.log('\n🎉 Email/Password authentication is working correctly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});
