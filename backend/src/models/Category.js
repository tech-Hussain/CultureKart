/**
 * Category Model
 * Centralized category management for products
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    
    emoji: {
      type: String,
      default: '🎨',
    },
    
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    order: {
      type: Number,
      default: 0,
    },
    
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method: Get active categories
categorySchema.statics.getActiveCategories = function () {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method: Update product count
categorySchema.statics.updateProductCount = async function (categoryName) {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ category: categoryName, status: 'active' });
  await this.findOneAndUpdate({ name: categoryName }, { productCount: count });
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
