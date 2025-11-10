/**
 * Sales Analytics Model
 * Tracks daily sales, revenue, and performance metrics for artisan dashboard
 */

const mongoose = require('mongoose');

const salesAnalyticsSchema = new mongoose.Schema(
  {
    // Reference to Artisan
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: [true, 'Artisan reference is required'],
      index: true,
    },

    // Date for this analytics record (one record per day per artisan)
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },

    // Daily sales metrics
    sales: {
      // Total revenue for the day
      revenue: {
        type: Number,
        default: 0,
        min: 0,
      },
      
      // Total number of orders
      orders: {
        type: Number,
        default: 0,
        min: 0,
      },
      
      // Total units sold
      units: {
        type: Number,
        default: 0,
        min: 0,
      },
      
      // Average order value
      averageOrderValue: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Product performance
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        sales: {
          type: Number,
          default: 0,
          min: 0,
        },
        revenue: {
          type: Number,
          default: 0,
          min: 0,
        },
        views: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    // Category breakdown
    categories: {
      type: Map,
      of: {
        sales: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
      },
      default: new Map(),
    },

    // Traffic metrics
    traffic: {
      // Profile views
      profileViews: {
        type: Number,
        default: 0,
        min: 0,
      },
      
      // Total product views
      productViews: {
        type: Number,
        default: 0,
        min: 0,
      },
      
      // Conversion rate (orders / profile views)
      conversionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 1,
      },
    },

    // Order status breakdown
    orderStatus: {
      pending: { type: Number, default: 0 },
      confirmed: { type: Number, default: 0 },
      processing: { type: Number, default: 0 },
      shipped: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
      refunded: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better query performance
salesAnalyticsSchema.index({ artisan: 1, date: 1 }, { unique: true });
salesAnalyticsSchema.index({ artisan: 1, date: -1 });
salesAnalyticsSchema.index({ date: -1 });

// Virtual: Calculate conversion rate
salesAnalyticsSchema.virtual('calculatedConversionRate').get(function () {
  if (this.traffic.profileViews === 0) return 0;
  return this.sales.orders / this.traffic.profileViews;
});

// Static method: Get analytics for artisan within date range
salesAnalyticsSchema.statics.getAnalyticsByDateRange = function (artisanId, startDate, endDate) {
  return this.find({
    artisan: artisanId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: 1 })
    .populate('products.product', 'title category');
};

// Static method: Get last 7 days analytics
salesAnalyticsSchema.statics.getLastWeekAnalytics = function (artisanId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return this.getAnalyticsByDateRange(artisanId, sevenDaysAgo, new Date());
};

// Static method: Get last 30 days analytics
salesAnalyticsSchema.statics.getLastMonthAnalytics = function (artisanId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.getAnalyticsByDateRange(artisanId, thirtyDaysAgo, new Date());
};

// Static method: Aggregate total stats for artisan
salesAnalyticsSchema.statics.getTotalStats = async function (artisanId) {
  const result = await this.aggregate([
    { $match: { artisan: new mongoose.Types.ObjectId(artisanId) } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$sales.revenue' },
        totalOrders: { $sum: '$sales.orders' },
        totalUnits: { $sum: '$sales.units' },
        totalProfileViews: { $sum: '$traffic.profileViews' },
        totalProductViews: { $sum: '$traffic.productViews' },
        avgOrderValue: { $avg: '$sales.averageOrderValue' },
      },
    },
  ]);
  
  return result[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalUnits: 0,
    totalProfileViews: 0,
    totalProductViews: 0,
    avgOrderValue: 0,
  };
};

// Static method: Update or create analytics for a specific date
salesAnalyticsSchema.statics.updateAnalytics = async function (artisanId, date, updateData) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  return this.findOneAndUpdate(
    { artisan: artisanId, date: dateOnly },
    { $inc: updateData },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
};

// Instance method: Add product sale
salesAnalyticsSchema.methods.addProductSale = async function (productId, units, revenue) {
  // Find existing product entry or create new one
  const existingProduct = this.products.find(p => p.product.toString() === productId.toString());
  
  if (existingProduct) {
    existingProduct.sales += units;
    existingProduct.revenue += revenue;
  } else {
    this.products.push({
      product: productId,
      sales: units,
      revenue: revenue,
    });
  }
  
  // Update overall sales metrics
  this.sales.units += units;
  this.sales.revenue += revenue;
  this.sales.orders += 1;
  this.sales.averageOrderValue = this.sales.revenue / this.sales.orders;
  
  return await this.save();
};

// Instance method: Add product view
salesAnalyticsSchema.methods.addProductView = async function (productId) {
  const existingProduct = this.products.find(p => p.product.toString() === productId.toString());
  
  if (existingProduct) {
    existingProduct.views += 1;
  } else {
    this.products.push({
      product: productId,
      views: 1,
    });
  }
  
  this.traffic.productViews += 1;
  
  return await this.save();
};

// Pre-save hook: Calculate conversion rate
salesAnalyticsSchema.pre('save', function (next) {
  if (this.traffic.profileViews > 0) {
    this.traffic.conversionRate = this.sales.orders / this.traffic.profileViews;
  }
  next();
});

const SalesAnalytics = mongoose.model('SalesAnalytics', salesAnalyticsSchema);

module.exports = SalesAnalytics;