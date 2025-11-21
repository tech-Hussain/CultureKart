/**
 * Withdrawal Service
 * API calls for artisan withdrawal management
 */
import { apiRequest } from '../api/api';

/**
 * Create a new withdrawal request
 * @param {Object} withdrawalData - Withdrawal request data
 * @returns {Promise} API response
 */
export const createWithdrawal = async (withdrawalData) => {
  return apiRequest('/artisan/withdrawals', 'POST', withdrawalData);
};

/**
 * Get all withdrawals for the artisan
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getWithdrawals = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/artisan/withdrawals${queryString ? `?${queryString}` : ''}`, 'GET');
};

/**
 * Get specific withdrawal details
 * @param {string} withdrawalId - Withdrawal ID
 * @returns {Promise} API response
 */
export const getWithdrawalById = async (withdrawalId) => {
  return apiRequest(`/artisan/withdrawals/${withdrawalId}`, 'GET');
};

/**
 * Get available balance for withdrawal
 * @returns {Promise} API response
 */
export const getAvailableBalance = async () => {
  return apiRequest('/artisan/withdrawals/balance/available', 'GET');
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
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[status] || colors.pending;
};

/**
 * Get status icon
 */
export const getStatusIcon = (status) => {
  const icons = {
    pending: '🟡',
    processing: '🔵',
    completed: '✅',
    failed: '❌',
    cancelled: '⚫',
  };
  return icons[status] || '⚪';
};
