const Message = require('../../models/ChatMessage.model');
const mongoose = require('mongoose');

exports.getChatHistory = async (req, res) => {
  try {
    console.log('Fetching chat history...');
    const { user1, user2 } = req.params;
    const { page = 1, limit = 50 } = req.query; // Add pagination
    
    console.log(`Request parameters: user1=${user1}, user2=${user2}, page=${page}, limit=${limit}`);
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
      console.log('Invalid user IDs provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid user IDs'
      });
    }

    const conversationId = [user1, user2].sort().join('_');
    const skip = (page - 1) * limit;
    
    console.log(`Conversation ID: ${conversationId}, Skip: ${skip}`);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Latest first for pagination
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');

    // Reverse to get chronological order
    messages.reverse();
    
    console.log(`Found ${messages.length} messages`);

    const totalMessages = await Message.countDocuments({ conversationId });
    
    console.log(`Total messages in conversation: ${totalMessages}`);

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
    
    console.log('Chat history fetched successfully');
  } catch (error) {
    console.error('Get chat history error:', error);
    console.log(`Error details: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    console.log('Marking messages as read...');
    const { senderId, receiverId } = req.body;
    
    console.log(`Request body: senderId=${senderId}, receiverId=${receiverId}`);

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      console.log('Invalid senderId or receiverId provided');
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
    
    console.log(`Marked ${result.modifiedCount} messages as read`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`
    });
    
    console.log('Messages marked as read successfully');
  } catch (error) {
    console.error('Mark as read error:', error);
    console.log(`Error details: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
};

exports.markAsDelivered = async (req, res) => {
  try {
    console.log('Marking messages as delivered...');
    const { messageIds } = req.body;
    
    console.log(`Request body: messageIds=${JSON.stringify(messageIds)}`);

    if (!messageIds || !Array.isArray(messageIds)) {
      console.log('Invalid message IDs provided');
      return res.status(400).json({
        success: false,
        error: 'Invalid message IDs'
      });
    }

    const validIds = messageIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    console.log(`Valid message IDs: ${JSON.stringify(validIds)}`);
    
    const result = await Message.updateMany(
      { _id: { $in: validIds }, delivered: false },
      { $set: { delivered: true } }
    );
    
    console.log(`Marked ${result.modifiedCount} messages as delivered`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as delivered`
    });
    
    console.log('Messages marked as delivered successfully');
  } catch (error) {
    console.error('Mark as delivered error:', error);
    console.log(`Error details: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as delivered'
    });
  }
};