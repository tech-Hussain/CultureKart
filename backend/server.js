/**
 * Server Entry Point
 * Loads environment variables, connects to MongoDB, and starts the Express server
 */

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { startCleanupJob } = require('./src/tasks/pendingUserCleanup');
const { getAllNetworkAddresses } = require('./src/utils/networkUtils');

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/culturekart';
const MONGODB_URI_FALLBACK = process.env.MONGO_URI_FALLBACK || process.env.MONGODB_URI_FALLBACK;

const isSrvDnsError = (error) => {
  return Boolean(error?.message && error.message.includes('querySrv ECONNREFUSED'));
};

const connectWithUri = async (uri, label) => {
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB Connected (${label}): ${conn.connection.host}`);
  console.log(`📊 Database: ${conn.connection.name}`);
  return conn;
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await connectWithUri(MONGODB_URI, 'primary');
  } catch (error) {
    if (isSrvDnsError(error)) {
      console.warn('⚠️ MongoDB SRV DNS lookup failed for primary URI.');
      console.warn('💡 Check internet/VPN/firewall and DNS settings, or use a non-SRV mongodb:// URI as a fallback.');
      if (MONGODB_URI_FALLBACK) {
        try {
          console.log('🔁 Retrying MongoDB connection using non-SRV fallback URI...');
          await connectWithUri(MONGODB_URI_FALLBACK, 'fallback');
          return;
        } catch (fallbackError) {
          console.error('❌ MongoDB Fallback Connection Error:', fallbackError.message);
        }
      }

      console.error('❌ MongoDB Connection Error:', error.message);
      process.exit(1);
    }

    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

/**
 * Start the server
 */
let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start pending user cleanup job
    startCleanupJob();

    // Start Express server on all network interfaces (0.0.0.0)
    server = app.listen(PORT, '0.0.0.0', () => {
      const addresses = getAllNetworkAddresses(PORT);

      console.log('🚀 CultureKart API Server');
      console.log(`📡 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🌐 Listening on port ${PORT}`);
      console.log('');
      console.log('📱 Access URLs:');
      console.log(`   Local:   ${addresses.local}/api/v1`);
      console.log(`   Network: ${addresses.network}/api/v1`);
      console.log('');
      console.log(`💚 Health Check: ${addresses.local}/api/v1/health`);
      console.log(`📱 Mobile/QR:    ${addresses.network}/api/v1/health`);
      console.log('');
      console.log(`💡 Use ${addresses.network} for mobile devices on the same network`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

// Initialize server
startServer();

// Export for testing
module.exports = server;
