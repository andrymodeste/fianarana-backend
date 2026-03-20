const express = require("express");
const router = express.Router();

const certificatController = require("../controllers/certificatController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/mes-certificats", authMiddleware, certificatController.getMyCertificats);
router.get("/verifier/:code", certificatController.verifyCertificat);

module.exports = router;
