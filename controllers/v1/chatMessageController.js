const Message = require('../../models/ChatMessage.model');
const mongoose = require('mongoose');

exports.getChatHistory = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { page = 1, limit = 50 } = req.query; // Add pagination
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user IDs'
      });
    }

    const conversationId = [user1, user2].sort().join('_');
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Latest first for pagination
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');

    // Reverse to get chronological order
    messages.reverse();

    const totalMessages = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid senderId or receiverId'
      });
    }

    // Update all unread messages sent from sender → receiver
    const result = await Message.updateMany(
      { sender: receiverId, receiver: senderId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
};

exports.markAsDelivered = async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message IDs'
      });
    }

    const validIds = messageIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    const result = await Message.updateMany(
      { _id: { $in: validIds }, delivered: false },
      { $set: { delivered: true } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as delivered`
    });
  } catch (error) {
    console.error('Mark as delivered error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as delivered'
    });
  }
};