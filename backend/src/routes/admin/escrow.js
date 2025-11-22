/**
 * Admin Escrow Management Routes
 * Handle escrow release for delivered orders
 */

const express = require('express');
const Order = require('../../models/Order');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/requireRole');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/escrow/pending
 * Get all paid orders with unreleased escrow (includes pending, processing, shipped, delivered)
 */
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    // Match all paid orders with unreleased escrow
    const query = {
      status: { $in: ['pending', 'processing', 'shipped', 'delivered'] },
      'paymentDistribution.escrowReleased': false,
      $or: [
        { 'paymentInfo.status': 'completed' }, // Stripe payments
        { paymentMethod: 'cod', status: { $in: ['processing', 'shipped', 'delivered'] } } // COD confirmed
      ]
    };

    // Optional filter by specific status
    if (status && ['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyer', 'name email')
        .populate('items.product', 'title images')
        .populate('items.artisan', 'displayName email')
        .sort({ createdAt: -1 }) // Sort by order creation (newest first)
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(query),
    ]);

    // Calculate total escrow held
    const totalEscrow = orders.reduce((sum, order) => {
      return sum + (order.paymentDistribution?.artisanPayout?.amount || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        totalEscrowHeld: totalEscrow,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching pending escrow:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pending escrow',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/escrow/released
 * Get all orders with released escrow
 */
router.get('/released', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      'paymentDistribution.escrowReleased': true,
    };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyer', 'name email')
        .populate('items.product', 'title images')
        .populate('items.artisan', 'displayName email')
        .populate('paymentDistribution.escrowReleasedBy', 'name email')
        .sort({ 'paymentDistribution.escrowReleasedAt': -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching released escrow:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching released escrow',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/admin/escrow/:orderId/release
 * Release escrow for a specific order
 */
router.post('/:orderId/release', async (req, res) => {
  try {
    const { notes } = req.body;
    const adminId = req.user.userId;

    const order = await Order.findById(req.params.orderId)
      .populate('buyer', 'name email')
      .populate('items.product', 'title')
      .populate('items.artisan', 'businessName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Release escrow using the instance method
    await order.releaseEscrow(adminId, notes);

    return res.status(200).json({
      success: true,
      message: 'Escrow released successfully',
      data: { order },
    });
  } catch (error) {
    console.error('❌ Error releasing escrow:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error releasing escrow',
    });
  }
});

/**
 * POST /api/v1/admin/escrow/bulk-release
 * Release escrow for multiple orders
 */
router.post('/bulk-release', async (req, res) => {
  try {
    const { orderIds, notes } = req.body;
    const adminId = req.user.userId;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required',
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId);
        if (order) {
          await order.releaseEscrow(adminId, notes);
          results.success.push(orderId);
        } else {
          results.failed.push({ orderId, reason: 'Order not found' });
        }
      } catch (error) {
        results.failed.push({ orderId, reason: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Released escrow for ${results.success.length} orders`,
      data: results,
    });
  } catch (error) {
    console.error('❌ Error in bulk escrow release:', error);
    return res.status(500).json({
      success: false,
      message: 'Error releasing escrow',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/escrow/stats
 * Get escrow statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      pendingOrders,
      releasedOrders,
      totalPendingEscrow,
      totalReleasedEscrow,
    ] = await Promise.all([
      Order.countDocuments({
        status: { $in: ['pending', 'processing', 'shipped', 'delivered'] },
        'paymentDistribution.escrowReleased': false,
        $or: [
          { 'paymentInfo.status': 'completed' },
          { paymentMethod: 'cod', status: { $in: ['processing', 'shipped', 'delivered'] } }
        ]
      }),
      Order.countDocuments({
        'paymentDistribution.escrowReleased': true,
      }),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['pending', 'processing', 'shipped', 'delivered'] },
            'paymentDistribution.escrowReleased': false,
            $or: [
              { 'paymentInfo.status': 'completed' },
              { paymentMethod: 'cod', status: { $in: ['processing', 'shipped', 'delivered'] } }
            ]
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentDistribution.artisanPayout.amount' },
          },
        },
      ]).then(r => r[0]?.total || 0),
      Order.aggregate([
        {
          $match: {
            'paymentDistribution.escrowReleased': true,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentDistribution.artisanPayout.amount' },
          },
        },
      ]).then(r => r[0]?.total || 0),
    ]);

    return res.status(200).json({
      success: true,
      pendingCount: pendingOrders,
      pendingAmount: totalPendingEscrow,
      releasedCount: releasedOrders,
      releasedAmount: totalReleasedEscrow,
    });
  } catch (error) {
    console.error('❌ Error fetching escrow stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching escrow statistics',
      error: error.message,
    });
  }
});

module.exports = router;
