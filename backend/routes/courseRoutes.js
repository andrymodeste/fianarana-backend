const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const prof = [authMiddleware, roleMiddleware("professeur")];

router.get("/",         courseController.getAllCourses);
router.get("/mes-cours", ...prof, courseController.getMyCourses);
router.get("/:id",      courseController.getCourseById);
router.get("/:coursId/lecons", lessonController.getLessonsByCourse);

router.post("/create",    ...prof, upload.single("image"), courseController.createCourse);
router.put("/:id",        ...prof, upload.single("image"), courseController.updateCourse);
router.delete("/:id",     ...prof, courseController.deleteCourse);
router.put("/:id/soumettre", ...prof, courseController.submitCourse);
router.put("/:id/archiver",  ...prof, courseController.archiveCourse);

module.exports = router;
