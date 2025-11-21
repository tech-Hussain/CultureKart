/**
 * Admin Withdrawal Routes
 * Admin endpoints for managing artisan withdrawal requests
 */

const express = require('express');
const { param, body, query, validationResult } = require('express-validator');
const Withdrawal = require('../models/Withdrawal');
const Artisan = require('../models/Artisan');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

router.use(requireAdmin);

/**
 * GET /api/v1/admin/withdrawals
 * Get all withdrawal requests with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, artisanId, search } = req.query;

    const filter = {};

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by artisan
    if (artisanId) {
      filter.artisan = artisanId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Withdrawal.find(filter)
      .populate({
        path: 'artisan',
        select: 'displayName user location businessName bankDetails',
        populate: {
          path: 'user',
          select: 'email',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Search by artisan name
    if (search) {
      const artisans = await Artisan.find({
        $or: [
          { displayName: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const artisanIds = artisans.map((a) => a._id);
      filter.artisan = { $in: artisanIds };

      query = Withdrawal.find(filter)
        .populate({
          path: 'artisan',
          select: 'displayName user location businessName bankDetails',
          populate: {
            path: 'user',
            select: 'email',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const [withdrawals, total] = await Promise.all([
      query.lean(),
      Withdrawal.countDocuments(filter),
    ]);

    // Calculate stats
    const stats = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalCommission: { $sum: '$processingFee' },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach((stat) => {
      statsMap[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount,
        commission: stat.totalCommission,
      };
    });

    return res.status(200).json({
      success: true,
      results: withdrawals.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: statsMap,
      data: { withdrawals },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawals',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/withdrawals/summary
 * Get withdrawal summary statistics
 */
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [allStats, todayStats, totalCommission] = await Promise.all([
      // All withdrawals stats
      Withdrawal.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalCommission: { $sum: '$processingFee' },
          },
        },
      ]),

      // Today's approvals
      Withdrawal.countDocuments({
        status: { $in: ['completed', 'processing'] },
        updatedAt: { $gte: today },
      }),

      // Total platform commission earned
      Withdrawal.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'processing'] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$processingFee' },
          },
        },
      ]),
    ]);

    const statsMap = {
      pending: { count: 0, amount: 0, commission: 0 },
      processing: { count: 0, amount: 0, commission: 0 },
      completed: { count: 0, amount: 0, commission: 0 },
      failed: { count: 0, amount: 0, commission: 0 },
    };

    allStats.forEach((stat) => {
      if (statsMap[stat._id]) {
        statsMap[stat._id] = {
          count: stat.count,
          amount: stat.totalAmount,
          commission: stat.totalCommission,
        };
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        pending: statsMap.pending.count,
        totalCommission: totalCommission.length > 0 ? totalCommission[0].total : 0,
        approvedToday: todayStats,
        completed: statsMap.completed.count,
        processing: statsMap.processing.count,
        failed: statsMap.failed.count,
        stats: statsMap,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawal summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal summary',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/v1/admin/withdrawals/:id/approve
 * Approve a pending withdrawal
 */
router.patch(
  '/:id/approve',
  [param('id').isMongoId().withMessage('Invalid withdrawal ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;

      const withdrawal = await Withdrawal.findById(id).populate('artisan');

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found',
        });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot approve withdrawal with status: ${withdrawal.status}`,
        });
      }

      // Mark as processing (admin approved)
      await withdrawal.markAsProcessing(`admin_approved_${Date.now()}`);

      console.log(`✅ Admin approved withdrawal ${id}`);

      // In real scenario, this would trigger actual bank transfer
      // For now, auto-complete after 5 seconds to simulate processing
      setTimeout(async () => {
        const w = await Withdrawal.findById(id);
        if (w && w.status === 'processing') {
          await w.markAsCompleted();
          console.log(`✅ Withdrawal ${id} auto-completed after admin approval`);
        }
      }, 5000);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal approved successfully',
        data: { withdrawal },
      });
    } catch (error) {
      console.error('❌ Error approving withdrawal:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to approve withdrawal',
        error: error.message,
      });
    }
  }
);

/**
 * PATCH /api/v1/admin/withdrawals/:id/reject
 * Reject a pending withdrawal
 */
router.patch(
  '/:id/reject',
  [
    param('id').isMongoId().withMessage('Invalid withdrawal ID'),
    body('reason').trim().notEmpty().withMessage('Rejection reason is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const withdrawal = await Withdrawal.findById(id).populate('artisan');

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found',
        });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot reject withdrawal with status: ${withdrawal.status}`,
        });
      }

      // Mark as failed with reason
      await withdrawal.markAsFailed(reason, 'admin_rejected');

      console.log(`❌ Admin rejected withdrawal ${id}: ${reason}`);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal rejected successfully',
        data: { withdrawal },
      });
    } catch (error) {
      console.error('❌ Error rejecting withdrawal:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject withdrawal',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/admin/withdrawals/:id
 * Get withdrawal details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await Withdrawal.findById(id)
      .populate({
        path: 'artisan',
        select: 'displayName user location businessName bankDetails',
        populate: {
          path: 'user',
          select: 'email phone',
        },
      })
      .lean();

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { withdrawal },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal details',
      error: error.message,
    });
  }
});

module.exports = router;
