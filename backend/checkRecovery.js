require('dotenv').config();
const mongoose = require('mongoose');

// Try to check MongoDB oplog or any recoverable data
const checkRecovery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if there's an oplog we can query
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Available collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Check for any backup collections
    console.log('\n🔍 Checking for backup or temp collections...');
    const backupCollections = collections.filter(col => 
      col.name.includes('backup') || 
      col.name.includes('temp') || 
      col.name.includes('old')
    );
    
    if (backupCollections.length > 0) {
      console.log('✅ Found potential backup collections:');
      backupCollections.forEach(col => console.log(`   - ${col.name}`));
    } else {
      console.log('❌ No backup collections found');
    }

    // Check current data counts
    console.log('\n📊 Current data (after seed):');
    const User = require('./src/models/User');
    const Product = require('./src/models/Product');
    const Order = require('./src/models/Order');
    const Artisan = require('./src/models/Artisan');

    const [users, products, orders, artisans] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Artisan.countDocuments(),
    ]);

    console.log(`   Users: ${users}`);
    console.log(`   Products: ${products}`);
    console.log(`   Orders: ${orders}`);
    console.log(`   Artisans: ${artisans}`);

    console.log('\n💡 Recovery Options:');
    console.log('1. Contact MongoDB Support: https://support.mongodb.com');
    console.log('2. Check if your MongoDB Atlas account has point-in-time recovery');
    console.log('3. Check browser DevTools > Application > IndexedDB for cached data');
    console.log('4. Check browser DevTools > Network tab history for API responses');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkRecovery();
