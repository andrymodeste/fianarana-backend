const express = require("express");
const router = express.Router();

const lessonProgressController = require("../controllers/lessonProgressController");
const authMiddleware = require("../middleware/authMiddleware");

router.put("/update", authMiddleware, lessonProgressController.updateProgress);
router.get("/cours/:coursId", authMiddleware, lessonProgressController.getCourseProgress);

module.exports = router;
