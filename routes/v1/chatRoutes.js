const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/v1/chatMessageController');

router.get('/history/:user1/:user2', chatController.getChatHistory);
router.post('/mark-read', chatController.markAsRead);
router.post('/mark-delivered', chatController.markAsDelivered);

module.exports = router;