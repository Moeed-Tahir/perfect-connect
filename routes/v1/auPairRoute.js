const express = require('express');
const auPairController = require('../../controllers/v1/auPairController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post("/create-au-pair-profile", auPairController.createAuPairProfile);
router.post("/uploadTestImageToS3",jwtMiddleware, auPairController.uploadTestImageToS3);
router.post("/getAllAuPair", jwtMiddleware, auPairController.getAllAuPair);
router.post("/pauseAuFamily", jwtMiddleware, auPairController.pauseAuFamily);
router.post("/unpauseAuFamily", jwtMiddleware, auPairController.unpauseAuFamily);
router.post("/likeAuPairProfile", jwtMiddleware, auPairController.likeAuPairProfile);

module.exports = router;
