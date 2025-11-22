/**
 * Withdrawal Routes
 * Handle artisan withdrawal requests and payout management
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Withdrawal = require('../models/Withdrawal');
const Artisan = require('../models/Artisan');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/authenticate');
const { requireArtisan } = require('../middleware/requireRole');
const stripeConnectService = require('../services/stripeConnectService');

const router = express.Router();

// All routes require artisan authentication
router.use(authenticate);
router.use(requireArtisan);

/**
 * POST /api/v1/artisan/withdrawals
 * Create a new withdrawal request
 */
router.post(
  '/',
  [
    body('amount').isNumeric().withMessage('Amount must be a number')
      .custom(value => value >= 1000).withMessage('Minimum withdrawal is Rs 1,000'),
    body('bankDetails.bankName').trim().notEmpty().withMessage('Bank name is required'),
    body('bankDetails.accountNumber').trim().notEmpty().withMessage('Account number is required'),
    body('bankDetails.accountTitle').trim().notEmpty().withMessage('Account title is required'),
  ],
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

      const { amount, bankDetails, notes } = req.body;

      // Get artisan profile
      const artisan = await Artisan.findByUser(req.dbUser._id);
      if (!artisan) {
        return res.status(404).json({
          status: 'error',
          message: 'Artisan profile not found',
        });
      }

      // Calculate available balance using escrow system
      const escrowSummary = await Withdrawal.getArtisanEscrowSummary(artisan._id);

      console.log(`💰 Withdrawal request from ${artisan.displayName}:`);
      console.log(`   Total Escrow: Rs ${escrowSummary.totalEscrow}`);
      console.log(`   Available Balance: Rs ${escrowSummary.availableBalance}`);
      console.log(`   Pending Balance: Rs ${escrowSummary.pendingBalance}`);
      console.log(`   Requested Amount: Rs ${amount}`);

      // Check if sufficient available balance
      if (amount > escrowSummary.availableBalance) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient available balance',
          details: {
            requested: amount,
            available: escrowSummary.availableBalance,
            pending: escrowSummary.pendingBalance,
          },
        });
      }

      // Check for pending withdrawals (limit to 1 pending at a time)
      const pendingWithdrawal = await Withdrawal.findOne({
        artisan: artisan._id,
        status: { $in: ['pending', 'processing'] },
      });

      if (pendingWithdrawal) {
        return res.status(400).json({
          status: 'error',
          message: 'You have a pending withdrawal. Please wait for it to complete.',
          pendingWithdrawal: {
            id: pendingWithdrawal._id,
            amount: pendingWithdrawal.amount,
            status: pendingWithdrawal.status,
            requestedAt: pendingWithdrawal.requestedAt,
          },
        });
      }

      // Create withdrawal record (pending admin approval)
      const processingFee = parseFloat(amount) * 0.02; // 2% fee
      const netAmount = parseFloat(amount) - processingFee;

      const withdrawal = new Withdrawal({
        artisan: artisan._id,
        amount: parseFloat(amount),
        processingFee: processingFee,
        netAmount: netAmount,
        bankDetails: {
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          accountTitle: bankDetails.accountTitle,
          routingNumber: bankDetails.routingNumber || '',
        },
        status: 'pending',
        adminApproval: {
          status: 'pending',
        },
        escrowDetails: {
          totalEscrow: escrowSummary.totalEscrow,
          availableBalance: escrowSummary.availableBalance - amount,
          pendingBalance: escrowSummary.pendingBalance + amount,
          orders: escrowSummary.orders,
        },
        metadata: {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
        },
        notes: notes || '',
      });

      await withdrawal.save();

      console.log(`✅ Withdrawal request created (pending admin approval): ${withdrawal._id}`);

      return res.status(201).json({
        status: 'success',
        message: 'Withdrawal request submitted successfully. Awaiting admin approval.',
        data: {
          withdrawal: {
            id: withdrawal._id,
            amount: withdrawal.amount,
            processingFee: withdrawal.processingFee,
            netAmount: withdrawal.netAmount,
            status: withdrawal.status,
            adminApprovalStatus: withdrawal.adminApproval.status,
            estimatedArrival: withdrawal.estimatedArrival,
            requestedAt: withdrawal.requestedAt,
          },
          availableBalance: escrowSummary.availableBalance - amount,
          pendingBalance: escrowSummary.pendingBalance + amount,
        },
      });
    } catch (error) {
      console.error('❌ Error creating withdrawal:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create withdrawal request',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/artisan/withdrawals
 * Get all withdrawals for the authenticated artisan
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // Get artisan profile
    const artisan = await Artisan.findByUser(req.dbUser._id);
    if (!artisan) {
      return res.status(404).json({
        status: 'error',
        message: 'Artisan profile not found',
      });
    }

    const filter = { artisan: artisan._id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Withdrawal.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: 'success',
      results: withdrawals.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: { withdrawals },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch withdrawals',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/withdrawals/:id
 * Get specific withdrawal details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get artisan profile
    const artisan = await Artisan.findByUser(req.dbUser._id);
    if (!artisan) {
      return res.status(404).json({
        status: 'error',
        message: 'Artisan profile not found',
      });
    }

    const withdrawal = await Withdrawal.findOne({
      _id: id,
      artisan: artisan._id,
    });

    if (!withdrawal) {
      return res.status(404).json({
        status: 'error',
        message: 'Withdrawal not found',
      });
    }

    // If withdrawal has Stripe payout ID, fetch latest status
    if (withdrawal.stripePayoutId) {
      try {
        const payoutStatus = await stripeConnectService.getPayoutStatus(
          withdrawal.stripePayoutId,
          artisan.stripeAccountId
        );

        // Update withdrawal status if changed
        if (payoutStatus.status === 'paid' && withdrawal.status !== 'completed') {
          await withdrawal.markAsCompleted();
        } else if (payoutStatus.status === 'failed' && withdrawal.status !== 'failed') {
          await withdrawal.markAsFailed(
            payoutStatus.failureMessage,
            payoutStatus.failureCode
          );
        }
      } catch (error) {
        console.error('Error fetching payout status:', error);
      }
    }

    return res.status(200).json({
      status: 'success',
      data: { withdrawal },
    });
  } catch (error) {
    console.error('❌ Error fetching withdrawal:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch withdrawal details',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/withdrawals/balance/available
 * Get available balance for withdrawal
 */
router.get('/balance/available', async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findByUser(req.dbUser._id);
    if (!artisan) {
      return res.status(404).json({
        status: 'error',
        message: 'Artisan profile not found',
      });
    }

    // Calculate balance using escrow system
    const escrowSummary = await Withdrawal.getArtisanEscrowSummary(artisan._id);

    // Get total withdrawn/completed
    const totalWithdrawn = await Withdrawal.aggregate([
      {
        $match: {
          artisan: artisan._id,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const withdrawn = totalWithdrawn.length > 0 ? totalWithdrawn[0].total : 0;

    // Get pending withdrawal requests
    const pendingAmount = await Withdrawal.getPendingTotal(artisan._id);

    return res.status(200).json({
      status: 'success',
      data: {
        totalEscrow: escrowSummary.totalEscrow, // Total held in escrow
        availableBalance: escrowSummary.availableBalance, // Released escrow, ready for withdrawal
        pendingBalance: escrowSummary.pendingBalance, // Unreleased escrow (awaiting admin)
        totalWithdrawn: withdrawn, // Already paid out
        pendingWithdrawals: pendingAmount, // Withdrawal requests in progress
      },
    });
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch balance',
      error: error.message,
    });
  }
});

/**
 * Background processor for withdrawal
 * Processes payout through Stripe Connect
 */
async function processWithdrawalAsync(withdrawal, artisan) {
  try {
    console.log(`🔄 Processing withdrawal ${withdrawal._id} in background...`);

    // Create payout through Stripe
    const payoutResult = await stripeConnectService.createPayout({
      _id: withdrawal._id,
      artisan,
      amount: withdrawal.amount,
      netAmount: withdrawal.netAmount,
      bankDetails: withdrawal.bankDetails,
    });

    if (payoutResult.success) {
      await withdrawal.markAsProcessing(payoutResult.payoutId);
      console.log(`✅ Withdrawal ${withdrawal._id} marked as processing`);

      // In mock mode, auto-complete after 30 seconds
      if (payoutResult.isMock) {
        setTimeout(async () => {
          const w = await Withdrawal.findById(withdrawal._id);
          if (w && w.status === 'processing') {
            await w.markAsCompleted();
            console.log(`✅ Mock withdrawal ${withdrawal._id} auto-completed`);
          }
        }, 30000); // 30 seconds
      }
    } else {
      await withdrawal.markAsFailed(payoutResult.error, payoutResult.code);
      console.error(`❌ Withdrawal ${withdrawal._id} failed: ${payoutResult.error}`);
    }
  } catch (error) {
    console.error(`❌ Error processing withdrawal ${withdrawal._id}:`, error);
    await withdrawal.markAsFailed(error.message, 'processing_error');
  }
}

module.exports = router;
