const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/lecon/:leconId", authMiddleware, quizController.getQuizByLecon);
router.get("/:quizId", authMiddleware, quizController.getQuizWithQuestions);
router.post("/create", authMiddleware, roleMiddleware("professeur"), quizController.createQuiz);
router.post("/question", authMiddleware, roleMiddleware("professeur"), quizController.addQuestion);
router.post("/soumettre", authMiddleware, quizController.submitQuiz);

module.exports = router;
