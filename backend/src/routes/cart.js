/**
 * Cart Routes
 * Handle shopping cart operations: add, update, remove, get cart
 */

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticate } = require('../middleware/authenticate');

/**
 * GET /api/v1/cart
 * Get user's cart items
 */
router.get('/', authenticate, async (req, res) => {
  try {
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

    // Get cart items with populated product details
    const cartItems = await Cart.getUserCart(user._id);
    
    // Transform cart items to ensure IPFS URLs are converted to gateway URLs
    const transformedCartItems = cartItems.map(item => {
      const itemObj = item.toObject();
      
      // Transform the snapshot productImage field
      if (itemObj.productImage && itemObj.productImage.startsWith('ipfs://')) {
        const cid = itemObj.productImage.replace('ipfs://', '');
        const gateway = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
        itemObj.productImage = `${gateway}/${cid}`;
      }
      
      // Transform populated product images
      if (itemObj.product && itemObj.product.images) {
        itemObj.product.images = itemObj.product.images.map(url => {
          if (url.startsWith('ipfs://')) {
            const cid = url.replace('ipfs://', '');
            const gateway = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
            return `${gateway}/${cid}`;
          }
          return url;
        });
      }
      
      return itemObj;
    });
    
    // Calculate totals
    const itemCount = transformedCartItems.length;
    const subtotal = await Cart.getCartTotal(user._id);
    const deliveryCharges = subtotal > 0 ? 150 : 0; // PKR 150 delivery or free
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryCharges + tax;

    return res.status(200).json({
      success: true,
      cartItems: transformedCartItems,
      summary: {
        itemCount,
        subtotal,
        deliveryCharges,
        tax,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/cart/add
 * Add item to cart or update quantity if already exists
 */
router.post('/add', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Get user
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

    // Get product details
    const product = await Product.findById(productId).populate('artisan', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is active
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Check if item already in cart
    let cartItem = await Cart.findByUserAndProduct(user._id, productId);

    if (cartItem) {
      // Update quantity
      const newQuantity = cartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available in stock`
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: 'Cart updated',
        cartItem
      });
    }

    // Create new cart item
    cartItem = await Cart.create({
      user: user._id,
      product: product._id,
      productName: product.title,
      productImage: product.images[0] || '',
      price: product.price,
      quantity,
      artisan: product.artisan?._id,
      artisanName: product.artisan?.name
    });

    await cartItem.populate('product', 'title images price stock status');

    return res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/cart/:id
 * Update cart item quantity
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Get user
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

    // Find cart item and verify ownership
    const cartItem = await Cart.findOne({ _id: req.params.id, user: user._id })
      .populate('product', 'title images price stock status');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Verify product stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stock} items available in stock`
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      cartItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/cart/:id
 * Remove item from cart
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Get user
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

    // Find and delete cart item
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      user: user._id
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/cart
 * Clear entire cart
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    // Get user
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

    // Clear cart
    const result = await Cart.clearUserCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/cart/count
 * Get cart item count
 */
router.get('/count', authenticate, async (req, res) => {
  try {
    // Get user
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

    const count = await Cart.getCartCount(user._id);

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart count',
      error: error.message
    });
  }
});

module.exports = router;
