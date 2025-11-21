/**
 * Messages Routes
 * Handle messaging between buyers and sellers
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Middleware to fetch database user
router.use(async (req, res, next) => {
  try {
    let dbUser;
    
    if (req.user.authProvider === 'firebase-oauth') {
      // Firebase user - lookup by firebaseUid
      dbUser = await User.findOne({ firebaseUid: req.user.uid });
    } else if (req.user.authProvider === 'email-password') {
      // Email/password user - lookup by userId
      dbUser = await User.findById(req.user.userId);
    }

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database',
      });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Error fetching database user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
});

/**
 * POST /api/v1/messages/conversations
 * Start or get existing conversation
 */
router.post(
  '/conversations',
  [
    body('artisanId').isMongoId().withMessage('Valid artisan ID is required'),
    body('productId').optional().isMongoId().withMessage('Invalid product ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { artisanId, productId } = req.body;
      const buyerId = req.dbUser._id;

      // Get artisan and seller info
      const artisan = await Artisan.findById(artisanId).populate('user');
      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan not found',
        });
      }

      const sellerId = artisan.user._id;

      // Prevent messaging yourself
      if (buyerId.toString() === sellerId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot message yourself',
        });
      }

      // Get product info if provided
      let product = null;
      if (productId) {
        product = await Product.findById(productId);
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        buyer: buyerId,
        seller: sellerId,
        artisan: artisanId,
        product: productId || null,
      });

      if (!conversation) {
        const buyer = await User.findById(buyerId);
        
        conversation = await Conversation.create({
          buyer: buyerId,
          seller: sellerId,
          artisan: artisanId,
          product: productId || null,
          metadata: {
            buyerName: buyer.name,
            sellerName: artisan.displayName,
            productTitle: product?.title || '',
            productImage: product?.images?.[0] || '',
          },
        });

        console.log(`✅ New conversation created: ${conversation._id}`);
      }

      // Populate conversation details
      await conversation.populate([
        { path: 'buyer', select: 'name email' },
        { path: 'seller', select: 'name email' },
        { path: 'artisan', select: 'displayName' },
        { path: 'product', select: 'title images price' },
      ]);

      return res.status(200).json({
        success: true,
        data: { conversation },
      });
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/messages/conversations
 * Get all conversations for current user
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.dbUser._id;
    const { status = 'active' } = req.query;

    // Check if user is an artisan
    const artisan = await Artisan.findByUser(userId);
    const isArtisan = !!artisan;

    const filter = { status };
    if (isArtisan) {
      filter.seller = userId;
    } else {
      filter.buyer = userId;
    }

    const conversations = await Conversation.find(filter)
      .populate({ path: 'buyer', select: 'name email' })
      .populate({ path: 'seller', select: 'name email' })
      .populate({ path: 'artisan', select: 'displayName' })
      .populate({ path: 'product', select: 'title images price' })
      .sort({ 'lastMessage.timestamp': -1 })
      .lean();

    // Get total unread count
    const unreadCount = conversations.reduce((sum, conv) => {
      if (isArtisan) {
        return sum + (conv.unreadCount?.seller || 0);
      } else {
        return sum + (conv.unreadCount?.buyer || 0);
      }
    }, 0);

    return res.status(200).json({
      success: true,
      results: conversations.length,
      unreadCount,
      data: { conversations },
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/messages/conversations/:id
 * Get specific conversation with messages
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser._id;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(id)
      .populate({ path: 'buyer', select: 'name email' })
      .populate({ path: 'seller', select: 'name email' })
      .populate({ path: 'artisan', select: 'displayName' })
      .populate({ path: 'product', select: 'title images price category' });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is participant
    if (
      conversation.buyer._id.toString() !== userId.toString() &&
      conversation.seller._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get messages with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [messages, totalMessages] = await Promise.all([
      Message.find({ conversation: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate({ path: 'sender', select: 'name email' })
        .lean(),
      Message.countDocuments({ conversation: id }),
    ]);

    // Mark messages as read
    const artisan = await Artisan.findByUser(userId);
    const userRole = artisan ? 'seller' : 'buyer';
    
    await Message.markConversationAsRead(id, userId);
    await conversation.markAsRead(userRole);

    return res.status(200).json({
      success: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / parseInt(limit)),
      },
      data: {
        conversation,
        messages: messages.reverse(), // Reverse to show oldest first
      },
    });
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/messages
 * Send a message
 */
router.post(
  '/',
  [
    body('conversationId').isMongoId().withMessage('Valid conversation ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required')
      .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { conversationId, content } = req.body;
      const senderId = req.dbUser._id;

      // Get conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      // Verify user is participant
      if (
        conversation.buyer.toString() !== senderId.toString() &&
        conversation.seller.toString() !== senderId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      // Determine receiver and roles
      const receiverId =
        conversation.buyer.toString() === senderId.toString()
          ? conversation.seller
          : conversation.buyer;

      const artisan = await Artisan.findByUser(senderId);
      const senderRole = artisan ? 'seller' : 'buyer';
      const receiverRole = senderRole === 'buyer' ? 'seller' : 'buyer';

      // Create message
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        receiver: receiverId,
        content: content.trim(),
        type: 'text',
        metadata: {
          senderName: req.dbUser.name,
          senderRole: senderRole,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
        },
      });

      // Update conversation
      conversation.lastMessage = {
        text: content.trim().substring(0, 100),
        sender: senderId,
        timestamp: new Date(),
      };
      await conversation.incrementUnread(receiverRole);

      // Populate message sender
      await message.populate({ path: 'sender', select: 'name email' });

      console.log(`💬 Message sent in conversation ${conversationId}`);

      // TODO: Emit socket event for real-time delivery
      // io.to(conversationId).emit('new-message', message);

      return res.status(201).json({
        success: true,
        data: { message },
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message,
      });
    }
  }
);

/**
 * PATCH /api/v1/messages/:id/read
 * Mark message as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Verify user is receiver
    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await message.markAsRead();

    return res.status(200).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/messages/unread-count
 * Get unread message count
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.dbUser._id;
    const unreadCount = await Message.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
});

module.exports = router;
