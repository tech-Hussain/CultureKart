/**
 * Stripe Payment Routes
 * Handle checkout session creation and webhook events
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticate } = require('../middleware/authenticate');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/v1/stripe/create-checkout-session
 * Create Stripe Checkout Session
 */
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Get user based on auth provider
    let user;
    if (req.user.authProvider === 'firebase-oauth') {
      user = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate email is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before checkout'
      });
    }

    // Get cart items
    const cartItems = await Cart.getUserCart(user._id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Verify all products are still available and in stock
    for (const item of cartItems) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productName} is no longer available`
        });
      }

      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productName} is no longer available`
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.product.stock} units of ${item.productName} available`
        });
      }
    }

    // Calculate totals server-side (NEVER trust client)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = subtotal > 0 ? 150 : 0; // PKR 150 delivery
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryCharges + tax;

    // Create line items for Stripe
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.productName,
          images: item.productImage ? [item.productImage] : [],
          metadata: {
            productId: item.product._id.toString()
          }
        },
        unit_amount: Math.round(item.price * 100) // Convert to cents
      },
      quantity: item.quantity
    }));

    // Add delivery charges as a line item
    if (deliveryCharges > 0) {
      line_items.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: 'Delivery Charges',
            description: 'Standard delivery across Pakistan'
          },
          unit_amount: Math.round(deliveryCharges * 100)
        },
        quantity: 1
      });
    }

    // Add tax as a line item
    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: 'Tax (5%)',
            description: 'Sales tax'
          },
          unit_amount: Math.round(tax * 100)
        },
        quantity: 1
      });
    }

    // Create pending order to track
    const orderItems = cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      title: item.productName,
      image: item.productImage,
      artisan: item.artisan
    }));

    const pendingOrder = await Order.create({
      buyer: user._id,
      items: orderItems,
      total: total,
      currency: 'PKR',
      status: 'pending',
      paymentInfo: {
        method: 'stripe',
        status: 'pending'
      },
      shippingAddress: shippingAddress
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout-failed`,
      customer_email: user.email,
      client_reference_id: user._id.toString(),
      metadata: {
        userId: user._id.toString(),
        orderId: pendingOrder._id.toString(),
        cartItemIds: cartItems.map(item => item._id.toString()).join(',')
      }
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderId: pendingOrder._id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/stripe/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;

    case 'checkout.session.async_payment_succeeded':
      const asyncSession = event.data.object;
      await handleCheckoutSessionCompleted(asyncSession);
      break;

    case 'checkout.session.async_payment_failed':
      const failedSession = event.data.object;
      await handleCheckoutSessionFailed(failedSession);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;
    const cartItemIds = session.metadata.cartItemIds.split(',');

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    // Mark order as paid
    order.paymentInfo.status = 'paid';
    order.paymentInfo.transactionId = session.payment_intent || session.id;
    order.paymentInfo.gatewayResponse = {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency
    };
    order.status = 'confirmed';
    await order.save();

    // Clear cart items
    await Cart.deleteMany({ _id: { $in: cartItemIds } });

    console.log(`Order ${orderId} marked as paid and cart cleared for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

/**
 * Handle failed checkout session
 */
async function handleCheckoutSessionFailed(session) {
  try {
    const orderId = session.metadata.orderId;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    // Mark order as failed
    order.paymentInfo.status = 'failed';
    order.status = 'failed';
    await order.save();

    console.log(`Order ${orderId} marked as failed`);
  } catch (error) {
    console.error('Error handling checkout session failed:', error);
  }
}

/**
 * GET /api/v1/stripe/session/:sessionId
 * Retrieve checkout session details
 */
router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: error.message
    });
  }
});

module.exports = router;
