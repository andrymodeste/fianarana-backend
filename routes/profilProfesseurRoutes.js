const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profilProfesseurController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const profVerified = require("../middleware/professorVerifiedMiddleware");

// Profil : accessible même non vérifié (pour compléter le profil)
router.get("/mon-profil",                authMiddleware, roleMiddleware("professeur"), ctrl.getMyProfil);
router.put("/mon-profil",                authMiddleware, roleMiddleware("professeur"), ctrl.updateProfil);
// Actions : nécessitent la vérification
router.get("/mes-eleves",               authMiddleware, roleMiddleware("professeur"), profVerified, ctrl.getStudentStats);
router.get("/cours/:coursId/stats",      authMiddleware, roleMiddleware("professeur"), profVerified, ctrl.getCourseStats);
router.get("/:id",                       ctrl.getPublicProfil);

module.exports = router;
