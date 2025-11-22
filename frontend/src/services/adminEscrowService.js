import api from '../api/api';

const adminEscrowService = {
  /**
   * Get pending escrow orders (delivered but not released)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Pending escrow data
   */
  getPendingEscrow: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/escrow/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get released escrow history
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Released escrow data
   */
  getReleasedEscrow: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/escrow/released?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Release escrow for a single order
   * @param {string} orderId - Order ID
   * @param {string} notes - Admin notes (optional)
   * @returns {Promise<Object>} Release result
   */
  releaseEscrow: async (orderId, notes = '') => {
    const response = await api.post(`/admin/escrow/${orderId}/release`, { notes });
    return response.data;
  },

  /**
   * Bulk release escrow for multiple orders
   * @param {Array<string>} orderIds - Array of order IDs
   * @param {string} notes - Admin notes (optional)
   * @returns {Promise<Object>} Bulk release results
   */
  bulkReleaseEscrow: async (orderIds, notes = '') => {
    const response = await api.post('/admin/escrow/bulk-release', { orderIds, notes });
    return response.data;
  },

  /**
   * Get escrow statistics
   * @returns {Promise<Object>} Statistics data
   */
  getEscrowStats: async () => {
    const response = await api.get('/admin/escrow/stats');
    return response.data;
  },
};

export default adminEscrowService;
