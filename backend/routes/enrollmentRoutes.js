const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/inscrire", authMiddleware, enrollmentController.enrollUser);
router.get("/mes-cours", authMiddleware, enrollmentController.getMyCourses);

module.exports = router;
