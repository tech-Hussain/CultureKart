/**
 * Admin Withdrawal Service
 * API calls for admin withdrawal management
 */

import api from '../api/api';

/**
 * Get all pending withdrawal requests
 */
export const getPendingWithdrawals = async () => {
  const response = await api.get('/admin/withdrawals/pending');
  return response.data;
};

/**
 * Get all withdrawals with filters
 */
export const getAllWithdrawals = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/admin/withdrawals/all?${params}`);
  return response.data;
};

/**
 * Get specific withdrawal details
 */
export const getWithdrawalDetails = async (id) => {
  const response = await api.get(`/admin/withdrawals/${id}`);
  return response.data;
};

/**
 * Approve a withdrawal request
 */
export const approveWithdrawal = async (id, notes) => {
  const response = await api.post(`/admin/withdrawals/${id}/approve`, { notes });
  return response.data;
};

/**
 * Reject a withdrawal request
 */
export const rejectWithdrawal = async (id, reason, notes) => {
  const response = await api.post(`/admin/withdrawals/${id}/reject`, { reason, notes });
  return response.data;
};

/**
 * Get withdrawal statistics summary
 */
export const getWithdrawalStats = async () => {
  const response = await api.get('/admin/withdrawals/stats/summary');
  return response.data;
};
