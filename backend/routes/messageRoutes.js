const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/conversations", authMiddleware, messageController.getConversationsList);
router.get("/contacts", authMiddleware, messageController.getContacts);
router.get("/:contactId", authMiddleware, messageController.getConversation);
router.post("/envoyer", authMiddleware, messageController.sendMessage);
router.put("/:id", authMiddleware, messageController.updateMsg);
router.put("/:id/retirer", authMiddleware, messageController.deleteForMe);
router.delete("/:id", authMiddleware, messageController.deleteForAll);

module.exports = router;
