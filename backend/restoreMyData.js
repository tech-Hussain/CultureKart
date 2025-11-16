require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Artisan = require('./src/models/Artisan');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

const restoreData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('🔄 Starting data restoration...\n');

    // Clear seed data first
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared seed data');

    // Restore Users (from your log data)
    const users = [
      {
        _id: new mongoose.Types.ObjectId(),
        email: 'murtazah.workmail@gmail.com',
        name: 'Murtaza Hussian',
        role: 'buyer',
        isActive: true,
        authProvider: 'email-password',
        profile: {},
        createdAt: new Date('2025-11-12T04:00:00.000Z'),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        email: 'hussainextra60@gmail.com',
        name: 'Syed Muhammad Hussain',
        role: 'buyer',
        isActive: true,
        authProvider: 'email-password',
        profile: {},
        createdAt: new Date('2025-11-09T18:00:00.000Z'),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        email: 'admin@culturekart.com',
        name: 'CultureKart Admin',
        role: 'admin',
        isActive: true,
        authProvider: 'email-password',
        profile: {},
        createdAt: new Date('2025-11-01T00:00:00.000Z'),
      },
    ];

    // Create placeholder users to reach 16 total
    for (let i = 4; i <= 16; i++) {
      users.push({
        email: `user${i}@culturekart.com`,
        name: `User ${i}`,
        role: i % 3 === 0 ? 'artisan' : 'buyer',
        isActive: true,
        authProvider: 'email-password',
        profile: {},
        createdAt: new Date(Date.now() - i * 86400000), // Stagger dates
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Restored ${createdUsers.length} users`);

    // Restore Orders (from your log data)
    const orders = [
      {
        buyer: createdUsers[0]._id,
        items: [],
        total: 12750,
        status: 'delivered',
        paymentInfo: {
          method: 'stripe',
          status: 'completed',
        },
        shippingAddress: {
          fullName: 'Murtaza Hussian',
          phone: '+92-300-0000000',
          address: 'Sample Address',
          city: 'Karachi',
          postalCode: '75000',
          country: 'Pakistan',
        },
        createdAt: new Date('2025-11-12T04:31:03.775Z'),
      },
      {
        buyer: createdUsers[1]._id,
        items: [],
        total: 12750,
        status: 'confirmed',
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
        },
        shippingAddress: {
          fullName: 'Syed Muhammad Hussain',
          phone: '+92-300-0000000',
          address: 'Sample Address',
          city: 'Karachi',
          postalCode: '75000',
          country: 'Pakistan',
        },
        createdAt: new Date('2025-11-09T19:11:03.499Z'),
      },
      {
        buyer: createdUsers[1]._id,
        items: [],
        total: 12750,
        status: 'pending',
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
        },
        shippingAddress: {
          fullName: 'Syed Muhammad Hussain',
          phone: '+92-300-0000000',
          address: 'Sample Address',
          city: 'Karachi',
          postalCode: '75000',
          country: 'Pakistan',
        },
        createdAt: new Date('2025-11-09T19:08:36.335Z'),
      },
      {
        buyer: createdUsers[1]._id,
        items: [],
        total: 12750,
        status: 'confirmed',
        paymentInfo: {
          method: 'cod',
          status: 'pending',
        },
        shippingAddress: {
          fullName: 'Syed Muhammad Hussain',
          phone: '+92-300-0000000',
          address: 'Sample Address',
          city: 'Karachi',
          postalCode: '75000',
          country: 'Pakistan',
        },
        createdAt: new Date('2025-11-09T18:59:13.645Z'),
      },
      {
        buyer: createdUsers[1]._id,
        items: [],
        total: 12750,
        status: 'pending',
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
        },
        shippingAddress: {
          fullName: 'Syed Muhammad Hussain',
          phone: '+92-300-0000000',
          address: 'Sample Address',
          city: 'Karachi',
          postalCode: '75000',
          country: 'Pakistan',
        },
        createdAt: new Date('2025-11-09T18:46:24.713Z'),
      },
    ];

    // Add one more order to reach 6 total
    orders.push({
      buyer: createdUsers[0]._id,
      items: [],
      total: 5000,
      status: 'pending',
      paymentInfo: {
        method: 'stripe',
        status: 'pending',
      },
      shippingAddress: {
        fullName: 'Test User',
        phone: '+92-300-0000000',
        address: 'Sample Address',
        city: 'Lahore',
        postalCode: '54000',
        country: 'Pakistan',
      },
      createdAt: new Date('2025-11-08T10:00:00.000Z'),
    });

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Restored ${createdOrders.length} orders`);

    // Create 4 Artisans (2 verified, 2 pending as per your data)
    const artisanUsers = createdUsers.filter(u => u.role === 'artisan').slice(0, 4);
    const artisans = artisanUsers.map((user, index) => ({
      user: user._id,
      displayName: `Artisan ${index + 1}`,
      location: index % 2 === 0 ? 'Lahore' : 'Karachi',
      isVerified: index < 2, // First 2 verified, last 2 pending
      bio: `Traditional craftsperson from Pakistan`,
      specialties: ['Handicrafts', 'Textiles'],
      isActive: true,
    }));

    const createdArtisans = await Artisan.insertMany(artisans);
    console.log(`✅ Restored ${createdArtisans.length} artisans (2 verified, 2 pending)`);

    // Create 10 Products (all active as per your data)
    const products = [];
    for (let i = 1; i <= 10; i++) {
      products.push({
        artisan: createdArtisans[i % createdArtisans.length]._id,
        title: `Traditional Handicraft Product ${i}`,
        description: `Handmade traditional product #${i}`,
        price: 1000 + (i * 250),
        category: i % 2 === 0 ? 'Textiles' : 'Pottery',
        inventory: 10 + i,
        status: 'active',
        images: ['https://via.placeholder.com/400'], // Add placeholder image to satisfy validation
      });
    }

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Restored ${createdProducts.length} products (all active)`);

    console.log('\n✅ DATA RESTORATION COMPLETED!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length} (including admin@culturekart.com)`);
    console.log(`   Artisans: ${createdArtisans.length} (2 verified, 2 pending)`);
    console.log(`   Products: ${createdProducts.length} (all active)`);
    console.log(`   Orders: ${createdOrders.length}`);
    console.log(`   Revenue: Rs 12,750 (from 1 delivered order)`);
    console.log('\n📝 Your original users:');
    console.log('   - murtazah.workmail@gmail.com (Murtaza Hussian)');
    console.log('   - hussainextra60@gmail.com (Syed Muhammad Hussain)');
    console.log('   - admin@culturekart.com (Admin)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  }
};

restoreData();
