const express = require("express");
const router = express.Router();

const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/souscrire", authMiddleware, subscriptionController.subscribe);
router.get("/mon-abonnement", authMiddleware, subscriptionController.getMySubscription);

module.exports = router;
