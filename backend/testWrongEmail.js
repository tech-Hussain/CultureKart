require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const axios = require('axios');

async function testWrongEmail() {
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'your-mongodb-uri';
  
  console.log('📊 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const API_URL = 'http://localhost:5000/api/v1/auth/login';
  
  console.log('Testing wrong email attempts...\n');
  
  // Test 3 wrong admin emails
  const wrongEmails = [
    'wrongadmin@test.com',
    'admin123@culturekart.com', 
    'admintest@wrong.com'
  ];
  
  for (let i = 0; i < wrongEmails.length; i++) {
    try {
      console.log(`Attempt ${i + 1}: ${wrongEmails[i]}`);
      const response = await axios.post(API_URL, {
        email: wrongEmails[i],
        password: 'wrongpassword'
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Status:', error.response?.status);
      console.log('Response:', error.response?.data);
    }
    console.log('---\n');
  }
  
  // Now check the login attempts in database
  const AdminLoginAttempt = require('./src/models/AdminLoginAttempt');
  const attempts = await AdminLoginAttempt.find().sort({ timestamp: -1 }).limit(10);
  
  console.log(`\n📋 Found ${attempts.length} login attempts in database:`);
  attempts.forEach((attempt, index) => {
    console.log(`${index + 1}. Email: ${attempt.email}, Success: ${attempt.success}, Reason: ${attempt.failureReason}, Attempt #: ${attempt.attemptNumber}`);
  });
  
  await mongoose.connection.close();
  console.log('\n✅ Done!');
  process.exit(0);
}

testWrongEmail().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
