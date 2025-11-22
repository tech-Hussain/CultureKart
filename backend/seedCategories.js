/**
 * Seed Categories Script
 * Populate initial categories into the database
 */

const mongoose = require('mongoose');
const Category = require('./src/models/Category');

const categories = [
  { name: 'Textiles & Fabrics', emoji: '🧵', description: 'Handwoven fabrics, textiles, and cloth products', order: 1 },
  { name: 'Pottery & Ceramics', emoji: '🏺', description: 'Handmade pottery, ceramic items, and clay crafts', order: 2 },
  { name: 'Woodwork', emoji: '🪵', description: 'Carved wood products and wooden handicrafts', order: 3 },
  { name: 'Jewelry', emoji: '💎', description: 'Handcrafted jewelry and ornaments', order: 4 },
  { name: 'Metalwork', emoji: '⚒️', description: 'Metal crafts, brass, copper, and silver items', order: 5 },
  { name: 'Hand-painted Items', emoji: '🎨', description: 'Hand-painted decorative items and art', order: 6 },
  { name: 'Embroidery', emoji: '🪡', description: 'Embroidered textiles and decorative pieces', order: 7 },
  { name: 'Leather Goods', emoji: '👜', description: 'Handcrafted leather products and accessories', order: 8 },
  { name: 'Traditional Clothing', emoji: '👘', description: 'Traditional and ethnic wear', order: 9 },
  { name: 'Home Decor', emoji: '🏠', description: 'Decorative items for home and living spaces', order: 10 },
  { name: 'Other', emoji: '✨', description: 'Other handcrafted items', order: 11 },
];

async function seedCategories() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Connect to MongoDB using MONGO_URI from .env
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    // Clear existing categories (optional)
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories. Skipping duplicates...`);
    }

    // Insert categories
    let added = 0;
    let skipped = 0;

    for (const categoryData of categories) {
      const existing = await Category.findOne({ name: categoryData.name });
      if (!existing) {
        await Category.create(categoryData);
        console.log(`✅ Added: ${categoryData.emoji} ${categoryData.name}`);
        added++;
      } else {
        console.log(`⏭️  Skipped: ${categoryData.name} (already exists)`);
        skipped++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Added: ${added} categories`);
    console.log(`   ⏭️  Skipped: ${skipped} categories`);
    console.log(`   📦 Total: ${await Category.countDocuments()} categories in database`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
