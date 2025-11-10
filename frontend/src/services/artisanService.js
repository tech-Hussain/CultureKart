/**
 * Artisan Dashboard Service
 * API service functions for artisan dashboard functionality
 */

import { apiRequest } from '../api/api';

// ============================================================================
// DASHBOARD DATA SERVICES
// ============================================================================

/**
 * Get overall dashboard statistics
 */
export const getDashboardStats = async () => {
  return apiRequest('/artisan/dashboard/stats', 'GET');
};

/**
 * Get analytics data for charts
 */
export const getDashboardAnalytics = async (period = 'week') => {
  return apiRequest(`/artisan/dashboard/analytics?period=${period}`, 'GET');
};

/**
 * Get top performing products
 */
export const getTopProducts = async (limit = 4) => {
  return apiRequest(`/artisan/dashboard/top-products?limit=${limit}`, 'GET');
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (limit = 5) => {
  return apiRequest(`/artisan/dashboard/recent-orders?limit=${limit}`, 'GET');
};

// ============================================================================
// PRODUCT MANAGEMENT SERVICES
// ============================================================================

/**
 * Get all products for artisan with filtering
 */
export const getArtisanProducts = async (params = {}) => {
  const queryString = new URLSearchParams({
    page: 1,
    limit: 10,
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params
  }).toString();
  
  return apiRequest(`/artisan/products?${queryString}`, 'GET');
};

/**
 * Get single product details
 */
export const getProductDetails = async (productId) => {
  return apiRequest(`/artisan/products/${productId}`, 'GET');
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  return apiRequest('/artisan/products', 'POST', productData);
};

/**
 * Update existing product
 */
export const updateProduct = async (productId, productData) => {
  return apiRequest(`/artisan/products/${productId}`, 'PUT', productData);
};

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  return apiRequest(`/artisan/products/${productId}`, 'DELETE');
};

/**
 * Toggle product status (active/inactive)
 */
export const toggleProductStatus = async (productId, status) => {
  return apiRequest(`/artisan/products/${productId}/status`, 'PATCH', { status });
};

// ============================================================================
// ORDER MANAGEMENT SERVICES
// ============================================================================

/**
 * Get all orders for artisan with filtering
 */
export const getArtisanOrders = async (params = {}) => {
  const queryString = new URLSearchParams({
    page: 1,
    limit: 10,
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params
  }).toString();
  
  return apiRequest(`/artisan/orders?${queryString}`, 'GET');
};

/**
 * Get single order details
 */
export const getOrderDetails = async (orderId) => {
  return apiRequest(`/artisan/orders/${orderId}`, 'GET');
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status, notes = '') => {
  return apiRequest(`/artisan/orders/${orderId}/status`, 'PATCH', { 
    status, 
    notes 
  });
};

/**
 * Get order statistics
 */
export const getOrderStats = async () => {
  return apiRequest('/artisan/orders/stats', 'GET');
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/PKR/, 'Rs');
};

/**
 * Format percentage change
 */
export const formatPercentage = (value, showSign = true) => {
  const formatted = Math.abs(value).toFixed(1);
  if (showSign) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
  return `${formatted}%`;
};

/**
 * Get status color classes
 */
export const getStatusColor = (status) => {
  const statusColors = {
    // Product statuses
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-gray-100 text-gray-800',
    out_of_stock: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
    
    // Order statuses
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get trend icon and color
 */
export const getTrendInfo = (isPositive) => {
  return {
    icon: isPositive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon',
    color: isPositive ? 'text-emerald-600' : 'text-red-600',
    bgColor: isPositive ? 'bg-emerald-50' : 'bg-red-50',
  };
};

/**
 * Generate chart colors
 */
export const getChartColors = () => {
  return [
    '#D97706', // Amber
    '#7C2D12', // Maroon
    '#059669', // Emerald
    '#9333EA', // Purple
    '#6B7280', // Gray
    '#DC2626', // Red
    '#2563EB', // Blue
    '#16A34A', // Green
  ];
};

/**
 * Transform analytics data for recharts
 */
export const transformAnalyticsData = (data, period = 'week') => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    ...item,
    day: period === 'week' ? 
      new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) :
      new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    sales: item.sales || 0,
    orders: item.orders || 0,
    units: item.units || 0,
  }));
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format date for display
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format time for display
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else {
    return formatDate(date);
  }
};