/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

/**
 * Middleware Configuration
 */

// Enable CORS
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Stripe webhook needs raw body - must come before JSON parsing
app.use('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    if (req.method === 'PATCH' && req.path.includes('/auth/profile')) {
      console.log('📋 Headers:', req.headers);
      console.log('📦 Body:', req.body);
    }
    next();
  });
}

/**
 * API Routes - All routes under /api/v1
 */

// Stripe webhook - MUST be before express.json() middleware
app.use('/api/v1/stripe/webhook', require('./src/routes/stripe'));

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CultureKart API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount API routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/products', require('./src/routes/products'));
app.use('/api/v1/payments', require('./src/routes/payments'));
app.use('/api/v1/admin', require('./src/routes/admin'));
app.use('/api/v1/admin', require('./src/routes/adminCommission'));
app.use('/api/v1/orders', require('./src/routes/orders'));
app.use('/api/v1/cart', require('./src/routes/cart'));
app.use('/api/v1/stripe', require('./src/routes/stripe'));
app.use('/api/v1/artisan', require('./src/routes/artisan'));
app.use('/api/v1/home', require('./src/routes/home'));
app.use('/api/v1/verification', require('./src/routes/verification'));
app.use('/api/v1/delivery', require('./src/routes/delivery'));

// Additional routes to be implemented:
// app.use('/api/v1/users', require('./src/routes/users'));

/**
 * 404 Handler - Route not found
 */
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

/**
 * Global Error Handler
 * Catches all errors and sends appropriate response
 */
app.use((err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    err.statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    err.message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token expired';
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack,
    }),
  });
});

// Export app for use in server.js and tests
module.exports = app;
