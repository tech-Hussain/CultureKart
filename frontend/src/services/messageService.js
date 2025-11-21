/**
 * Messages Service
 * API calls for messaging system
 */
import { apiRequest } from '../api/api';

/**
 * Start or get conversation
 */
export const startConversation = async (artisanId, productId = null) => {
  console.log('💬 Starting conversation with artisan:', artisanId);
  const response = await apiRequest('/messages/conversations', 'POST', {
    artisanId,
    productId,
  });
  console.log('✅ Conversation response:', response.data);
  return response;
};

/**
 * Get all conversations
 */
export const getConversations = async (status = 'active') => {
  console.log('📋 Fetching conversations...');
  const response = await apiRequest(`/messages/conversations?status=${status}`, 'GET');
  console.log('✅ Conversations response:', response.data);
  return response;
};

/**
 * Get conversation with messages
 */
export const getConversation = async (conversationId, page = 1, limit = 50) => {
  console.log(`💬 Fetching conversation ${conversationId}...`);
  const response = await apiRequest(
    `/messages/conversations/${conversationId}?page=${page}&limit=${limit}`,
    'GET'
  );
  console.log('✅ Conversation messages response:', response.data);
  return response;
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId, content) => {
  console.log('📤 Sending message...');
  const response = await apiRequest('/messages', 'POST', {
    conversationId,
    content,
  });
  console.log('✅ Message sent:', response.data);
  return response;
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId) => {
  const response = await apiRequest(`/messages/${messageId}/read`, 'PATCH');
  return response;
};

/**
 * Get unread count
 */
export const getUnreadCount = async () => {
  const response = await apiRequest('/messages/unread-count', 'GET');
  return response;
};
