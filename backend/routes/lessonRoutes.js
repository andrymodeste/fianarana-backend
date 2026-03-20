const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const prof = [authMiddleware, roleMiddleware("professeur")];

router.get("/cours/:coursId",   lessonController.getLessonsByCourse);
router.get("/:id",              authMiddleware, lessonController.getLessonById);
router.post("/create",          ...prof, upload.fields([{ name: "video", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), lessonController.createLesson);
router.put("/reordonner",       ...prof, lessonController.reorderLessons);
router.put("/:id",              ...prof, upload.fields([{ name: "video", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), lessonController.updateLesson);
router.delete("/:id",          ...prof, lessonController.deleteLesson);

module.exports = router;
