const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/v1/feedbackUsersController');

router.post('/createFeedback', feedbackController.sendFeedback);
router.post('/getAllFeedback', feedbackController.getAllFeedback);

module.exports = router;