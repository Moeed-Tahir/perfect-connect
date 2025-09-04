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
      const user = await User.findById(userId);
      if (!user) {
        socket.emit("error", { message: "Invalid user ID" });
        return;
      }

      socket.userId = userId;
      socket.join(userId);
      userSockets.set(userId, socket.id);

      console.log(`User ${userId} authenticated and joined personal room`);

      socket.emit("authenticated", { userId });
    });

    // Join conversation between two users
    socket.on("joinConversation", async ({ userId, otherUserId }) => {
      const user1 = await User.findById(userId);
      const user2 = await User.findById(userId);

      if (!user1 || !user2) {
        socket.emit("error", { message: "Invalid user IDs" });
        return;
      }

      const conversationId = [userId, otherUserId].sort().join("_");
      socket.join(conversationId);
      socket.currentConversation = conversationId;

      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Leave conversation
    socket.on("leaveConversation", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(conversationId);
        socket.currentConversation = null;
        console.log(
          `User ${socket.userId} left conversation ${conversationId}`
        );
      }
    });

    // Send message (1-to-1)
    socket.on("sendMessage", async ({ sender, receiver, text }) => {
      try {
        if (!sender || !receiver || !text) {
          socket.emit("messageError", { error: "Missing required fields" });
          return;
        }
      const user1 = await User.findById(userId);
      const user2 = await User.findById(userId);

        if (user1 || user2) {
          socket.emit("messageError", { error: "Invalid user IDs" });
          return;
        }

        if (text.trim().length === 0) {
          socket.emit("messageError", { error: "Message cannot be empty" });
          return;
        }

        if (text.length > 1000) {
          socket.emit("messageError", { error: "Message too long" });
          return;
        }

        if (sender !== socket.userId) {
          socket.emit("messageError", { error: "Unauthorized" });
          return;
        }

        const conversationId = [sender, receiver].sort().join("_");

        const message = new Message({
          conversationId,
          sender,
          receiver,
          text: text.trim(),
        });
        await axios.post(`http://localhost:3000/api/chat/mark-read`, {
          senderId: sender,
          receiverId: receiver,
        });
        const savedMessage = await message.save();

        // Populate the saved message
        const populatedMessage = await Message.findById(savedMessage._id)
          .populate("sender", "email")
          .populate("receiver", "email");

        // Check if receiver is online
        const receiverSocketId = userSockets.get(receiver);
        const receiverOnline =
          receiverSocketId && io.sockets.sockets.get(receiverSocketId);

        // Mark as delivered if receiver is online
        if (receiverOnline) {
          await Message.findByIdAndUpdate(savedMessage._id, {
            delivered: true,
          });
          populatedMessage.delivered = true;
        }

        // Emit to conversation room
        io.to(conversationId).emit("newMessage", populatedMessage);

        // Send notification to receiver's personal room if they're not in the conversation
        if (receiverOnline) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          if (
            receiverSocket &&
            receiverSocket.currentConversation !== conversationId
          ) {
            io.to(receiver).emit("messageNotification", {
              from: sender,
              conversationId,
              message: text.trim(),
              timestamp: savedMessage.createdAt,
            });
          }
        }

        // Acknowledge to sender
        socket.emit("messageDelivered", {
          messageId: savedMessage._id,
          delivered: populatedMessage.delivered,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("markAsRead", async ({ senderId, receiverId }) => {
      try {
        if (!socket.userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Only allow receiver to mark messages as read
        if (socket.userId.toString() !== receiverId.toString()) {
          socket.emit("error", {
            message: "Unauthorized: only receiver can mark messages as read",
          });
          return;
        }

        const result = await Message.updateMany(
          { sender: senderId, receiver: receiverId, read: false },
          { $set: { read: true } }
        );

        if (result.modifiedCount > 0) {
          const conversationId = [senderId, receiverId].sort().join("_");

          // Notify participants in the conversation
          socket.to(conversationId).emit("messagesRead", {
            senderId,
            receiverId,
            count: result.modifiedCount,
          });

          // Confirm back to the receiver
          socket.emit("readReceiptConfirm", {
            senderId,
            receiverId,
            count: result.modifiedCount,
          });
        }
      } catch (error) {
        console.error("Error marking messages as read (socket):", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // User typing indicator
    socket.on("typing", ({ conversationId, isTyping }) => {
      if (!socket.userId || !conversationId) return;

      socket.to(conversationId).emit("userTyping", {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (socket.userId) {
        userSockets.delete(socket.userId);

        // Notify others that user went offline
        socket.broadcast.emit("userOffline", { userId: socket.userId });
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    for (const [userId, socketId] of userSockets.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        userSockets.delete(userId);
      }
    }
  }, 60000); // Clean up every minute
};
