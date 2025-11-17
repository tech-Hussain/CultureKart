/**
 * Delivery Confirmation Routes
 * Allows artisans to mark orders as delivered and trigger payment distribution
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { distributePaymentOnDelivery } = require('../services/paymentEscrowService');
const { authenticate } = require('../middleware/authenticate');

/**
 * @route   POST /api/v1/delivery/confirm/:orderId
 * @desc    Confirm delivery by artisan (triggers payment distribution)
 * @access  Private (Artisan only)
 */
router.post('/confirm/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    console.log(`📦 Delivery confirmation request for order ${orderId} by user ${userId}`);

    // Get order
    const order = await Order.findById(orderId)
      .populate('items.artisan', 'name email')
      .populate('buyer', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify user is the artisan for this order
    const isArtisan = order.items.some(
      item => item.artisan && item.artisan._id.toString() === userId
    );

    if (!isArtisan && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the artisan who fulfilled this order can confirm delivery',
      });
    }

    // Check if already delivered
    if (order.shippingDetails.deliveryConfirmedAt) {
      return res.status(400).json({
        success: false,
        message: 'Delivery already confirmed',
        confirmedAt: order.shippingDetails.deliveryConfirmedAt,
      });
    }

    // Check if order is paid
    if (order.paymentInfo.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order payment not completed. Cannot confirm delivery.',
      });
    }

    // Update order delivery status
    order.status = 'delivered';
    order.shippingDetails.deliveredAt = new Date();
    order.shippingDetails.deliveryConfirmedAt = new Date();
    order.shippingDetails.deliveryConfirmedBy = userId;

    await order.save();

    console.log(`✅ Delivery confirmed for order ${orderId}`);

    // Distribute payment (90% artisan, 10% platform)
    const paymentResult = await distributePaymentOnDelivery(orderId, userId);

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully. Payment has been distributed.',
      order: {
        id: order._id,
        status: order.status,
        deliveredAt: order.shippingDetails.deliveredAt,
        buyerNotified: order.shippingDetails.buyerNotifiedOfDelivery,
      },
      payment: {
        artisanPayout: paymentResult.artisanPayout,
        platformCommission: paymentResult.platformCommission,
        distributed: true,
      },
    });

  } catch (error) {
    console.error('❌ Error confirming delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming delivery',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/delivery/pending
 * @desc    Get orders pending delivery confirmation for artisan
 * @access  Private (Artisan only)
 */
router.get('/pending', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find orders where user is artisan and delivery not confirmed
    const orders = await Order.find({
      'items.artisan': userId,
      'paymentInfo.status': 'completed',
      'shippingDetails.deliveryConfirmedAt': null,
      status: { $in: ['confirmed', 'processing', 'shipped'] },
    })
      .populate('buyer', 'name email')
      .populate('items.product', 'title image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        buyer: order.buyer,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
      })),
    });

  } catch (error) {
    console.error('❌ Error fetching pending deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending deliveries',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/delivery/completed
 * @desc    Get completed deliveries for artisan
 * @access  Private (Artisan only)
 */
router.get('/completed', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      'items.artisan': userId,
      'shippingDetails.deliveryConfirmedAt': { $ne: null },
      status: 'delivered',
    })
      .populate('buyer', 'name email')
      .populate('items.product', 'title image')
      .sort({ 'shippingDetails.deliveryConfirmedAt': -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        buyer: order.buyer,
        items: order.items,
        total: order.total,
        deliveredAt: order.shippingDetails.deliveredAt,
        confirmedAt: order.shippingDetails.deliveryConfirmedAt,
        payoutAmount: order.paymentDistribution.artisanPayout.amount,
        payoutPaid: order.paymentDistribution.artisanPayout.paid,
      })),
    });

  } catch (error) {
    console.error('❌ Error fetching completed deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed deliveries',
      error: error.message,
    });
  }
});

module.exports = router;
