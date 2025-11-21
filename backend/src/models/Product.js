/**
 * Product Model
 * Represents products created by artisans with blockchain provenance
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Reference to Artisan who created this product
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: [true, 'Artisan reference is required'],
      index: true,
    },

    // Product title
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },

    // Product description
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Price
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Currency
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      enum: {
        values: ['USD', 'PKR', 'EUR', 'GBP'],
        message: 'Currency must be USD, PKR, EUR, or GBP',
      },
      default: 'PKR',
    },

    // Stock quantity
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    // Product images (URLs or IPFS hashes)
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 10;
        },
        message: 'Product must have between 1 and 10 images',
      },
    },

    // IPFS metadata hash for decentralized storage
    ipfsMetadataHash: {
      type: String,
      trim: true,
      default: '',
    },

    // Blockchain transaction hash for provenance
    blockchainTxn: {
      type: String,
      trim: true,
      default: '',
    },

    // Product category
    category: {
      type: String,
      trim: true,
      enum: {
        values: [
          'Textiles & Fabrics',
          'Pottery & Ceramics',
          'Woodwork',
          'Jewelry',
          'Metalwork',
          'Hand-painted Items',
          'Embroidery',
          'Leather Goods',
          'Traditional Clothing',
          'Home Decor',
          'Other',
        ],
        message: 'Invalid product category',
      },
      default: 'Other',
    },

    // Product tags for better searchability
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'Product cannot have more than 10 tags',
      },
    },

    // Dimensions (optional)
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: {
        type: String,
        enum: ['cm', 'inch', 'mm'],
        default: 'cm',
      },
    },

    // Weight (optional)
    weight: {
      value: { type: Number, min: 0 },
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg',
      },
    },

    // Product status
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'inactive', 'out_of_stock'],
        message: 'Invalid product status',
      },
      default: 'active',
      index: true,
    },

    // Product rating
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Total views
    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total sales count
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Featured product flag
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Admin verification status
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Verification details
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ artisan: 1, status: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });

// Virtual: Check if product is in stock
productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

// Virtual: Check if product is available for purchase
productSchema.virtual('isAvailable').get(function () {
  return this.status === 'active' && this.stock > 0;
});

// Instance method: Decrease stock
productSchema.methods.decreaseStock = async function (quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  this.soldCount += quantity;
  
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  }
  
  return await this.save();
};

// Instance method: Increase stock
productSchema.methods.increaseStock = async function (quantity) {
  this.stock += quantity;
  
  if (this.status === 'out_of_stock' && this.stock > 0) {
    this.status = 'active';
  }
  
  return await this.save();
};

// Instance method: Increment view count
productSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save({ validateBeforeSave: false });
};

// Static method: Find active products
productSchema.statics.findActive = function () {
  return this.find({ status: 'active', stock: { $gt: 0 } }).populate('artisan');
};

// Static method: Find products by artisan
productSchema.statics.findByArtisan = function (artisanId) {
  return this.find({ artisan: artisanId }).sort({ createdAt: -1 });
};

// Static method: Find featured products
productSchema.statics.findFeatured = function () {
  return this.find({ isFeatured: true, status: 'active', stock: { $gt: 0 } })
    .populate('artisan')
    .sort({ 'rating.average': -1 });
};

// Pre-save hook: Update status based on stock
productSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    if (this.stock === 0 && this.status === 'active') {
      this.status = 'out_of_stock';
    } else if (this.stock > 0 && this.status === 'out_of_stock') {
      this.status = 'active';
    }
  }
  next();
});

// Transform toJSON to convert IPFS URLs to gateway URLs
productSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Convert IPFS image URLs to gateway URLs
    if (ret.images && Array.isArray(ret.images)) {
      ret.gatewayImages = ret.images.map(url => {
        if (url.startsWith('ipfs://')) {
          const cid = url.replace('ipfs://', '');
          const gateway = process.env.IPFS_GATEWAY_URL || 'https://nftstorage.link/ipfs';
          return `${gateway}/${cid}`;
        }
        return url;
      });
      // Keep original IPFS URLs but add gateway URLs
      ret.ipfsImages = ret.images;
      ret.images = ret.gatewayImages; // Override images with gateway URLs for frontend
    }
    
    // Convert metadata IPFS URL to gateway URL
    if (ret.ipfsMetadataHash) {
      const gateway = process.env.IPFS_GATEWAY_URL || 'https://nftstorage.link/ipfs';
      ret.metadataGatewayUrl = `${gateway}/${ret.ipfsMetadataHash}`;
    }
    
    return ret;
  }
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
