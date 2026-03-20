const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profilProfesseurController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/mon-profil",                authMiddleware, roleMiddleware("professeur"), ctrl.getMyProfil);
router.put("/mon-profil",                authMiddleware, roleMiddleware("professeur"), ctrl.updateProfil);
router.get("/mes-eleves",               authMiddleware, roleMiddleware("professeur"), ctrl.getStudentStats);
router.get("/cours/:coursId/stats",      authMiddleware, roleMiddleware("professeur"), ctrl.getCourseStats);
router.get("/:id",                       ctrl.getPublicProfil);

module.exports = router;
