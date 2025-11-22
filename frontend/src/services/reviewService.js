/**
 * Review Service
 * Handle review API requests
 */

import api from '../api/api';

// Create a new review
export const createReview = async (reviewData) => {
  console.log('⭐ Creating review:', reviewData);
  const response = await api.post('/reviews', reviewData);
  console.log('✅ Review created:', response);
  return response;
};

// Get reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  const { page = 1, limit = 10, sort = 'recent' } = params;
  console.log(`📚 Fetching reviews for product ${productId}`);
  const response = await api.get(
    `/reviews/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`
  );
  console.log('✅ Reviews fetched:', response);
  return response;
};

// Check if user can review products in an order
export const checkCanReview = async (orderId) => {
  console.log(`🔍 Checking review status for order ${orderId}`);
  const response = await api.get(`/reviews/order/${orderId}/can-review`);
  console.log('✅ Review status:', response);
  return response;
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  console.log(`👍 Marking review ${reviewId} as helpful`);
  const response = await api.patch(`/reviews/${reviewId}/helpful`);
  console.log('✅ Review marked helpful:', response);
  return response;
};

export default {
  createReview,
  getProductReviews,
  checkCanReview,
  markReviewHelpful,
};
