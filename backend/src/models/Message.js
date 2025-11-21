/**
 * Message Model
 * Represents individual messages in a conversation
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Conversation reference
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },

    // Sender
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Receiver
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Message content
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },

    // Message type
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },

    // Attachments (for future use)
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'file'],
        },
        url: String,
        filename: String,
        size: Number,
      },
    ],

    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Read timestamp
    readAt: {
      type: Date,
    },

    // Metadata
    metadata: {
      senderName: String,
      senderRole: String,
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Instance method: Mark as read
messageSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  }
  return this;
};

// Static method: Get unread count for user
messageSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    receiver: userId,
    isRead: false,
  });
};

// Static method: Mark all messages as read in a conversation
messageSchema.statics.markConversationAsRead = async function (conversationId, userId) {
  return await this.updateMany(
    {
      conversation: conversationId,
      receiver: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
