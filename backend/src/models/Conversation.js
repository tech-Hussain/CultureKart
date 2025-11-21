/**
 * Conversation Model
 * Represents a chat conversation between a buyer and seller about a product
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Buyer participant
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Seller/Artisan participant
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Artisan profile reference
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: true,
      index: true,
    },

    // Product being discussed (optional, can be general inquiry)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },

    // Last message preview
    lastMessage: {
      text: {
        type: String,
        default: '',
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },

    // Unread count for each participant
    unreadCount: {
      buyer: {
        type: Number,
        default: 0,
      },
      seller: {
        type: Number,
        default: 0,
      },
    },

    // Conversation status
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
      index: true,
    },

    // Metadata
    metadata: {
      buyerName: String,
      sellerName: String,
      productTitle: String,
      productImage: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding conversations between two users
conversationSchema.index({ buyer: 1, seller: 1 });
conversationSchema.index({ buyer: 1, artisan: 1 });
conversationSchema.index({ buyer: 1, product: 1 });

// Static method: Find or create conversation
conversationSchema.statics.findOrCreate = async function (buyerId, sellerId, artisanId, productId = null) {
  let conversation = await this.findOne({
    buyer: buyerId,
    seller: sellerId,
    artisan: artisanId,
    product: productId,
  });

  if (!conversation) {
    conversation = await this.create({
      buyer: buyerId,
      seller: sellerId,
      artisan: artisanId,
      product: productId,
    });
  }

  return conversation;
};

// Instance method: Mark as read for a user
conversationSchema.methods.markAsRead = async function (userRole) {
  if (userRole === 'buyer') {
    this.unreadCount.buyer = 0;
  } else if (userRole === 'seller') {
    this.unreadCount.seller = 0;
  }
  return await this.save();
};

// Instance method: Increment unread count
conversationSchema.methods.incrementUnread = async function (recipientRole) {
  if (recipientRole === 'buyer') {
    this.unreadCount.buyer += 1;
  } else if (recipientRole === 'seller') {
    this.unreadCount.seller += 1;
  }
  return await this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
