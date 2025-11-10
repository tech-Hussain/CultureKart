require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Artisan = require('./src/models/Artisan');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function debugProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n=== USER & ARTISAN INFO ===');
    const user = await User.findOne({email: 'hussainextra10@gmail.com'});
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    const artisan = await Artisan.findOne({user: user._id});
    if (!artisan) {
      console.log('❌ Artisan not found!');
      return;
    }

    console.log('User ID:', user._id);
    console.log('Artisan ID:', artisan._id);

    console.log('\n=== ALL PRODUCTS ===');
    const allProducts = await Product.find({}).select('title artisan createdAt').lean();
    console.log('Total products in DB:', allProducts.length);
    
    if (allProducts.length > 0) {
      allProducts.forEach((p, i) => {
        console.log(`${i+1}. Product: "${p.title}" | Artisan: ${p.artisan} | Created: ${p.createdAt}`);
      });
    } else {
      console.log('No products found in database');
    }

    console.log('\n=== PRODUCTS FOR THIS ARTISAN ===');
    const artisanProducts = await Product.find({artisan: artisan._id}).select('title price status').lean();
    console.log('Products for this artisan:', artisanProducts.length);
    
    if (artisanProducts.length > 0) {
      artisanProducts.forEach((p, i) => {
        console.log(`${i+1}. Title: "${p.title}" | Price: ${p.price} | Status: ${p.status}`);
      });
    } else {
      console.log('No products found for this artisan');
      console.log('Looking for products with artisan ID:', artisan._id);
    }

    console.log('\n=== CHECKING ARTISAN ID MATCH ===');
    if (allProducts.length > 0) {
      const matchingProducts = allProducts.filter(p => p.artisan.toString() === artisan._id.toString());
      console.log('Products that match artisan ID:', matchingProducts.length);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugProducts();