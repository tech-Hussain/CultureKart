/**
 * Order Routes
 * Handle order management for buyers
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate } = require('../middleware/authenticate');
const User = require('../models/User');

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let user;

    // Find user based on auth provider
    if (req.user.authProvider === 'firebase-oauth') {
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find all orders for this user
    const orders = await Order.find({ buyer: user._id })
      .populate('items.product', 'title images price')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get a specific order by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    let user;

    // Find user based on auth provider
    if (req.user.authProvider === 'firebase-oauth') {
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find order and ensure it belongs to this user
    const order = await Order.findOne({ _id: id, buyer: user._id })
      .populate('items.product', 'title images price category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    let user;

    // Find user based on auth provider
    if (req.user.authProvider === 'firebase-oauth') {
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Create new order
    const order = new Order({
      buyer: user._id,
      items,
      total,
      currency: 'PKR',
      status: 'pending',
      paymentInfo: {
        method: paymentMethod || 'cod',
        status: 'pending',
      },
      shippingAddress,
      notes: notes || '',
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/v1/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    let user;

    // Find user based on auth provider
    if (req.user.authProvider === 'firebase-oauth') {
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find order and ensure it belongs to this user
    const order = await Order.findOne({ _id: id, buyer: user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Cancel the order
    await order.cancel(reason || 'Cancelled by customer', user._id);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error cancelling order',
    });
  }
});

module.exports = router;
