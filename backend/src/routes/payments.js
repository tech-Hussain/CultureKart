/**
 * Payment Routes
 * Handles Stripe and JazzCash payment integration
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Order = require('../models/Order');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

const router = express.Router();

/**
 * POST /api/v1/payments/create-intent
 * Create Stripe PaymentIntent for an order
 */
router.post(
  '/create-intent',
  verifyFirebaseToken,
  [
    body('orderId').notEmpty().isMongoId().withMessage('Valid order ID is required'),
    body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least 0.5'),
    body('currency').isString().isIn(['usd', 'pkr', 'eur', 'gbp']).withMessage('Invalid currency'),
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

      const { orderId, amount, currency } = req.body;

      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({
          status: 'error',
          message: 'Stripe payment gateway is not configured',
        });
      }

      // Verify order exists and belongs to user
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
      }

      // Verify order belongs to authenticated user
      if (order.buyer.toString() !== req.user.uid) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to pay for this order',
        });
      }

      // Check if order is already paid
      if (order.paymentInfo.status === 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Order has already been paid',
        });
      }

      console.log(`💳 Creating Stripe PaymentIntent for order: ${orderId}`);

      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents/paise
        currency: currency.toLowerCase(),
        metadata: {
          orderId: orderId,
          userId: req.user.uid,
          userEmail: req.user.email || '',
        },
        description: `CultureKart Order #${orderId.slice(-8)}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`✅ PaymentIntent created: ${paymentIntent.id}`);

      // Update order with payment intent ID
      order.paymentInfo.transactionId = paymentIntent.id;
      await order.save();

      res.status(200).json({
        status: 'success',
        message: 'Payment intent created successfully',
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    } catch (error) {
      console.error('❌ Payment intent creation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create payment intent',
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/payments/webhook
 * Stripe webhook endpoint for handling payment events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Webhook secret not configured',
      });
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`✅ Webhook signature verified: ${event.type}`);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({
      status: 'error',
      message: `Webhook Error: ${err.message}`,
    });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

        // Get order ID from metadata
        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) {
          console.error('❌ Order ID not found in payment intent metadata');
          break;
        }

        // Find and update order
        const order = await Order.findById(orderId);

        if (!order) {
          console.error(`❌ Order not found: ${orderId}`);
          break;
        }

        // Update order payment status
        await order.markAsPaid(paymentIntent.id, {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          payment_method: paymentIntent.payment_method,
        });

        console.log(`✅ Order ${orderId} marked as paid`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);

        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.status = 'failed';
            order.paymentInfo.status = 'failed';
            order.paymentInfo.gatewayResponse = {
              error: paymentIntent.last_payment_error,
            };
            await order.save();
            console.log(`⚠️  Order ${orderId} marked as failed`);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log(`🔄 Refund processed: ${charge.id}`);

        // Find order by payment intent ID
        const order = await Order.findOne({
          'paymentInfo.transactionId': charge.payment_intent,
        });

        if (order) {
          await order.refundOrder(
            charge.amount_refunded / 100,
            'Refund processed by Stripe',
            charge.id
          );
          console.log(`✅ Order ${order._id} refunded`);
        }
        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Webhook processing failed',
    });
  }
});

/**
 * POST /api/v1/payments/jazzcash
 * JazzCash payment integration (PLACEHOLDER)
 * 
 * TODO: Replace with actual JazzCash integration
 * 
 * JazzCash Integration Guide:
 * 1. Sign up for JazzCash merchant account at https://sandbox.jazzcash.com.pk/
 * 2. Get your Merchant ID, Password, and Integrity Salt
 * 3. Add to .env:
 *    - JAZZCASH_MERCHANT_ID=your_merchant_id
 *    - JAZZCASH_PASSWORD=your_password
 *    - JAZZCASH_INTEGRITY_SALT=your_salt
 *    - JAZZCASH_RETURN_URL=http://localhost:5173/payment/jazzcash/callback
 * 4. Install jazzcash SDK: npm install jazzcash-checkout
 * 5. Replace the code below with actual integration:
 * 
 * Example Implementation:
 * 
 * const crypto = require('crypto');
 * 
 * // Generate secure hash
 * function generateSecureHash(data, integritySalt) {
 *   const sortedString = Object.keys(data)
 *     .sort()
 *     .map(key => data[key])
 *     .join('&');
 *   return crypto
 *     .createHmac('sha256', integritySalt)
 *     .update(sortedString)
 *     .digest('hex')
 *     .toUpperCase();
 * }
 * 
 * // Create JazzCash payment request
 * const paymentData = {
 *   pp_Version: '1.1',
 *   pp_TxnType: 'MWALLET',
 *   pp_Language: 'EN',
 *   pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
 *   pp_Password: process.env.JAZZCASH_PASSWORD,
 *   pp_TxnRefNo: `T${Date.now()}`,
 *   pp_Amount: Math.round(amount * 100), // Convert to paisas
 *   pp_TxnCurrency: 'PKR',
 *   pp_TxnDateTime: moment().format('YYYYMMDDHHmmss'),
 *   pp_BillReference: orderId,
 *   pp_Description: 'CultureKart Purchase',
 *   pp_TxnExpiryDateTime: moment().add(1, 'hours').format('YYYYMMDDHHmmss'),
 *   pp_ReturnURL: process.env.JAZZCASH_RETURN_URL,
 * };
 * 
 * // Generate secure hash
 * const secureHash = generateSecureHash(paymentData, process.env.JAZZCASH_INTEGRITY_SALT);
 * paymentData.pp_SecureHash = secureHash;
 * 
 * // Return form data to redirect user to JazzCash
 * res.status(200).json({
 *   status: 'success',
 *   data: {
 *     action: 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
 *     method: 'POST',
 *     fields: paymentData
 *   }
 * });
 */
router.post(
  '/jazzcash',
  verifyFirebaseToken,
  [
    body('orderId').notEmpty().isMongoId().withMessage('Valid order ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1 PKR'),
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

      const { orderId, amount } = req.body;

      // Verify order exists and belongs to user
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
      }

      if (order.buyer.toString() !== req.user.uid) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to pay for this order',
        });
      }

      // PLACEHOLDER IMPLEMENTATION
      console.warn('⚠️  JazzCash integration is not implemented. Returning mock data.');

      // Mock JazzCash redirect data
      const mockPaymentData = {
        action: 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
        method: 'POST',
        fields: {
          pp_Version: '1.1',
          pp_TxnType: 'MWALLET',
          pp_Language: 'EN',
          pp_MerchantID: 'MC12345',
          pp_TxnRefNo: `T${Date.now()}`,
          pp_Amount: Math.round(amount * 100),
          pp_TxnCurrency: 'PKR',
          pp_BillReference: orderId,
          pp_Description: 'CultureKart Purchase (TEST)',
          pp_ReturnURL: 'http://localhost:5173/payment/jazzcash/callback',
          // Note: In production, pp_SecureHash must be generated using HMAC-SHA256
        },
      };

      res.status(200).json({
        status: 'success',
        message: 'JazzCash payment initialized (MOCK DATA - Not a real transaction)',
        warning: 'This is a placeholder. Please implement actual JazzCash integration.',
        documentation: 'See comments in backend/src/routes/payments.js for implementation guide',
        data: mockPaymentData,
      });
    } catch (error) {
      console.error('❌ JazzCash payment error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to initialize JazzCash payment',
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/payments/jazzcash/callback
 * JazzCash callback handler (PLACEHOLDER)
 * 
 * TODO: Implement callback verification
 * - Verify pp_SecureHash from JazzCash response
 * - Update order status based on pp_ResponseCode
 * - Handle success/failure cases
 */
router.post('/jazzcash/callback', async (req, res) => {
  console.warn('⚠️  JazzCash callback received (not implemented)');
  console.log('JazzCash response:', req.body);

  // PLACEHOLDER: In production, verify secure hash and update order
  res.status(200).json({
    status: 'success',
    message: 'Callback received (not processed - placeholder)',
    data: req.body,
  });
});

module.exports = router;
