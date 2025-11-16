/**
 * Admin Service
 * API calls for admin dashboard and management
 */
import { apiRequest } from '../api/api';

/**
 * Get dashboard summary statistics
 */
export const getDashboardSummary = async () => {
  return apiRequest('/admin/summary', 'GET');
};

/**
 * Get monthly sales data for charts (last 12 months)
 */
export const getMonthlySales = async () => {
  return apiRequest('/admin/sales-monthly', 'GET');
};

/**
 * Get top selling products
 */
export const getTopProducts = async () => {
  return apiRequest('/admin/top-products', 'GET');
};

/**
 * Get all artisans with filters
 */
export const getArtisans = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/admin/artisans${queryString ? `?${queryString}` : ''}`, 'GET');
};

/**
 * Approve an artisan
 */
export const approveArtisan = async (artisanId) => {
  return apiRequest(`/admin/artisans/${artisanId}/approve`, 'PATCH');
};

/**
 * Reject an artisan
 */
export const rejectArtisan = async (artisanId) => {
  return apiRequest(`/admin/artisans/${artisanId}/reject`, 'PATCH');
};

/**
 * Get all users with filters
 */
export const getUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`, 'GET');
};

/**
 * Get all products with filters
 */
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/admin/products${queryString ? `?${queryString}` : ''}`, 'GET');
};

/**
 * Get all orders with filters
 */
export const getOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/admin/orders${queryString ? `?${queryString}` : ''}`, 'GET');
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'PKR') => {
  if (currency === 'PKR') {
    return `Rs ${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
};

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
};
