const express = require("express");
const router = express.Router();

const niveauController = require("../controllers/niveauController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", niveauController.getAllNiveaux);
router.get("/:id", niveauController.getNiveauById);
router.post("/", authMiddleware, roleMiddleware("admin"), niveauController.createNiveau);
router.put("/:id", authMiddleware, roleMiddleware("admin"), niveauController.updateNiveau);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), niveauController.deleteNiveau);

module.exports = router;
