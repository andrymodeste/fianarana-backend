const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/conversations", authMiddleware, messageController.getConversationsList);
router.get("/:contactId", authMiddleware, messageController.getConversation);
router.post("/envoyer", authMiddleware, messageController.sendMessage);

module.exports = router;
