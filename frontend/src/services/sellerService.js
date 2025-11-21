/**
 * Seller Dashboard Service
 * API calls for seller/artisan dashboard
 */
import { apiRequest } from '../api/api';

/**
 * Get seller dashboard summary
 */
export const getSellerDashboard = async () => {
  console.log('📊 Fetching seller dashboard...');
  const response = await apiRequest('/seller/dashboard', 'GET');
  console.log('✅ Seller dashboard response:', response.data);
  return response;
};

/**
 * Get seller products
 */
export const getSellerProducts = async (params = {}) => {
  console.log('📦 Fetching seller products with params:', params);
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const response = await apiRequest(`/seller/products${queryString ? `?${queryString}` : ''}`, 'GET');
  console.log('✅ Seller products response:', response.data);
  return response;
};
