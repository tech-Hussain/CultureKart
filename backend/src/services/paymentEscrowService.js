/**
 * Payment Escrow Service
 * Handles payment holding, commission split, and distribution
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { sendEmail} = require('./emailService');

/**
 * Create payment intent with escrow hold
 * Payment is authorized but not captured immediately
 */
async function createEscrowPayment(orderData) {
  try {
    const { orderId, amount, currency, buyerId, metadata } = orderData;

    // Create payment intent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      capture_method: 'manual', // Don't capture immediately - hold in escrow
      metadata: {
        orderId: orderId.toString(),
        buyerId: buyerId.toString(),
        ...metadata,
      },
    });

    console.log(`✅ Payment intent created in escrow: ${paymentIntent.id}`);

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      status: 'held',
    };
  } catch (error) {
    console.error('❌ Error creating escrow payment:', error);
    throw error;
  }
}

/**
 * Capture escrowed payment after order confirmation
 * This moves money from buyer to platform account
 */
async function captureEscrowPayment(paymentIntentId, orderId) {
  try {
    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    console.log(`✅ Payment captured from escrow: ${paymentIntent.id}`);

    // Update order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate commission split
    const split = Transaction.calculateCommissionSplit(order.total);

    // Update order with escrow details
    order.paymentDistribution = {
      escrowAmount: order.total,
      escrowReleased: false,
      artisanPayout: {
        amount: split.artisanShare,
        paid: false,
      },
      platformCommission: {
        amount: split.platformCommission,
        collected: true,
        collectedAt: new Date(),
      },
    };

    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
    order.paymentInfo.transactionId = paymentIntent.id;

    await order.save();

    // Create transaction record for escrow hold
    const transaction = new Transaction({
      order: orderId,
      artisan: order.items[0].artisan, // Assuming single artisan per order
      buyer: order.buyer,
      type: 'escrow_hold',
      status: 'held',
      amounts: split,
      stripe: {
        paymentIntentId: paymentIntent.id,
        chargeId: paymentIntent.latest_charge,
      },
      metadata: {
        paymentMethod: 'stripe',
        customerEmail: paymentIntent.receipt_email,
      },
    });

    await transaction.save();

    console.log(`💰 Escrow transaction created: ${transaction._id}`);

    return {
      success: true,
      transaction,
      order,
    };
  } catch (error) {
    console.error('❌ Error capturing escrow payment:', error);
    throw error;
  }
}

/**
 * Distribute payment after delivery confirmation
 * 90% to artisan, 10% platform commission
 */
async function distributePaymentOnDelivery(orderId, confirmedBy) {
  try {
    console.log(`📦 Processing payment distribution for order: ${orderId}`);

    const order = await Order.findById(orderId)
      .populate('buyer', 'name email')
      .populate('items.artisan', 'name email stripeAccountId');

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify delivery was confirmed
    if (!order.shippingDetails.deliveryConfirmedAt) {
      throw new Error('Delivery not yet confirmed');
    }

    // Check if already distributed
    if (order.paymentDistribution.escrowReleased) {
      throw new Error('Payment already distributed');
    }

    // Get artisan from first item (assuming single artisan per order)
    const artisan = order.items[0].artisan;
    if (!artisan) {
      throw new Error('Artisan not found');
    }

    const split = Transaction.calculateCommissionSplit(order.total);

    // NOTE: For Stripe Connect (real implementation):
    // You need to create Connected Accounts for artisans first
    // This is a simplified version - see comments below

    let stripeTransferId = null;

    // TODO: Implement Stripe Connect transfer to artisan
    // Requires artisans to have Stripe Connect accounts
    /*
    if (artisan.stripeAccountId) {
      const transfer = await stripe.transfers.create({
        amount: Math.round(split.artisanShare * 100),
        currency: order.currency.toLowerCase(),
        destination: artisan.stripeAccountId,
        transfer_group: `ORDER_${orderId}`,
        metadata: {
          orderId: orderId.toString(),
          artisanId: artisan._id.toString(),
        },
      });
      stripeTransferId = transfer.id;
      console.log(`✅ Stripe transfer created: ${transfer.id}`);
    }
    */

    // For now, we'll track that payout is pending
    // In production, integrate with Stripe Connect or manual bank transfer

    // Update order payment distribution
    order.paymentDistribution.escrowReleased = true;
    order.paymentDistribution.escrowReleasedAt = new Date();
    order.paymentDistribution.artisanPayout.paid = true;
    order.paymentDistribution.artisanPayout.paidAt = new Date();
    order.paymentDistribution.artisanPayout.stripeTransferId = stripeTransferId;

    await order.save();

    // Create artisan payout transaction
    const artisanTransaction = new Transaction({
      order: orderId,
      artisan: artisan._id,
      buyer: order.buyer._id,
      type: 'artisan_payout',
      status: 'completed',
      amounts: {
        total: order.total,
        artisanShare: split.artisanShare,
        platformCommission: split.platformCommission,
        paidToArtisan: split.artisanShare,
      },
      stripe: {
        transferId: stripeTransferId,
      },
      deliveryConfirmation: {
        confirmedAt: order.shippingDetails.deliveryConfirmedAt,
        confirmedBy: confirmedBy,
      },
    });

    await artisanTransaction.save();

    // Create platform commission transaction
    const commissionTransaction = new Transaction({
      order: orderId,
      artisan: artisan._id,
      buyer: order.buyer._id,
      type: 'platform_commission',
      status: 'completed',
      amounts: {
        total: order.total,
        artisanShare: split.artisanShare,
        platformCommission: split.platformCommission,
      },
    });

    await commissionTransaction.save();

    console.log(`✅ Payment distributed - Artisan: Rs ${split.artisanShare}, Platform: Rs ${split.platformCommission}`);

    // Send confirmation email to buyer
    await sendDeliveryConfirmationEmail(order);

    return {
      success: true,
      artisanPayout: split.artisanShare,
      platformCommission: split.platformCommission,
      transactions: {
        artisanTransaction: artisanTransaction._id,
        commissionTransaction: commissionTransaction._id,
      },
    };
  } catch (error) {
    console.error('❌ Error distributing payment:', error);
    throw error;
  }
}

