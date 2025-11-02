/**
 * Cart Model
 * Represents shopping cart items for users
 * Each cart item is linked to a user and contains product details
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  // Store snapshot of product details at time of adding to cart
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  productImage: {
    type: String,
    required: [true, 'Product image is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  artisanName: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure one item per product per user
cartItemSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual for subtotal
cartItemSchema.virtual('subtotal').get(function() {
  return this.price * this.quantity;
});

// Instance method to update quantity
cartItemSchema.methods.updateQuantity = function(newQuantity) {
  if (newQuantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  this.quantity = newQuantity;
  return this.save();
};

// Static method to get user's cart
cartItemSchema.statics.getUserCart = async function(userId) {
  return this.find({ user: userId })
    .populate('product', 'title images price stock isActive')
    .sort({ createdAt: -1 });
};

// Static method to get cart count
cartItemSchema.statics.getCartCount = async function(userId) {
  return this.countDocuments({ user: userId });
};

// Static method to get cart total
cartItemSchema.statics.getCartTotal = async function(userId) {
  const cartItems = await this.find({ user: userId });
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Static method to clear user cart
cartItemSchema.statics.clearUserCart = async function(userId) {
  return this.deleteMany({ user: userId });
};

// Static method to find cart item by user and product
cartItemSchema.statics.findByUserAndProduct = async function(userId, productId) {
  return this.findOne({ user: userId, product: productId });
};

// Pre-save validation
cartItemSchema.pre('save', async function(next) {
  // Validate product still exists and is active
  if (this.isModified('product')) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (!product.isActive) {
      throw new Error('Product is no longer available');
    }
    
    if (product.stock < this.quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }
  }
  
  next();
});

// Ensure virtuals are included in JSON
cartItemSchema.set('toJSON', { virtuals: true });
cartItemSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartItemSchema);

module.exports = Cart;
