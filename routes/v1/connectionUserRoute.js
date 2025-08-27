const express = require('express');
const router = express.Router();
const connectionUserController = require('../../controllers/v1/connectionUsersController');

router.post('/getAllConnections', connectionUserController.getAllConnections);

module.exports = router;