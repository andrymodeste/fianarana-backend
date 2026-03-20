const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/",                authMiddleware, notificationController.getMyNotifications);
router.put("/toutes-lues",     authMiddleware, notificationController.markAllAsRead);
router.put("/:id/lue",         authMiddleware, notificationController.markAsRead);
router.delete("/:id",         authMiddleware, notificationController.deleteNotification);

module.exports = router;
