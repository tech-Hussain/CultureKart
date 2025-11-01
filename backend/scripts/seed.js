/**
 * Database Seeding Script
 * Creates sample data for development and testing
 * 
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Artisan = require('../src/models/Artisan');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

// Sample images from placeholder services (using real URLs for development)
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80', // Textile/Fabric
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80', // Pottery
  'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80', // Fabric/Textile pattern
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', // Metal/Brass decor
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', // Handmade crafts
  'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80', // Lamp/Lighting
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Existing data cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const users = [
      {
        firebaseUid: 'admin_uid_12345',
        email: 'admin@culturekart.com',
        name: 'Admin User',
        role: 'admin',
        profile: {
          bio: 'Platform administrator',
          location: 'Karachi, Pakistan',
          phone: '+92-300-1234567',
          avatar: 'https://i.pravatar.cc/150?img=1',
        },
        emailVerified: true,
        isActive: true,
      },
      {
        firebaseUid: 'artisan_uid_67890',
        email: 'fatima@artisan.com',
        name: 'Fatima Ahmed',
        role: 'artisan',
        profile: {
          bio: 'Master of traditional embroidery with 15 years experience',
          location: 'Lahore, Punjab',
          phone: '+92-300-2345678',
          avatar: 'https://i.pravatar.cc/150?img=5',
        },
        emailVerified: true,
        isActive: true,
      },
      {
        firebaseUid: 'artisan_uid_11111',
        email: 'ahmed@pottery.com',
        name: 'Ahmed Ali',
        role: 'artisan',
        profile: {
          bio: 'Blue pottery specialist from Multan',
          location: 'Multan, Punjab',
          phone: '+92-300-3456789',
          avatar: 'https://i.pravatar.cc/150?img=12',
        },
        emailVerified: true,
        isActive: true,
      },
      {
        firebaseUid: 'buyer_uid_99999',
        email: 'buyer@example.com',
        name: 'Sarah Khan',
        role: 'buyer',
        profile: {
          bio: 'Love authentic Pakistani crafts',
          location: 'London, UK',
          phone: '+44-20-12345678',
          avatar: 'https://i.pravatar.cc/150?img=10',
        },
        emailVerified: true,
        isActive: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed artisans
const seedArtisans = async (users) => {
  try {
    const artisanUsers = users.filter(u => u.role === 'artisan');
    
    const artisans = [
      {
        user: artisanUsers[0]._id,
        displayName: 'Fatima Textile Arts',
        bio: 'Specializing in traditional Phulkari and Ajrak embroidery. Each piece is handcrafted with love and carries centuries of cultural heritage.',
        location: 'Lahore, Punjab',
        specialty: 'Traditional Embroidery',
        verified: true,
        approvalDate: new Date(),
        portfolio: [
          'https://example.com/portfolio1.jpg',
          'https://example.com/portfolio2.jpg',
        ],
        rating: 4.9,
        totalProducts: 0,
        totalSales: 0,
      },
      {
        user: artisanUsers[1]._id,
        displayName: 'Ahmed Pottery Studio',
        bio: 'Three generations of blue pottery craftsmanship from Multan. Creating unique pieces that blend tradition with modern aesthetics.',
        location: 'Multan, Punjab',
        specialty: 'Blue Pottery',
        verified: true,
        approvalDate: new Date(),
        portfolio: [
          'https://example.com/pottery1.jpg',
          'https://example.com/pottery2.jpg',
        ],
        rating: 4.8,
        totalProducts: 0,
        totalSales: 0,
      },
    ];

    const createdArtisans = await Artisan.insertMany(artisans);
    console.log(`✅ ${createdArtisans.length} artisans created`);
    return createdArtisans;
  } catch (error) {
    console.error('Error seeding artisans:', error);
    throw error;
  }
};

// Seed products
const seedProducts = async (artisans) => {
  try {
    const products = [
      {
        artisan: artisans[0]._id,
        title: 'Hand-Embroidered Phulkari Dupatta',
        description: 'Authentic Phulkari dupatta from Punjab. Hand-embroidered with vibrant silk threads on pure cotton. This traditional craft has been passed down through generations. Perfect for weddings and special occasions.',
        price: 89.99,
        currency: 'USD',
        stock: 5,
        images: [SAMPLE_IMAGES[0], SAMPLE_IMAGES[2]],
        ipfsMetadataHash: 'QmSampleMetadataHash1Phulkari',
        blockchainTxn: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        category: 'Textiles',
        tags: ['embroidery', 'phulkari', 'dupatta', 'traditional', 'punjabi'],
        dimensions: '230cm x 100cm',
        weight: '200g',
        status: 'active',
        rating: 5.0,
        views: 245,
        soldCount: 12,
      },
      {
        artisan: artisans[1]._id,
        title: 'Blue Pottery Decorative Vase',
        description: 'Stunning blue pottery vase handcrafted in Multan. Features intricate geometric patterns inspired by Mughal architecture. Each piece is unique and food-safe.',
        price: 45.50,
        currency: 'USD',
        stock: 8,
        images: [SAMPLE_IMAGES[1]],
        ipfsMetadataHash: 'QmSampleMetadataHash2BluePottery',
        blockchainTxn: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        category: 'Pottery',
        tags: ['pottery', 'blue pottery', 'multan', 'vase', 'decor'],
        dimensions: '25cm height x 15cm diameter',
        weight: '800g',
        status: 'active',
        rating: 4.8,
        views: 189,
        soldCount: 8,
      },
      {
        artisan: artisans[0]._id,
        title: 'Ajrak Block Print Fabric',
        description: 'Traditional Sindhi Ajrak fabric with natural dyes. Hand-block printed using wooden blocks carved by master craftsmen. Genuine camel leather dye creates the rich maroon and indigo colors.',
        price: 34.99,
        currency: 'USD',
        stock: 15,
        images: [SAMPLE_IMAGES[2], SAMPLE_IMAGES[0]],
        ipfsMetadataHash: 'QmSampleMetadataHash3Ajrak',
        blockchainTxn: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        category: 'Textiles',
        tags: ['ajrak', 'block print', 'sindhi', 'fabric', 'natural dye'],
        dimensions: '300cm x 150cm',
        weight: '350g',
        status: 'active',
        rating: 4.9,
        views: 312,
        soldCount: 18,
      },
      {
        artisan: artisans[1]._id,
        title: 'Brass Engraved Wall Hanging',
        description: 'Intricately engraved brass wall hanging featuring traditional Islamic geometric patterns. Perfect for home decor. Handcrafted using centuries-old techniques.',
        price: 67.00,
        currency: 'USD',
        stock: 3,
        images: [SAMPLE_IMAGES[3]],
        ipfsMetadataHash: 'QmSampleMetadataHash4Brass',
        blockchainTxn: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        category: 'Metalwork',
        tags: ['brass', 'metal work', 'wall hanging', 'islamic art', 'decor'],
        dimensions: '40cm x 40cm',
        weight: '1.2kg',
        status: 'active',
        rating: 4.7,
        views: 156,
        soldCount: 5,
      },
      {
        artisan: artisans[0]._id,
        title: 'Handwoven Ralli Quilt',
        description: 'Traditional Ralli quilt from Sindh. Made from recycled fabrics in vibrant colors. Each quilt tells a story and takes weeks to complete. Machine washable.',
        price: 125.00,
        currency: 'USD',
        stock: 4,
        images: [SAMPLE_IMAGES[4]],
        ipfsMetadataHash: 'QmSampleMetadataHash5Ralli',
        blockchainTxn: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        category: 'Textiles',
        tags: ['ralli', 'quilt', 'handwoven', 'sindhi', 'bedding'],
        dimensions: '220cm x 180cm',
        weight: '1.5kg',
        status: 'active',
        rating: 5.0,
        views: 423,
        soldCount: 15,
      },
      {
        artisan: artisans[1]._id,
        title: 'Camel Skin Lamp Shade',
        description: 'Unique lamp shade made from ethically sourced camel skin. Hand-painted with traditional motifs. Creates beautiful ambient lighting.',
        price: 52.75,
        currency: 'USD',
        stock: 6,
        images: [SAMPLE_IMAGES[5]],
        ipfsMetadataHash: 'QmSampleMetadataHash6CamelLamp',
        blockchainTxn: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        category: 'Other',
        tags: ['lamp', 'camel skin', 'lighting', 'decor', 'handpainted'],
        dimensions: '30cm height x 25cm diameter',
        weight: '400g',
        status: 'active',
        rating: 4.6,
        views: 198,
        soldCount: 9,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    
    // Update artisan product counts
    for (const artisan of artisans) {
      const productCount = createdProducts.filter(p => p.artisan.equals(artisan._id)).length;
      artisan.totalProducts = productCount;
      await artisan.save();
    }

    console.log(`✅ ${createdProducts.length} products created`);
    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

// Seed orders
const seedOrders = async (users, products) => {
  try {
    const buyer = users.find(u => u.role === 'buyer');
    
    const orders = [
      {
        buyer: buyer._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price,
            title: products[0].title,
            image: products[0].images[0],
            artisan: products[0].artisan,
          },
          {
            product: products[2]._id,
            quantity: 1,
            price: products[2].price,
            title: products[2].title,
            image: products[2].images[0],
            artisan: products[2].artisan,
          },
        ],
        total: (products[0].price * 2) + products[2].price,
        currency: 'USD',
        status: 'delivered',
        paymentInfo: {
          method: 'stripe',
          transactionId: 'pi_1234567890abcdef',
          status: 'paid',
          paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        },
        shippingAddress: {
          fullName: 'Sarah Khan',
          email: 'buyer@example.com',
          phone: '+44-20-12345678',
          address: '123 Oxford Street',
          city: 'London',
          state: 'Greater London',
          postalCode: 'W1D 1BS',
          country: 'United Kingdom',
        },
        shippingDetails: {
          carrier: 'DHL',
          trackingNumber: 'DHL123456789',
          shippedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
      },
      {
        buyer: buyer._id,
        items: [
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price,
            title: products[1].title,
            image: products[1].images[0],
            artisan: products[1].artisan,
          },
        ],
        total: products[1].price,
        currency: 'USD',
        status: 'shipped',
        paymentInfo: {
          method: 'stripe',
          transactionId: 'pi_abcdef1234567890',
          status: 'paid',
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        shippingAddress: {
          fullName: 'Sarah Khan',
          email: 'buyer@example.com',
          phone: '+44-20-12345678',
          address: '123 Oxford Street',
          city: 'London',
          state: 'Greater London',
          postalCode: 'W1D 1BS',
          country: 'United Kingdom',
        },
        shippingDetails: {
          carrier: 'FedEx',
          trackingNumber: 'FDX987654321',
          shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        buyer: buyer._id,
        items: [
          {
            product: products[4]._id,
            quantity: 1,
            price: products[4].price,
            title: products[4].title,
            image: products[4].images[0],
            artisan: products[4].artisan,
          },
        ],
        total: products[4].price,
        currency: 'USD',
        status: 'confirmed',
        paymentInfo: {
          method: 'stripe',
          transactionId: 'pi_567890abcdef1234',
          status: 'paid',
          paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        shippingAddress: {
          fullName: 'Sarah Khan',
          email: 'buyer@example.com',
          phone: '+44-20-12345678',
          address: '123 Oxford Street',
          city: 'London',
          state: 'Greater London',
          postalCode: 'W1D 1BS',
          country: 'United Kingdom',
        },
      },
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ ${createdOrders.length} orders created`);
    return createdOrders;
  } catch (error) {
    console.error('Error seeding orders:', error);
    throw error;
  }
};

// Main seed function
const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    const artisans = await seedArtisans(users);
    const products = await seedProducts(artisans);
    // const orders = await seedOrders(users, products); // Temporarily disabled
    const orders = []; // Placeholder

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Artisans: ${artisans.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Orders: ${orders.length} (orders seeding temporarily disabled)`);
    console.log('\n📝 Sample credentials:');
    console.log('   Admin: admin@culturekart.com');
    console.log('   Artisan: fatima@artisan.com');
    console.log('   Buyer: buyer@example.com');
    console.log('   (Use Firebase Auth for actual login)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seed
seed();
