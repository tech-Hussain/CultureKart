/**
 * Admin Commission Tracking Routes
 * Provides analytics and reporting on platform commissions
 */

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { getPlatformCommissionSummary } = require('../services/paymentEscrowService');
const { authenticate } = require('../middleware/authenticate');

/**
 * @route   GET /api/v1/admin/commission/summary
 * @desc    Get platform commission summary
 * @access  Private (Admin only)
 */
router.get('/commission/summary', authenticate, async (req, res) => {
  try {
    // Verify admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const { startDate, endDate } = req.query;

    const summary = await getPlatformCommissionSummary({ startDate, endDate });

    // Get total revenue (all completed orders)
    const revenueMatch = {
      'paymentInfo.status': 'completed',
    };

    if (startDate || endDate) {
      revenueMatch.createdAt = {};
      if (startDate) revenueMatch.createdAt.$gte = new Date(startDate);
      if (endDate) revenueMatch.createdAt.$lte = new Date(endDate);
    }

    const revenueData = await Order.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, orderCount: 0 };

    res.status(200).json({
      success: true,
      summary: {
        platformCommission: {
          total: summary.commission.total,
          transactionCount: summary.commission.count,
        },
        escrowHeld: {
          total: summary.escrowHeld.totalHeld,
          orderCount: summary.escrowHeld.count,
        },
        totalRevenue: {
          amount: revenue.totalRevenue,
          orderCount: revenue.orderCount,
        },
        commissionRate: '10%',
      },
    });

  } catch (error) {
    console.error('❌ Error fetching commission summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission summary',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/admin/commission/transactions
 * @desc    Get commission transaction history
 * @access  Private (Admin only)
 */
router.get('/commission/transactions', authenticate, async (req, res) => {
  try {
    // Verify admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      type: 'platform_commission',
      status: 'completed',
    })
      .populate('order', 'total createdAt')
      .populate('artisan', 'name email')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({
      type: 'platform_commission',
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        orderId: t.order?._id,
        orderTotal: t.order?.total,
        commissionAmount: t.amounts.platformCommission,
        artisan: t.artisan,
        buyer: t.buyer,
        createdAt: t.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('❌ Error fetching commission transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission transactions',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/admin/payouts/pending
 * @desc    Get pending artisan payouts (escrow held)
 * @access  Private (Admin only)
 */
router.get('/payouts/pending', authenticate, async (req, res) => {
  try {
    // Verify admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const pendingOrders = await Order.find({
      'paymentInfo.status': 'completed',
      'paymentDistribution.escrowReleased': false,
    })
      .populate('buyer', 'name email')
      .populate('items.artisan', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      orders: pendingOrders.map(order => ({
        id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        buyer: order.buyer,
        artisan: order.items[0]?.artisan,
        total: order.total,
        artisanPayout: order.paymentDistribution.artisanPayout.amount,
        platformCommission: order.paymentDistribution.platformCommission.amount,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });

  } catch (error) {
    console.error('❌ Error fetching pending payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payouts',
      error: error.message,
    });
  }
});

module.exports = router;
