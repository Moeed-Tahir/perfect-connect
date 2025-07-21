const express = require('express');
const auPairController = require('../../controllers/v1/auPairController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post("/create-au-pair-profile", jwtMiddleware, auPairController.createAuPairProfile);

module.exports = router;
