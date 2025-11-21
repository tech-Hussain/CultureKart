/**
 * Buyer Messages Page
 * View and manage conversations with sellers
 */
import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import {
  getConversations,
  getConversation,
  sendMessage,
} from '../services/messageService';
import Swal from 'sweetalert2';

function BuyerMessages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    console.log('🔄 BuyerMessages component mounted, fetching conversations...');
    fetchConversations();
    
    // Poll for new messages every 3 seconds
    pollingRef.current = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation._id, true);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      console.log('📥 Fetching conversations...');
      setLoading(true);
      const response = await getConversations();
      console.log('📨 Conversations response:', response);
      setConversations(response.data.data?.conversations || []);
      console.log('💬 Conversations set:', response.data.data?.conversations?.length || 0);
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await getConversation(conversationId);
      setMessages(response.data.data?.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (!silent) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load messages',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    await fetchMessages(conv._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      await sendMessage(selectedConversation._id, messageText.trim());
      
      setMessageText('');
      await fetchMessages(selectedConversation._id, true);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send message. Please try again.',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return null;
    const img = images[0];
    let url = typeof img === 'string' ? img : img.url || img.path;
    if (url?.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    if (url?.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
    }
    return url;
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Messages</h1>

        {loading && !selectedConversation ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex h-[calc(100vh-16rem)]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Conversations</h3>
              </div>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Start a conversation with a seller</p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {conv.product?.images?.[0] && (
                          <img
                            src={getImageUrl(conv.product.images)}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-800 truncate">
                              {conv.artisan?.displayName || conv.seller?.name || 'Seller'}
                            </p>
                            {conv.unreadCount?.buyer > 0 && (
                              <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                {conv.unreadCount.buyer}
                              </span>
                            )}
                          </div>
                          {conv.product && (
                            <p className="text-xs text-gray-500 truncate mb-1">
                              Re: {conv.product.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage?.text || 'No messages yet'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {conv.lastMessage?.timestamp
                              ? formatRelativeTime(conv.lastMessage.timestamp)
                              : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <h3 className="font-semibold">
                      {selectedConversation.artisan?.displayName || 'Seller'}
                    </h3>
                    {selectedConversation.product && (
                      <p className="text-sm opacity-90">
                        Inquiry about: {selectedConversation.product.title}
                      </p>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.metadata?.senderRole === 'buyer' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.metadata?.senderRole === 'buyer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 shadow'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-75">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={2000}
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || sendingMessage}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-6xl mb-4">💬</p>
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerMessages;
