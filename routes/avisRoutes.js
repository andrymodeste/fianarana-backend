const express = require("express");
const router = express.Router();
const avisController = require("../controllers/avisController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/cours/:coursId", avisController.getAvisByCours);
router.post("/",              authMiddleware, avisController.createAvis);
router.put("/:id",            authMiddleware, avisController.updateAvis);
router.delete("/:id",        authMiddleware, avisController.deleteAvis);

module.exports = router;
