const express = require('express');
const router = express.Router();
const connectionUserController = require('../../controllers/v1/connectionUsersController');

router.post('/addConnection', connectionUserController.addConnection);
router.post('/removeConnection', connectionUserController.removeConnection);
router.post('/getCommonalities', connectionUserController.getCommonalities);

module.exports = router;