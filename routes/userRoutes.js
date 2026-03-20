const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/profil",              authMiddleware, userController.getProfile);
router.put("/profil",              authMiddleware, upload.single("photo"), userController.updateProfile);
router.put("/changer-mot-de-passe", authMiddleware, userController.changePassword);
router.delete("/supprimer-compte", authMiddleware, userController.deleteAccount);

module.exports = router;
