/**
 * Admin Withdrawal Management Routes
 * Handle withdrawal approval, rejection, and monitoring
 */

const express = require('express');
const Withdrawal = require('../../models/Withdrawal');
const Artisan = require('../../models/Artisan');
const Order = require('../../models/Order');
const { authenticate } = require('../../middleware/authenticate');
const { requireAdmin } = require('../../middleware/requireRole');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/withdrawals/stats/summary
 * Get withdrawal statistics for dashboard (MUST BE BEFORE /:id)
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const [
      pendingCount,
      pendingAmount,
      approvedCount,
      completedCount,
      totalWithdrawn,
    ] = await Promise.all([
      Withdrawal.countDocuments({ 'adminApproval.status': 'pending' }),
      Withdrawal.getTotalPendingAmount(),
      Withdrawal.countDocuments({ 'adminApproval.status': 'approved' }),
      Withdrawal.countDocuments({ status: 'completed' }),
      Withdrawal.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(result => result[0]?.total || 0),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pending: { count: pendingCount, amount: pendingAmount },
        approved: { count: approvedCount },
        completed: { count: completedCount, amount: totalWithdrawn },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawal stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal statistics',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/withdrawals/summary
 * Get withdrawal summary for payout management dashboard
 */
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingCount,
      approvedToday,
      completedCount,
      totalCommission,
    ] = await Promise.all([
      // Count pending withdrawal requests
      Withdrawal.countDocuments({ 'adminApproval.status': 'pending' }),
      
      // Count withdrawals approved today
      Withdrawal.countDocuments({
        'adminApproval.status': 'approved',
        'adminApproval.approvedAt': { $gte: today, $lt: tomorrow }
      }),
      
      // Count completed withdrawals
      Withdrawal.countDocuments({ status: 'completed' }),
      
      // Calculate total commission from all approved/completed withdrawals
      Withdrawal.aggregate([
        {
          $match: {
            status: { $in: ['approved', 'processing', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$processingFee' }
          }
        }
      ]).then(result => result[0]?.total || 0),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        pending: pendingCount,
        totalCommission: totalCommission,
        approvedToday: approvedToday,
        completed: completedCount,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawal summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal summary',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/withdrawals/pending
 * Get all pending withdrawal requests
 */
router.get('/pending', async (req, res) => {
  try {
    const withdrawals = await Withdrawal.getPendingApprovals();
    const totalPending = await Withdrawal.getTotalPendingAmount();

    return res.status(200).json({
      success: true,
      data: {
        withdrawals,
        totalPendingAmount: totalPending,
        count: withdrawals.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching pending withdrawals:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pending withdrawals',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/withdrawals/all
 * Get all withdrawal requests with filtering (specific route BEFORE /:id)
 */
router.get('/all', async (req, res) => {
  try {
    const { status, artisanId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (artisanId) query.artisan = artisanId;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .populate('artisan', 'businessName email phone')
        .populate('adminApproval.approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Withdrawal.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching withdrawals',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/withdrawals (BASE ROUTE - for pagination)
 * Get all withdrawal requests with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { status, artisanId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (artisanId) query.artisan = artisanId;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .populate('artisan', 'businessName email phone')
        .populate('adminApproval.approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Withdrawal.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching withdrawals',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/admin/withdrawals/:id
 * Get specific withdrawal details (MUST BE LAST GET route)
 */
router.get('/:id', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate('artisan')
      .populate('adminApproval.approvedBy', 'name email')
      .populate('escrowDetails.orders.orderId');

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found',
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
      message: 'Error fetching withdrawal',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/admin/withdrawals/:id/approve
 * Approve a withdrawal request
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { notes } = req.body;
    const adminId = req.user.userId;

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found',
      });
    }

    if (withdrawal.adminApproval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Withdrawal already ${withdrawal.adminApproval.status}`,
      });
    }

    // Verify escrow availability
    const escrowSummary = await Withdrawal.getArtisanEscrowSummary(withdrawal.artisan);
    if (withdrawal.amount > escrowSummary.availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance',
        data: {
          requested: withdrawal.amount,
          available: escrowSummary.availableBalance,
        },
      });
    }

    await withdrawal.approveRequest(adminId, notes);

    // Get updated escrow summary after approval
    // (getArtisanEscrowSummary will now exclude this approved withdrawal from availableBalance)
    const updatedEscrowSummary = await Withdrawal.getArtisanEscrowSummary(withdrawal.artisan);
    
    // Update escrow details with the recalculated values
    withdrawal.escrowDetails = {
      totalEscrow: updatedEscrowSummary.totalEscrow,
      availableBalance: updatedEscrowSummary.availableBalance,
      pendingBalance: updatedEscrowSummary.pendingBalance,
      orders: updatedEscrowSummary.orders,
    };
    await withdrawal.save();

    const populatedWithdrawal = await Withdrawal.findById(withdrawal._id)
      .populate('artisan', 'businessName email')
      .populate('adminApproval.approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Withdrawal request approved successfully',
      data: { withdrawal: populatedWithdrawal },
    });
  } catch (error) {
    console.error('❌ Error approving withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error approving withdrawal',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/admin/withdrawals/:id/reject
 * Reject a withdrawal request
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const adminId = req.user.userId;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found',
      });
    }

    if (withdrawal.adminApproval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Withdrawal already ${withdrawal.adminApproval.status}`,
      });
    }

    await withdrawal.rejectRequest(adminId, reason, notes);

    const populatedWithdrawal = await Withdrawal.findById(withdrawal._id)
      .populate('artisan', 'businessName email')
      .populate('adminApproval.approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Withdrawal request rejected',
      data: { withdrawal: populatedWithdrawal },
    });
  } catch (error) {
    console.error('❌ Error rejecting withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rejecting withdrawal',
      error: error.message,
    });
  }
});

module.exports = router;
