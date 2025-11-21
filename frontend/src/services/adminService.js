/**
 * Admin Service
 * API calls for admin dashboard and management
 */
import { apiRequest } from '../api/api';

/**
 * Get dashboard summary statistics
 */
export const getDashboardSummary = async () => {
  console.log('📊 Fetching dashboard summary...');
  const response = await apiRequest('/admin/summary', 'GET');
  console.log('✅ Dashboard summary response:', response.data);
  return response;
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
  // Remove undefined values from params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanParams).toString();
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
  console.log('👥 Fetching users with params:', params);
  // Remove undefined values from params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const response = await apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`, 'GET');
  console.log('✅ Users response:', response.data);
  return response;
};

/**
 * Get all products with filters
 */
export const getProducts = async (params = {}) => {
  console.log('📦 Fetching products with params:', params);
  // Remove undefined values from params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const response = await apiRequest(`/admin/products${queryString ? `?${queryString}` : ''}`, 'GET');
  console.log('✅ Products response:', response.data);
  return response;
};

/**
 * Get all orders with filters
 */
export const getOrders = async (params = {}) => {
  console.log('📋 Fetching orders with params:', params);
  // Remove undefined values from params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const response = await apiRequest(`/admin/orders${queryString ? `?${queryString}` : ''}`, 'GET');
  console.log('✅ Orders response:', response.data);
  return response;
};

/**
 * Verify or unverify a product
 */
export const verifyProduct = async (productId, verified) => {
  console.log(`${verified ? '\u2705' : '\u274c'} ${verified ? 'Verifying' : 'Unverifying'} product ${productId}...`);
  const response = await apiRequest(`/products/${productId}/verify`, 'PATCH', { verified });
  console.log('\u2705 Product verification response:', response.data);
  return response;
};

/**
 * Get all withdrawal requests
 */
export const getWithdrawals = async (params = {}) => {
  console.log('\ud83d\udcb0 Fetching withdrawals with params:', params);
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const response = await apiRequest(`/admin/withdrawals${queryString ? `?${queryString}` : ''}`, 'GET');
  console.log('\u2705 Withdrawals response:', response.data);
  return response;
};

/**
 * Get withdrawal summary statistics
 */
export const getWithdrawalSummary = async () => {
  console.log('\ud83d\udcca Fetching withdrawal summary...');
  const response = await apiRequest('/admin/withdrawals/summary', 'GET');
  console.log('\u2705 Withdrawal summary response:', response.data);
  return response;
};

/**
 * Approve a withdrawal request
 */
export const approveWithdrawal = async (withdrawalId) => {
  console.log('\u2705 Approving withdrawal:', withdrawalId);
  const response = await apiRequest(`/admin/withdrawals/${withdrawalId}/approve`, 'PATCH');
  console.log('\u2705 Approval response:', response.data);
  return response;
};

/**
 * Reject a withdrawal request
 */
export const rejectWithdrawal = async (withdrawalId, reason) => {
  console.log('\u274c Rejecting withdrawal:', withdrawalId);
  const response = await apiRequest(`/admin/withdrawals/${withdrawalId}/reject`, 'PATCH', { reason });
  console.log('\u2705 Rejection response:', response.data);
  return response;
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
