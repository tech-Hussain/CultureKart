/**
 * Order Authentication Service
 * Handles QR code generation and authentication for orders
 */

const QRCode = require('qrcode');
const ProductAuthentication = require('../models/ProductAuthentication');
const Order = require('../models/Order');

/**
 * Generate authentication codes for all items in an order
 * @param {Object|String} orderOrId - Order document or order ID
 * @returns {Promise<Array>} Array of authentication codes
 */
exports.generateOrderAuthenticationCodes = async (orderOrId) => {
  try {
    console.log('🔧 [Service] Starting QR generation for:', orderOrId);
    console.log('🔧 [Service] Type of orderOrId:', typeof orderOrId);
    console.log('🔧 [Service] Is string?', typeof orderOrId === 'string');
    console.log('🔧 [Service] orderOrId.constructor.name:', orderOrId?.constructor?.name);
    
    let order;

    // If orderOrId is a string or ObjectId, fetch the order from database
    if (typeof orderOrId === 'string' || orderOrId.constructor.name === 'ObjectId') {
      console.log('🔧 [Service] Fetching order by ID...');
      order = await Order.findById(orderOrId).populate({
        path: 'items.product',
        populate: {
          path: 'artisan',
          select: 'displayName email'
        }
      });
      if (!order) {
        throw new Error(`Order not found: ${orderOrId}`);
      }
      console.log('🔧 [Service] Order found:', order._id);
      console.log('🔧 [Service] Items count:', order.items.length);
    } else {
      // It's already an order object
      order = orderOrId;
      console.log('🔧 [Service] Using provided order object');
      console.log('🔧 [Service] Order items:', order.items);
      console.log('🔧 [Service] Items length:', order.items?.length);
      
      // Populate if not already populated
      if (order.items && order.items.length > 0) {
        // Check if first item has populated product
        const firstProduct = order.items[0].product;
        console.log('🔧 [Service] First product:', firstProduct);
        console.log('🔧 [Service] Is product populated?', firstProduct?._id ? 'Yes' : 'No');
        
        if (!firstProduct || !firstProduct._id) {
          console.log('🔧 [Service] Populating products...');
          await order.populate({
            path: 'items.product',
            populate: {
              path: 'artisan',
              select: 'displayName email'
            }
          });
          console.log('🔧 [Service] Products populated');
        }
      }
    }

    if (!order.items || order.items.length === 0) {
      console.warn('⚠️ [Service] Order has no items!');
      return [];
    }

    const authenticationCodes = [];
    console.log('🔧 [Service] Processing items...');

    // Generate authentication code for each item
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      console.log(`🔧 [Service] Processing item ${i + 1}/${order.items.length}`);
      
      if (!item.product) {
        console.warn(`⚠️ Product not found for item in order ${order._id}`);
        continue;
      }

      console.log(`🔧 [Service] Product ID: ${item.product._id}`);
      console.log(`🔧 [Service] Product title: ${item.product.title}`);
      console.log(`🔧 [Service] Product artisan:`, item.product.artisan);

      // Generate authentication
      console.log(`🔧 [Service] Calling ProductAuthentication.generateAuthentication...`);
      const authentication = await ProductAuthentication.generateAuthentication(
        {
          _id: order._id,
          createdAt: order.createdAt,
          customerName: order.shippingAddress?.fullName || 'Customer',
          total: order.total,
        },
        item.product
      );
      console.log(`✅ [Service] Authentication created: ${authentication._id}`);

      // Generate QR code as data URL (base64 image)
      const qrCodeUrl = authentication.getQRCodeUrl();
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      authenticationCodes.push({
        productId: item.product._id,
        authenticationId: authentication._id,
        publicCode: authentication.publicVerificationCode,
        qrCodeUrl: qrCodeDataURL, // Base64 QR code image
        verificationUrl: qrCodeUrl, // URL for manual verification
      });
      console.log(`✅ [Service] QR code added to array for product ${item.product._id}`);
    }

    console.log(`🔧 [Service] Total auth codes generated: ${authenticationCodes.length}`);
    console.log(`🔧 [Service] Updating order with auth codes...`);
    
    // Update order with authentication codes
    order.authenticationCodes = authenticationCodes;
    await order.save();
    
    console.log(`✅ [Service] Order saved successfully with ${order.authenticationCodes.length} auth codes`);

    return authenticationCodes;
  } catch (error) {
    console.error('❌ [Service] Error generating authentication codes:', error.message);
    console.error('❌ [Service] Error stack:', error.stack);
    throw error;
  }
};

/**
 * Generate QR code image for a verification code
 * @param {string} verificationCode - Public verification code
 * @returns {Promise<string>} Base64 QR code image
 */
exports.generateQRCodeImage = async (verificationCode) => {
  try {
    const { getNetworkIP } = require('../utils/networkUtils');
    
    // Use network IP in development for better mobile access
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
      baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    } else {
      const networkIP = getNetworkIP();
      baseUrl = `http://${networkIP}:5173`;
    }
    
    const verificationUrl = `${baseUrl}/verify/${verificationCode}`;

    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw error;
  }
};

/**
 * Revoke authentication code (for refunds/cancellations)
 * @param {string} authenticationId - Authentication document ID
 * @returns {Promise<boolean>} Success status
 */
exports.revokeAuthenticationCode = async (authenticationId) => {
  try {
    const authentication = await ProductAuthentication.findById(authenticationId);

    if (!authentication) {
      throw new Error('Authentication code not found');
    }

    authentication.verificationStatus = 'revoked';
    await authentication.save();

    return true;
  } catch (error) {
    console.error('Error revoking authentication code:', error);
    throw error;
  }
};
