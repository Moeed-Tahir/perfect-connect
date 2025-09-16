const Message = require("../models/ChatMessage.model");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const axios = require("axios");
const userSockets = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // User authentication and room joining
    socket.on("authenticate", async (userId) => {
      try {
        console.log(`Authentication attempt for user: ${userId}`);
        const user = await User.findById(userId);
        if (!user) {
          console.log(`Authentication failed: Invalid user ID ${userId}`);
          socket.emit("error", { message: "Invalid user ID" });
          return;
        }

        socket.userId = userId;
        socket.join(userId);
        userSockets.set(userId, socket.id);

        console.log(`User ${userId} authenticated and joined personal room`);
        socket.emit("authenticated", { userId });
      } catch (error) {
        console.error('Authentication error:', error);
        console.log(`Error details: ${error.message}`);
        socket.emit("error", { message: "Authentication failed" });
      }
    });

    // Join conversation between two users
    socket.on("joinConversation", async ({ userId, otherUserId }) => {
      try {
        console.log(`Join conversation request: userId=${userId}, otherUserId=${otherUserId}`);
        const user1 = await User.findById(userId);
        const user2 = await User.findById(otherUserId); // Fixed: should be otherUserId

        if (!user1 || !user2) {
          console.log(`Invalid user IDs: ${userId} or ${otherUserId}`);
          socket.emit("error", { message: "Invalid user IDs" });
          return;
        }

        const conversationId = [userId, otherUserId].sort().join("_");
        socket.join(conversationId);
        socket.currentConversation = conversationId;

        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Join conversation error:', error);
        console.log(`Error details: ${error.message}`);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Leave conversation
    socket.on("leaveConversation", ({ conversationId }) => {
      try {
        console.log(`Leave conversation request: conversationId=${conversationId}, userId=${socket.userId}`);
        if (conversationId) {
          socket.leave(conversationId);
          socket.currentConversation = null;
          console.log(`User ${socket.userId} left conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Leave conversation error:', error);
        console.log(`Error details: ${error.message}`);
      }
    });

    // Send message (1-to-1)
    socket.on("sendMessage", async ({ sender, receiver, text }) => {
      try {
        console.log(`Send message request: sender=${sender}, receiver=${receiver}, text=${text}`);
        
        if (!sender || !receiver || !text) {
          console.log('Missing required fields for message');
          socket.emit("messageError", { error: "Missing required fields" });
          return;
        }
        
        const user1 = await User.findById(sender); // Fixed: should be sender
        const user2 = await User.findById(receiver); // Fixed: should be receiver

        if (!user1 || !user2) { // Fixed: condition should check if users don't exist
          console.log(`Invalid user IDs: sender=${sender}, receiver=${receiver}`);
          socket.emit("messageError", { error: "Invalid user IDs" });
          return;
        }

        if (text.trim().length === 0) {
          console.log('Empty message received');
          socket.emit("messageError", { error: "Message cannot be empty" });
          return;
        }

        if (text.length > 1000) {
          console.log('Message too long');
          socket.emit("messageError", { error: "Message too long" });
          return;
        }

        if (sender !== socket.userId) {
          console.log(`Unauthorized message attempt: socket userId=${socket.userId}, sender=${sender}`);
          socket.emit("messageError", { error: "Unauthorized" });
          return;
        }

        const conversationId = [sender, receiver].sort().join("_");
        console.log(`Creating message for conversation: ${conversationId}`);

        const message = new Message({
          conversationId,
          sender,
          receiver,
          text: text.trim(),
        });
        
        console.log('Calling mark-read API');
        await axios.post(`http://localhost:3000/api/chat/mark-read`, {
          senderId: sender,
          receiverId: receiver,
        });
        
        const savedMessage = await message.save();
        console.log(`Message saved with ID: ${savedMessage._id}`);

        // Populate the saved message
        const populatedMessage = await Message.findById(savedMessage._id)
          .populate("sender", "email")
          .populate("receiver", "email");

        // Check if receiver is online
        const receiverSocketId = userSockets.get(receiver);
        const receiverOnline =
          receiverSocketId && io.sockets.sockets.get(receiverSocketId);

        console.log(`Receiver online status: ${receiverOnline}`);

        // Mark as delivered if receiver is online
        if (receiverOnline) {
          console.log('Marking message as delivered');
          await Message.findByIdAndUpdate(savedMessage._id, {
            delivered: true,
          });
          populatedMessage.delivered = true;
        }

        // Emit to conversation room
        console.log(`Emitting newMessage to conversation: ${conversationId}`);
        io.to(conversationId).emit("newMessage", populatedMessage);

        // Send notification to receiver's personal room if they're not in the conversation
        if (receiverOnline) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          if (
            receiverSocket &&
            receiverSocket.currentConversation !== conversationId
          ) {
            console.log(`Sending notification to receiver: ${receiver}`);
            io.to(receiver).emit("messageNotification", {
              from: sender,
              conversationId,
              message: text.trim(),
              timestamp: savedMessage.createdAt,
            });
          }
        }

        // Acknowledge to sender
        console.log(`Sending delivery confirmation to sender: ${sender}`);
        socket.emit("messageDelivered", {
          messageId: savedMessage._id,
          delivered: populatedMessage.delivered,
        });
        
        console.log('Message sent successfully');
      } catch (error) {
        console.error("Error sending message:", error);
        console.log(`Error details: ${error.message}`);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("markAsRead", async ({ senderId, receiverId }) => {
      try {
        console.log(`Mark as read request: senderId=${senderId}, receiverId=${receiverId}`);
        
        if (!socket.userId) {
          console.log('Not authenticated for mark as read');
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Only allow receiver to mark messages as read
        if (socket.userId.toString() !== receiverId.toString()) {
          console.log(`Unauthorized mark as read attempt: socket userId=${socket.userId}, receiverId=${receiverId}`);
          socket.emit("error", {
            message: "Unauthorized: only receiver can mark messages as read",
          });
          return;
        }

        const result = await Message.updateMany(
          { sender: senderId, receiver: receiverId, read: false },
          { $set: { read: true } }
        );

        console.log(`Marked ${result.modifiedCount} messages as read`);

        if (result.modifiedCount > 0) {
          const conversationId = [senderId, receiverId].sort().join("_");

          // Notify participants in the conversation
          console.log(`Notifying participants of read messages in conversation: ${conversationId}`);
          socket.to(conversationId).emit("messagesRead", {
            senderId,
            receiverId,
            count: result.modifiedCount,
          });

          // Confirm back to the receiver
          console.log(`Sending read receipt confirmation to receiver: ${receiverId}`);
          socket.emit("readReceiptConfirm", {
            senderId,
            receiverId,
            count: result.modifiedCount,
          });
        } else {
          console.log('No messages to mark as read');
        }
      } catch (error) {
        console.error("Error marking messages as read (socket):", error);
        console.log(`Error details: ${error.message}`);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // User typing indicator
    socket.on("typing", ({ conversationId, isTyping }) => {
      try {
        console.log(`Typing indicator: conversationId=${conversationId}, isTyping=${isTyping}, userId=${socket.userId}`);
        
        if (!socket.userId || !conversationId) {
          console.log('Missing userId or conversationId for typing indicator');
          return;
        }

        socket.to(conversationId).emit("userTyping", {
          userId: socket.userId,
          isTyping,
        });
        
        console.log('Typing indicator sent successfully');
      } catch (error) {
        console.error("Error handling typing indicator:", error);
        console.log(`Error details: ${error.message}`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      try {
        console.log(`Client disconnected: ${socket.id}`);

        if (socket.userId) {
          userSockets.delete(socket.userId);

          // Notify others that user went offline
          console.log(`Notifying others that user went offline: ${socket.userId}`);
          socket.broadcast.emit("userOffline", { userId: socket.userId });
        }
      } catch (error) {
        console.error("Error during disconnect:", error);
        console.log(`Error details: ${error.message}`);
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
      console.log(`Error details: ${error.message}`);
    });
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    try {
      console.log('Running socket cleanup');
      for (const [userId, socketId] of userSockets.entries()) {
        const socket = io.sockets.sockets.get(socketId);
        if (!socket || !socket.connected) {
          console.log(`Removing disconnected socket: ${socketId} for user: ${userId}`);
          userSockets.delete(userId);
        }
      }
    } catch (error) {
      console.error("Error during socket cleanup:", error);
      console.log(`Error details: ${error.message}`);
    }
  }, 60000); // Clean up every minute
};