/**
 * Send order placement confirmation email to buyer
 */
async function sendOrderPlacedEmail(order) {
  try {
    const buyerEmail = order.buyer.email;
    const buyerName = order.buyer.name;
    const orderNumber = order._id.toString().slice(-8).toUpperCase();

    const subject = `✅ Order Confirmed - #${orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c2d12; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .status-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .info-box { background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .shipping-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { margin: 10px 0; padding-left: 30px; position: relative; }
          .step::before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your order at CultureKart</p>
          </div>
          <div class="content">
            <p>Dear ${buyerName},</p>
            
            <p>Your order has been successfully placed! We're excited to bring this beautiful handcrafted product to you.</p>
            
            <div class="status-badge">✓ Payment Secured in Escrow</div>
            
            <div class="order-details">
              <h3>📦 Order Summary</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Total Amount:</strong> Rs ${order.total.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> Secured</p>
              <p><strong>Items:</strong> ${order.items.length} product(s)</p>
            </div>

            <div class="shipping-box">
              <h3>📍 Shipping Details</h3>
              <p><strong>${order.shippingAddress?.fullName || 'N/A'}</strong></p>
              <p>${order.shippingAddress?.address || 'N/A'}</p>
              <p>${order.shippingAddress?.city || 'N/A'}${order.shippingAddress?.postalCode ? ', ' + order.shippingAddress.postalCode : ''}</p>
              <p>📞 ${order.shippingAddress?.phone || 'N/A'}</p>
            </div>

            <div class="info-box">
              <h4>💳 Payment Security</h4>
              <p><strong>Your payment is 100% secure!</strong></p>
              <p>We hold your payment in escrow until delivery is confirmed. The artisan receives their payment (90%) only after you receive your order. This ensures your complete satisfaction!</p>
            </div>

            <div class="steps">
              <h3>📋 What Happens Next?</h3>
              <div class="step">The artisan will prepare your order</div>
              <div class="step">Your item will be carefully packaged and shipped</div>
              <div class="step">You'll receive a delivery confirmation email</div>
              <div class="step">Payment will be released to the artisan</div>
            </div>
            
            <p style="margin-top: 30px;">Thank you for supporting Pakistani artisans and preserving our cultural heritage! 🇵🇰</p>
          </div>
          <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>Track your order or contact us at <strong>queries@culturekart.com</strong></p>
            <p>&copy; 2025 CultureKart - Empowering Pakistani Artisans</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Confirmed - #${orderNumber}

Dear ${buyerName},

Your order has been successfully placed!

Order Summary:
- Order Number: #${orderNumber}
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Total Amount: Rs ${order.total.toLocaleString()}
- Payment Status: Secured in Escrow
- Items: ${order.items.length} product(s)

Shipping To:
${order.shippingAddress?.fullName || 'N/A'}
${order.shippingAddress?.address || 'N/A'}
${order.shippingAddress?.city || 'N/A'}${order.shippingAddress?.postalCode ? ', ' + order.shippingAddress.postalCode : ''}
Phone: ${order.shippingAddress?.phone || 'N/A'}

Payment Security:
Your payment is safely held in escrow. The artisan receives payment only after delivery confirmation.

What's Next:
1. Artisan prepares your order
2. Item is shipped to your address
3. You receive delivery confirmation email
4. Payment released to artisan

Thank you for supporting Pakistani artisans!

Need help? Contact us at queries@culturekart.com

CultureKart - Preserving Heritage, One Craft at a Time
    `;

    await sendEmail({
      to: buyerEmail,
      subject,
      html,
      text,
    });

    console.log(`✅ Order confirmation email sent to ${buyerEmail}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    // Don't throw - email failure shouldn't break order creation
    return { success: false, error: error.message };
  }
}

/**
 * Send delivery confirmation email to buyer
 */
async function sendDeliveryConfirmationEmail(order) {
  try {
    const buyerEmail = order.buyer.email;
    const buyerName = order.buyer.name;
    const orderNumber = order._id.toString().slice(-8).toUpperCase();

    const subject = `✅ Order Delivered - #${orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .support-box { background: #fef3c7; border: 2px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Delivered!</h1>
            <p>Order #${orderNumber}</p>
          </div>
          <div class="content">
            <p>Dear ${buyerName},</p>
            
            <p>Great news! Your order has been successfully delivered and confirmed by the artisan.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Delivery Date:</strong> ${new Date(order.shippingDetails.deliveryConfirmedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Total Amount:</strong> Rs ${order.total.toLocaleString()}</p>
              <p><strong>Items:</strong> ${order.items.length} product(s)</p>
            </div>

            <h3>📦 What's Next?</h3>
            <ul>
              <li>Check your product for any quality issues</li>
              <li>Verify authenticity using the QR code on your product</li>
              <li>Leave a review to help other buyers</li>
            </ul>

            <div class="support-box">
              <h4>📧 Need Help?</h4>
              <p>If you have any questions, concerns, or issues with your order, please don't hesitate to contact us:</p>
              <p><strong>Email:</strong> <a href="mailto:queries@culturekart.com">queries@culturekart.com</a></p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>

            <p>Thank you for supporting Pakistani artisans and preserving our cultural heritage!</p>

            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">
                View Order Details
              </a>
            </center>
          </div>
          <div class="footer">
            <p>🏺 CultureKart - Preserving Heritage, One Craft at a Time</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Delivered - #${orderNumber}

Dear ${buyerName},

Great news! Your order has been successfully delivered and confirmed by the artisan.

Order Details:
- Order Number: #${orderNumber}
- Delivery Date: ${new Date(order.shippingDetails.deliveryConfirmedAt).toLocaleDateString()}
- Total Amount: Rs ${order.total.toLocaleString()}
- Items: ${order.items.length} product(s)

What's Next?
- Check your product for any quality issues
- Verify authenticity using the QR code on your product
- Leave a review to help other buyers

Need Help?
If you have any questions or concerns, contact us at queries@culturekart.com

Thank you for supporting Pakistani artisans!

CultureKart - Preserving Heritage, One Craft at a Time
    `;

    await sendEmail({
      to: buyerEmail,
      subject,
      html,
      text,
    });

    // Update order to mark buyer as notified
    order.shippingDetails.buyerNotifiedOfDelivery = true;
    await order.save();

    console.log(`✅ Delivery confirmation email sent to ${buyerEmail}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending delivery confirmation email:', error);
    // Don't throw - email failure shouldn't break payment distribution
    return { success: false, error: error.message };
  }
}

/**
 * Get platform commission summary
 */
async function getPlatformCommissionSummary(filters = {}) {
  try {
    const { startDate, endDate } = filters;

    const commissionData = await Transaction.getPlatformCommission(startDate, endDate);

    // Get pending payouts (escrow held but not yet released)
    const pendingEscrow = await Transaction.aggregate([
      {
        $match: {
          type: 'escrow_hold',
          status: 'held',
        },
      },
      {
        $group: {
          _id: null,
          totalHeld: { $sum: '$amounts.total' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      commission: {
        total: commissionData.totalCommission,
        count: commissionData.count,
      },
      escrowHeld: pendingEscrow[0] || { totalHeld: 0, count: 0 },
    };
  } catch (error) {
    console.error('❌ Error getting commission summary:', error);
    throw error;
  }
}

module.exports = {
  createEscrowPayment,
  captureEscrowPayment,
  distributePaymentOnDelivery,
  sendOrderPlacedEmail,
  sendDeliveryConfirmationEmail,
  getPlatformCommissionSummary,
};
