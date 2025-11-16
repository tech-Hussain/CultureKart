/**
 * Artisan Dashboard API Routes
 * Provides real-time data for artisan dashboard functionality
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Product = require('../models/Product');
const Order = require('../models/Order');
const Artisan = require('../models/Artisan');
const SalesAnalytics = require('../models/SalesAnalytics');
const User = require('../models/User');

// Middleware
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');

// Helper function to get artisan ID from user
const getArtisanId = async (user) => {
  try {
    // user can be either a user ID (string) or user object
    const userId = typeof user === 'string' ? user : user._id;
    const artisan = await Artisan.findOne({ user: userId });
    if (!artisan) {
      console.error(`❌ No artisan profile found for user: ${userId}`);
      throw new Error('Artisan profile not found. Please contact support to set up your artisan account.');
    }
    console.log(`✅ Found artisan profile: ${artisan._id} for user: ${userId}`);
    return artisan._id;
  } catch (error) {
    console.error('❌ Error in getArtisanId:', error.message);
    throw error;
  }
};

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

/**
 * GET /api/v1/artisan/dashboard/stats
 * Get overall dashboard statistics for authenticated artisan
 */
router.get('/dashboard/stats', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    
    // Get current date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    // Calculate stats directly from orders
    const allTimeOrders = await Order.find({ 'items.artisan': artisanId });
    const deliveredOrders = allTimeOrders.filter(o => o.status === 'delivered');
    
    console.log(`📊 All-time orders: ${allTimeOrders.length}, Delivered: ${deliveredOrders.length}`);
    
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = deliveredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    console.log(`💰 Total Revenue: Rs ${totalRevenue}, Total Orders: ${totalOrders}, Avg: Rs ${avgOrderValue}`);
    
    // Calculate current period (last 30 days)
    const currentPeriodOrders = deliveredOrders.filter(o => 
      new Date(o.createdAt) >= thirtyDaysAgo
    );
    const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const currentOrders = currentPeriodOrders.length;
    
    // Calculate previous period (30-60 days ago)
    const previousPeriodOrders = deliveredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
    });
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousOrders = previousPeriodOrders.length;
    
    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;
    const ordersChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders * 100) : 0;
    
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      'items.artisan': artisanId,
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });
    
    // Get active products count
    const activeProducts = await Product.countDocuments({
      artisan: artisanId,
      status: 'active'
    });
    
    // Get total products count
    const totalProducts = await Product.countDocuments({
      artisan: artisanId
    });
    
    const stats = {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      avgOrderValue: Math.round(avgOrderValue),
      revenueGrowth: revenueChange,
      ordersGrowth: ordersChange,
      avgOrderGrowth: 0,
      totalProducts: totalProducts,
      activeProducts: activeProducts,
      pendingOrders: pendingOrders,
      totalSales: {
        value: currentRevenue,
        change: revenueChange,
        isPositive: revenueChange >= 0,
        formatted: `Rs ${currentRevenue.toLocaleString()}`,
      },
      monthlyRevenue: {
        value: currentRevenue,
        change: revenueChange,
        isPositive: revenueChange >= 0,
        formatted: `Rs ${currentRevenue.toLocaleString()}`,
      },
      allTimeStats: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        averageOrderValue: avgOrderValue,
      }
    };
    
    console.log(`📤 Sending stats:`, JSON.stringify(stats, null, 2));
    
    res.json({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // Handle specific case of missing artisan profile
    if (error.message.includes('Artisan profile not found')) {
      return res.status(403).json({
        success: false,
        message: 'No artisan profile found for this user. Please contact support to set up your artisan account.',
        code: 'ARTISAN_PROFILE_MISSING',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/dashboard/analytics
 * Get detailed analytics data for charts and graphs
 */
router.get('/dashboard/analytics', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { period = 'week' } = req.query;
    
    // Calculate date range
    const today = new Date();
    const daysToGoBack = period === 'week' ? 7 : 30;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysToGoBack);
    
    // Get delivered orders in the period
    const orders = await Order.find({
      'items.artisan': artisanId,
      status: 'delivered',
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });
    
    // Group orders by date
    const salesByDate = {};
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { revenue: 0, orders: 0, units: 0 };
      }
      salesByDate[dateKey].revenue += order.total || 0;
      salesByDate[dateKey].orders += 1;
      salesByDate[dateKey].units += order.items.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);
    });
    
    // Transform to array format for charts
    const weeklySales = Object.entries(salesByDate).map(([date, data]) => ({
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      date: date,
      sales: data.revenue,
      orders: data.orders,
      units: data.units,
    }));
    
    // Get product performance from delivered orders
    const productPerformance = await Order.aggregate([
      {
        $match: { 
          'items.artisan': new mongoose.Types.ObjectId(artisanId),
          status: 'delivered'
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.artisan': new mongoose.Types.ObjectId(artisanId)
        }
      },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.title' },
          sales: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          category: { $first: '$items.category' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          sales: 1,
          revenue: 1,
          category: 1
        }
      }
    ]);
    
    // Get category distribution from products
    const categories = await Product.aggregate([
      {
        $match: { 
          artisan: new mongoose.Types.ObjectId(artisanId),
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          sales: { $sum: '$soldCount' },
          revenue: { $sum: { $multiply: ['$soldCount', '$price'] } }
        }
      },
      {
        $project: {
          name: '$_id',
          value: '$sales',
          count: '$count',
          revenue: '$revenue'
        }
      },
      {
        $sort: { value: -1 }
      }
    ]);
    
    // Add colors for pie chart
    const colors = ['#D97706', '#7C2D12', '#059669', '#9333EA', '#6B7280'];
    const categoryData = categories.map((cat, index) => ({
      ...cat,
      color: colors[index % colors.length]
    }));
    
    res.json({
      success: true,
      data: {
        weeklySales,
        productPerformance,
        categoryData,
        period,
      },
    });
    
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/dashboard/top-products
 * Get top performing products for the dashboard
 */
