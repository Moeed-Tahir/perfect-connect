const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/v1/likeUsersController');

router.post('/addLike', likeController.createLike);
router.post('/getLikesByReporter', likeController.getLikesByReporter);

module.exports = router;