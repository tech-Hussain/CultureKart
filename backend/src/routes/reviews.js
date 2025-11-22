/**
 * Review Routes
 * Handle product reviews and ratings
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// Middleware to fetch database user
const fetchDbUser = async (req, res, next) => {
  try {
    let dbUser;
    
    if (req.user?.authProvider === 'firebase-oauth') {
      dbUser = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user?.authProvider === 'email-password') {
      dbUser = await User.findById(req.user.userId);
    }

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database',
      });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Error fetching database user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
};

/**
 * POST /api/v1/reviews
 * Create a new review (requires verified order)
 */
router.post(
  '/',
  authenticate,
  fetchDbUser,
  [
    body('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be 100 characters or less'),
    body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { orderId, productId, rating, title, comment, images } = req.body;
      const userId = req.dbUser._id;

      // Verify order exists and belongs to user
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.buyer.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only review your own orders',
        });
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'You can only review delivered orders',
        });
      }

      // Verify product is in the order
      const productInOrder = order.items.find(item => item.product.toString() === productId);
      if (!productInOrder) {
        return res.status(400).json({
          success: false,
          message: 'Product not found in this order',
        });
      }

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ user: userId, product: productId });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product',
        });
      }

      // Create review
      const review = new Review({
        product: productId,
        order: orderId,
        user: userId,
        artisan: product.artisan,
        rating,
        title,
        comment,
        images: images || [],
      });

      await review.save();

      // Update product rating
      const ratingData = await Review.calculateAverageRating(productId);
      await Product.findByIdAndUpdate(productId, {
        'rating.average': ratingData.average,
        'rating.count': ratingData.count,
      });

      const populatedReview = await Review.findById(review._id)
        .populate('user', 'name email profile')
        .populate('product', 'title images');

      return res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: { review: populatedReview },
      });
    } catch (error) {
      console.error('❌ Error creating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating review',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/reviews/product/:productId
 * Get all reviews for a product
 */
router.get(
  '/product/:productId',
  [
    param('productId').isMongoId().withMessage('Valid product ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('sort').optional().isIn(['recent', 'helpful', 'rating-high', 'rating-low']).withMessage('Invalid sort option'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sort = req.query.sort || 'recent';
      const skip = (page - 1) * limit;

      // Build sort query
      let sortQuery = {};
      switch (sort) {
        case 'recent':
          sortQuery = { createdAt: -1 };
          break;
        case 'helpful':
          sortQuery = { 'helpful.count': -1, createdAt: -1 };
          break;
        case 'rating-high':
          sortQuery = { rating: -1, createdAt: -1 };
          break;
        case 'rating-low':
          sortQuery = { rating: 1, createdAt: -1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }

      const [reviews, totalReviews, ratingData, distribution] = await Promise.all([
        Review.find({ product: productId, status: 'active' })
          .populate('user', 'name profile')
          .sort(sortQuery)
          .limit(limit)
          .skip(skip)
          .lean(),
        Review.countDocuments({ product: productId, status: 'active' }),
        Review.calculateAverageRating(productId),
        Review.getRatingDistribution(productId),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: {
            page,
            limit,
            total: totalReviews,
            pages: Math.ceil(totalReviews / limit),
          },
          summary: {
            averageRating: ratingData.average,
            totalReviews: ratingData.count,
            distribution,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching reviews',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/reviews/order/:orderId/can-review
 * Check if user can review products in an order
 */
router.get(
  '/order/:orderId/can-review',
  authenticate,
  fetchDbUser,
  [param('orderId').isMongoId().withMessage('Valid order ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { orderId } = req.params;
      const userId = req.dbUser._id;

      const order = await Order.findById(orderId).populate('items.product');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.buyer.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      // Check each product for existing reviews
      const productsReviewStatus = await Promise.all(
        order.items.map(async (item) => {
          const existingReview = await Review.findOne({
            user: userId,
            product: item.product._id,
          });

          return {
            productId: item.product._id,
            productTitle: item.product.title,
            canReview: !existingReview && order.status === 'delivered',
            hasReview: !!existingReview,
            review: existingReview,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: {
          orderId,
          orderStatus: order.status,
          products: productsReviewStatus,
        },
      });
    } catch (error) {
      console.error('❌ Error checking review status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking review status',
        error: error.message,
      });
    }
  }
);

/**
 * PATCH /api/v1/reviews/:reviewId/helpful
 * Mark review as helpful
 */
router.patch(
  '/:reviewId/helpful',
  authenticate,
  fetchDbUser,
  [param('reviewId').isMongoId().withMessage('Valid review ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { reviewId } = req.params;
      const userId = req.dbUser._id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      const marked = await review.markHelpful(userId);

      return res.status(200).json({
        success: true,
        message: marked ? 'Review marked as helpful' : 'Already marked as helpful',
        data: { helpfulCount: review.helpful.count },
      });
    } catch (error) {
      console.error('❌ Error marking review as helpful:', error);
      return res.status(500).json({
        success: false,
        message: 'Error marking review as helpful',
        error: error.message,
      });
    }
  }
);

module.exports = router;