router.get('/dashboard/top-products', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { limit = 4 } = req.query;
    
    const topProducts = await Product.find({
      artisan: artisanId,
      status: 'active'
    })
    .sort({ soldCount: -1, views: -1 })
    .limit(parseInt(limit))
    .select('title soldCount views price images category')
    .lean();
    
    // Add trend calculation (simplified)
    const productsWithTrend = topProducts.map((product, index) => ({
      id: product._id,
      name: product.title,
      sales: product.soldCount,
      revenue: product.soldCount * product.price,
      image: product.images[0] || '🎨',
      trend: index < 2 ? 'up' : 'down', // Top 2 are trending up
      views: product.views,
      category: product.category,
    }));
    
    res.json({
      success: true,
      data: productsWithTrend,
    });
    
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top products',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/dashboard/recent-orders
 * Get recent orders for dashboard overview
 */
router.get('/dashboard/recent-orders', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { limit = 5 } = req.query;
    
    const recentOrders = await Order.find({
      'items.artisan': artisanId
    })
    .populate('buyer', 'name email')
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();
    
    // Filter items to only show this artisan's products
    const filteredOrders = recentOrders.map(order => ({
      ...order,
      items: order.items.filter(item => 
        item.artisan && item.artisan.toString() === artisanId.toString()
      )
    })).filter(order => order.items.length > 0);
    
    res.json({
      success: true,
      data: filteredOrders,
    });
    
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent orders',
      error: error.message,
    });
  }
});

// ============================================================================
// PRODUCT MANAGEMENT ROUTES
// ============================================================================

/**
 * GET /api/v1/artisan/products
 * Get all products for authenticated artisan with filtering and sorting
 */
router.get('/products', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    console.log(`🔍 Fetching products for artisan: ${artisanId}`);
    
    const {
      page = 1,
      limit = 10,
      search = '',
      category = 'all',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log(`📄 Query params: page=${page}, limit=${limit}, search="${search}", category=${category}, status=${status}`);
    
    // Build query filters
    const query = { artisan: artisanId };
    console.log(`🔍 Base query:`, query);
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category !== 'all') {
      query.category = category;
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    console.log(`🔍 Final query:`, JSON.stringify(query));
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    console.log(`🔍 Sort:`, sort);
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    console.log(`📊 Pagination: skip=${skip}, limit=${limit}`);
    
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description price stock soldCount status images category tags createdAt views rating')
      .lean();
    
    console.log(`✅ Found ${products.length} products`);
    if (products.length > 0) {
      console.log(`📋 First product: ${products[0].title}`);
    }
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    console.log(`📊 Total products matching query: ${total}`);
    
    const response = {
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: products.length,
          totalProducts: total
        }
      }
    };
    
    console.log(`📤 Sending response with ${products.length} products`);
    res.json(response);
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/products/:id
 * Get single product details for authenticated artisan
 */
