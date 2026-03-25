const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const avisController = require("../controllers/avisController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const admin = [authMiddleware, roleMiddleware("admin")];

// Users
router.get("/utilisateurs",              ...admin, adminController.getAllUsers);
router.get("/utilisateurs/:id",          ...admin, adminController.getUserById);
router.put("/utilisateurs/:id/actif",    ...admin, adminController.toggleUserActive);
router.put("/utilisateurs/:id/role",     ...admin, adminController.changeUserRole);
router.delete("/utilisateurs/:id",       ...admin, adminController.deleteUser);

// Teachers
router.get("/professeurs/en-attente",    ...admin, adminController.getProfesseursEnAttente);
router.put("/professeurs/:id/valider",   ...admin, adminController.validateProfesseur);

// Courses
router.get("/cours/en-attente",          ...admin, adminController.getPendingCourses);
router.put("/cours/:id/valider",         ...admin, adminController.validateCourse);

// Lessons
router.get("/lecons/en-attente",         ...admin, adminController.getPendingLessons);
router.put("/lecons/:id/valider",        ...admin, adminController.validateLesson);

// Stats
router.get("/dashboard",                 ...admin, adminController.getDashboardStats);

// Payments
router.get("/paiements",                 ...admin, adminController.getAllPayments);

// Notifications
router.post("/notifications/bulk",       ...admin, adminController.sendBulkNotification);

// Avis moderation
router.get("/avis",                      ...admin, avisController.getAllAvis);
router.put("/avis/:id/masquer",          ...admin, avisController.adminHideAvis);
router.put("/avis/:id/afficher",         ...admin, avisController.adminShowAvis);
router.delete("/avis/:id",              ...admin, avisController.adminDeleteAvis);

module.exports = router;
