/**
 * Admin Routes
 * Dashboard analytics and administrative functions
 */

const express = require('express');
const { param, validationResult } = require('express-validator');

const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { requireAdmin } = require('../middleware/requireRole');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyFirebaseToken);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/summary
 * Get dashboard summary statistics
 */
router.get('/summary', async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard summary...');

    // Calculate date 30 days ago for sales calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalArtisans,
      pendingArtisans,
      verifiedArtisans,
      totalProducts,
      activeProducts,
      totalOrders,
      completedOrders,
      salesLast30Days,
    ] = await Promise.all([
      // Total users count
      User.countDocuments({ isActive: true }),

      // Total artisans count
      Artisan.countDocuments({ isActive: true }),

      // Pending artisans (awaiting approval)
      Artisan.countDocuments({ verified: false, isActive: true }),

      // Verified artisans
      Artisan.countDocuments({ verified: true, isActive: true }),

      // Total products
      Product.countDocuments(),

      // Active products
      Product.countDocuments({ status: 'active' }),

      // Total orders
      Order.countDocuments(),

      // Completed orders
      Order.countDocuments({ status: 'delivered' }),

      // Sales in last 30 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            'paymentInfo.status': 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Extract sales data
    const salesData = salesLast30Days[0] || { totalRevenue: 0, orderCount: 0 };

    // Get recent activity (last 5 orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'name email')
      .select('_id total status createdAt paymentInfo.method');

    const summary = {
      users: {
        total: totalUsers,
      },
      artisans: {
        total: totalArtisans,
        pending: pendingArtisans,
        verified: verifiedArtisans,
        approvalRate: totalArtisans > 0 ? ((verifiedArtisans / totalArtisans) * 100).toFixed(1) : 0,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
      },
      sales: {
        last30Days: {
          revenue: salesData.totalRevenue,
          orderCount: salesData.orderCount,
          averageOrderValue:
            salesData.orderCount > 0 ? (salesData.totalRevenue / salesData.orderCount).toFixed(2) : 0,
        },
      },
      recentActivity: recentOrders,
    };

    console.log('✅ Dashboard summary fetched successfully');

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (error) {
    console.error('❌ Error fetching admin summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard summary',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/sales-monthly
 * Get monthly revenue data for last 12 months (for charts)
 */
router.get('/sales-monthly', async (req, res) => {
  try {
    console.log('📈 Fetching monthly sales data...');

    // Calculate date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Aggregate monthly sales
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          'paymentInfo.status': 'completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          revenue: { $round: ['$revenue', 2] },
          orderCount: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
        },
      },
    ]);

    // Format data for charts (ensure all 12 months are represented)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const formattedData = [];

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Find data for this month
      const monthData = monthlySales.find((item) => item.year === year && item.month === month);

      formattedData.push({
        month: monthNames[month - 1],
        year: year,
        revenue: monthData ? monthData.revenue : 0,
        orderCount: monthData ? monthData.orderCount : 0,
        averageOrderValue: monthData ? monthData.averageOrderValue : 0,
        label: `${monthNames[month - 1]} ${year}`,
      });
    }

    // Calculate totals
    const totals = {
      revenue: formattedData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2),
      orderCount: formattedData.reduce((sum, item) => sum + item.orderCount, 0),
      averageOrderValue:
        formattedData.filter((item) => item.orderCount > 0).length > 0
          ? (
              formattedData.reduce((sum, item) => sum + item.revenue, 0) /
              formattedData.reduce((sum, item) => sum + item.orderCount, 0)
            ).toFixed(2)
          : 0,
    };

    console.log('✅ Monthly sales data fetched successfully');

    res.status(200).json({
      status: 'success',
      data: {
        monthly: formattedData,
        totals: totals,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching monthly sales:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch monthly sales data',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/top-products
 * Get top 10 selling products
 */
router.get('/top-products', async (req, res) => {
  try {
    console.log('🏆 Fetching top selling products...');

    // Aggregate top products by sold count
    const topProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(10)
      .populate('artisan', 'displayName verified')
      .select('title price currency images soldCount rating category');

    // Also get revenue-based top products
    const topByRevenue = await Order.aggregate([
      {
        $match: {
          'paymentInfo.status': 'completed',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          totalQuantity: { $sum: '$items.qty' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $lookup: {
          from: 'artisans',
          localField: 'product.artisan',
          foreignField: '_id',
          as: 'artisan',
        },
      },
      {
        $unwind: '$artisan',
      },
      {
        $project: {
          _id: 1,
          title: '$product.title',
          price: '$product.price',
          currency: '$product.currency',
          images: '$product.images',
          category: '$product.category',
          artisan: {
            _id: '$artisan._id',
            displayName: '$artisan.displayName',
            verified: '$artisan.verified',
          },
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalQuantity: 1,
          orderCount: 1,
        },
      },
    ]);

    console.log('✅ Top products fetched successfully');

    res.status(200).json({
      status: 'success',
      data: {
        topByQuantity: topProducts,
        topByRevenue: topByRevenue,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching top products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch top products',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/v1/admin/artisans/:id/approve
 * Approve/verify an artisan
 */
router.patch(
  '/artisans/:id/approve',
  [param('id').isMongoId().withMessage('Invalid artisan ID')],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      const artisanId = req.params.id;

      console.log(`✅ Admin ${req.dbUser.name} approving artisan: ${artisanId}`);

      // Find artisan
      const artisan = await Artisan.findById(artisanId).populate('user', 'name email');

      if (!artisan) {
        return res.status(404).json({
          status: 'error',
          message: 'Artisan not found',
        });
      }

      // Check if already verified
      if (artisan.verified) {
        return res.status(400).json({
          status: 'error',
          message: 'Artisan is already verified',
        });
      }

      // Verify artisan
      await artisan.verify();

      console.log(`✅ Artisan ${artisan.displayName} has been verified`);

      res.status(200).json({
        status: 'success',
        message: 'Artisan verified successfully',
        data: {
          artisan: {
            _id: artisan._id,
            displayName: artisan.displayName,
            verified: artisan.verified,
            approvalDate: artisan.approvalDate,
            user: artisan.user,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error approving artisan:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to approve artisan',
        error: error.message,
      });
    }
  }
);

/**
 * PATCH /api/v1/admin/artisans/:id/reject
 * Reject/unverify an artisan
 */
router.patch(
  '/artisans/:id/reject',
  [param('id').isMongoId().withMessage('Invalid artisan ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array(),
        });
      }

      const artisanId = req.params.id;

      console.log(`⚠️  Admin ${req.dbUser.name} rejecting artisan: ${artisanId}`);

      const artisan = await Artisan.findById(artisanId).populate('user', 'name email');

      if (!artisan) {
        return res.status(404).json({
          status: 'error',
          message: 'Artisan not found',
        });
      }

      // Unverify artisan
      await artisan.unverify();

      console.log(`⚠️  Artisan ${artisan.displayName} verification revoked`);

      res.status(200).json({
        status: 'success',
        message: 'Artisan verification revoked',
        data: {
          artisan: {
            _id: artisan._id,
            displayName: artisan.displayName,
            verified: artisan.verified,
            approvalDate: artisan.approvalDate,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error rejecting artisan:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reject artisan',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/admin/artisans
 * Get all artisans with pagination and filters
 */
router.get('/artisans', async (req, res) => {
  try {
    const { page = 1, limit = 20, verified, search } = req.query;

    const filter = { isActive: true };

    // Filter by verification status
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    // Search by display name or location
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [artisans, total] = await Promise.all([
      Artisan.find(filter)
        .populate('user', 'name email firebaseUid')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Artisan.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      results: artisans.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: { artisans },
    });
  } catch (error) {
    console.error('❌ Error fetching artisans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch artisans',
      error: error.message,
    });
  }
});

module.exports = router;
