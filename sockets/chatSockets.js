const Message = require('../models/ChatMessage.model');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('joinConversation', ({ conversationId, userId }) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { sender, receiver, text } = data;
        
        const conversationId = [sender, receiver].sort().join('_');
        
        const message = new Message({
          sender,
          receiver,
          text
        });
        
        const savedMessage = await message.save()
          .then(m => m.populate('sender', 'name profilePicture'))
          .then(m => m.populate('receiver', 'name profilePicture'));

        io.to(conversationId).emit('newMessage', savedMessage);

        socket.broadcast.to(receiver).emit('messageNotification', {
          from: sender,
          message: text
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};