router.get('/products/:id', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { id } = req.params;
    
    const product = await Product.findOne({
      _id: id,
      artisan: artisanId
    }).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/artisan/products
 * Create new product for authenticated artisan
 */
router.post('/products', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    
    const productData = {
      ...req.body,
      artisan: artisanId
    };
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'stock', 'images', 'category'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    const product = new Product(productData);
    await product.save();
    
    // Update artisan total products count
    await Artisan.findByIdAndUpdate(artisanId, {
      $inc: { totalProducts: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
});

/**
 * PUT /api/v1/artisan/products/:id
 * Update product for authenticated artisan
 */
router.put('/products/:id', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { id } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { _id: id, artisan: artisanId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/v1/artisan/products/:id
 * Delete product for authenticated artisan
 */
router.delete('/products/:id', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { id } = req.params;
    
    const product = await Product.findOneAndDelete({
      _id: id,
      artisan: artisanId
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update artisan total products count
    await Artisan.findByIdAndUpdate(artisanId, {
      $inc: { totalProducts: -1 }
    });
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/v1/artisan/products/:id/status
 * Toggle product status (active/inactive)
 */
router.patch('/products/:id/status', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or inactive'
      });
    }
    
    const product = await Product.findOneAndUpdate(
      { _id: id, artisan: artisanId },
      { status },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: `Product ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: product
    });
    
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status',
      error: error.message,
    });
  }
});

// ============================================================================
// ORDER MANAGEMENT ROUTES
// ============================================================================

/**
 * GET /api/v1/artisan/orders
 * Get all orders for authenticated artisan with filtering
 */
router.get('/orders', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    
    const {
      page = 1,
      limit = 10,
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query filters
    const query = {
      'items.artisan': artisanId
    };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'buyer.name': { $regex: search, $options: 'i' } },
        { 'buyer.email': { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('buyer', 'name email profile')
      .populate('items.product', 'title images price')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Filter orders to only include this artisan's items
    const filteredOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item => 
        item.artisan && item.artisan.toString() === artisanId.toString()
      ),
      // Calculate total for this artisan's items only
      artisanTotal: order.items
        .filter(item => item.artisan && item.artisan.toString() === artisanId.toString())
        .reduce((sum, item) => sum + (item.price * item.qty), 0)
    })).filter(order => order.items.length > 0);
    
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders: filteredOrders,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: filteredOrders.length,
          totalOrders: total
        }
      }
    });
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/orders/stats
 * Get order statistics for artisan dashboard
 */
router.get('/orders/stats', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    console.log('📊 Getting order stats for artisan:', artisanId);
    
    // Get order status counts
    const statusStats = await Order.aggregate([
      {
        $match: { 'items.artisan': new mongoose.Types.ObjectId(artisanId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('📈 Aggregation result:', statusStats);
    
    // Convert to object format
    const stats = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };
    
    statusStats.forEach(stat => {
      if (stats.hasOwnProperty(stat._id)) {
        stats[stat._id] = stat.count;
      }
    });
    
    // Calculate total orders
    const totalOrders = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    console.log('✅ Final stats:', { ...stats, total: totalOrders });
    
    res.json({
      success: true,
      data: {
        ...stats,
        total: totalOrders
      }
    });
    
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/artisan/orders/:id
 * Get single order details for authenticated artisan
 */
router.get('/orders/:id', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { id } = req.params;
    
    const order = await Order.findOne({
      _id: id,
      'items.artisan': artisanId
    })
    .populate('buyer', 'name email profile phone')
    .populate('items.product', 'title images price description')
    .lean();
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Filter items to only show this artisan's products
    order.items = order.items.filter(item => 
      item.artisan && item.artisan.toString() === artisanId.toString()
    );
    
    // Calculate total for this artisan's items
    order.artisanTotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/v1/artisan/orders/:id/status
 * Update order status
 */
router.patch('/orders/:id/status', authenticate, requireRole(['artisan']), async (req, res) => {
  try {
    const artisanId = await getArtisanId(req.dbUser);
    const { id } = req.params;
    const { status, notes = '' } = req.body;
    
    // Validate status transitions artisan can make
    const allowedStatuses = ['confirmed', 'processing', 'packed', 'shipped', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed statuses: confirmed, processing, packed, shipped, delivered'
      });
    }
    
    // Find order that contains this artisan's products
    const order = await Order.findOne({
      _id: id,
      'items.artisan': artisanId
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.status = status;
    if (notes) {
      order.internalNotes = `${order.internalNotes || ''}\n[${new Date().toISOString()}] Artisan note: ${notes}`.trim();
    }
    
    if (status === 'shipped') {
      order.shippingDetails = order.shippingDetails || {};
      order.shippingDetails.shippedAt = new Date();
    }
    
    if (status === 'delivered') {
      order.shippingDetails = order.shippingDetails || {};
      order.shippingDetails.deliveredAt = new Date();
    }
    
    await order.save();
    
    console.log(`✅ Order ${id} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: `Order marked as ${status}`,
      data: order
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
});

module.exports = router;
