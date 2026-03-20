const express = require("express");
const router = express.Router();

const categorieController = require("../controllers/categorieController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ── Catégories ──
router.get("/", categorieController.getAllCategories);
router.get("/matieres", categorieController.getAllMatieres);
router.get("/:id", categorieController.getCategorieById);
router.get("/:categorieId/matieres", categorieController.getMatieresByCategorie);
router.post("/", authMiddleware, roleMiddleware("admin"), categorieController.createCategorie);
router.put("/:id", authMiddleware, roleMiddleware("admin"), categorieController.updateCategorie);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), categorieController.deleteCategorie);

// ── Matières ──
router.get("/matiere/:id", categorieController.getMatiereById);
router.post("/matieres", authMiddleware, roleMiddleware("admin"), categorieController.createMatiere);
router.put("/matiere/:id", authMiddleware, roleMiddleware("admin"), categorieController.updateMatiere);
router.delete("/matiere/:id", authMiddleware, roleMiddleware("admin"), categorieController.deleteMatiere);

module.exports = router;
