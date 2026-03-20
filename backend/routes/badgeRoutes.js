const express = require("express");
const router = express.Router();

const badgeController = require("../controllers/badgeController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", badgeController.getAllBadges);
router.get("/mes-badges", authMiddleware, badgeController.getMyBadges);

module.exports = router;
