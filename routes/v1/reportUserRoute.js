const express = require('express');
const reportUserController = require('../../controllers/v1/reportUserController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post("/report-user", jwtMiddleware, reportUserController.reportUser);

module.exports = router;