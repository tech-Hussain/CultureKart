/**
 * Seller Dashboard Routes
 * Dashboard analytics and data for artisans
 */

const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Artisan = require('../models/Artisan');
const { authenticate } = require('../middleware/authenticate');
const { requireArtisan } = require('../middleware/requireRole');

const router = express.Router();

// All routes require artisan authentication
router.use(authenticate);
router.use(requireArtisan);

/**
 * GET /api/v1/seller/dashboard
 * Get seller dashboard summary
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findByUser(req.dbUser._id);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found',
      });
    }

    // Get products count
    const totalProducts = await Product.countDocuments({ artisan: artisan._id });
    const activeProducts = await Product.countDocuments({ 
      artisan: artisan._id, 
      status: 'active' 
    });
    const outOfStock = await Product.countDocuments({ 
      artisan: artisan._id, 
      stock: 0 
    });

    // Get orders statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          'items.artisan': artisan._id,
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.artisan': artisan._id,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $multiply: ['$items.price', '$items.qty'],
            },
          },
        },
      },
    ]);

    // Calculate total orders and revenue
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;

    orderStats.forEach((stat) => {
      totalOrders += stat.count;
      totalRevenue += stat.revenue;
      if (stat._id === 'pending') pendingOrders = stat.count;
      if (stat._id === 'delivered') deliveredOrders = stat.count;
    });

    // Get average product rating
    const ratingAgg = await Product.aggregate([
      {
        $match: {
          artisan: artisan._id,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating.average' },
          totalReviews: { $sum: '$rating.count' },
        },
      },
    ]);

    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avgRating : 0;
    const totalReviews = ratingAgg.length > 0 ? ratingAgg[0].totalReviews : 0;

    // Get recent orders (last 5)
    const recentOrders = await Order.aggregate([
      {
        $match: {
          'items.artisan': artisan._id,
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.artisan': artisan._id,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyerInfo',
        },
      },
      {
        $unwind: '$buyerInfo',
      },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          status: 1,
          createdAt: 1,
          'item.title': '$items.title',
          'item.qty': '$items.qty',
          'item.price': '$items.price',
          'buyer.name': '$buyerInfo.name',
          'buyer.email': '$buyerInfo.email',
        },
      },
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          'items.artisan': artisan._id,
          status: 'delivered',
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.artisan': artisan._id,
        },
      },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.qty' },
          revenue: {
            $sum: {
              $multiply: ['$items.price', '$items.qty'],
            },
          },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStock,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
        },
        revenue: {
          total: Math.round(totalRevenue),
          averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        },
        rating: {
          average: Number(avgRating.toFixed(1)),
          totalReviews: totalReviews,
        },
        recentOrders: recentOrders,
        topProducts: topProducts,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching seller dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/seller/products
 * Get seller's products with pagination
 */
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, status, search } = req.query;

    // Get artisan profile
    const artisan = await Artisan.findByUser(req.dbUser._id);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found',
      });
    }

    const filter = { artisan: artisan._id };

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Search by title or category
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      results: products.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: { products },
    });
  } catch (error) {
    console.error('❌ Error fetching seller products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

module.exports = router;
