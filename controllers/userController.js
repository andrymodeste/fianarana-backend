const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const getProfile = (req, res) => {
    userModel.findUserById(req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });
        res.json({ user: result[0] });
    });
};

const updateProfile = (req, res) => {
    const { nom, prenom, telephone, ville, region } = req.body;
    const data = { nom, prenom, telephone, ville, region };
    if (req.file) data.photo_url = `/uploads/${req.file.filename}`;
    userModel.updateUser(req.user.id, data, (err) => {
        if (err) return res.status(500).json(err);
        userModel.findUserById(req.user.id, (err2, result) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "Profil mis à jour", user: result[0] });
        });
    });
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Les deux mots de passe sont requis" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Le nouveau mot de passe doit faire au moins 6 caractères" });
    try {
        const [rows] = await require("../config/db").promise().query("SELECT mot_de_passe FROM utilisateurs WHERE id=?", [req.user.id]);
        if (!rows.length) return res.status(404).json({ message: "Utilisateur introuvable" });
        const valid = await bcrypt.compare(currentPassword, rows[0].mot_de_passe);
        if (!valid) return res.status(401).json({ message: "Mot de passe actuel incorrect" });
        const hashed = await bcrypt.hash(newPassword, 10);
        userModel.changePassword(req.user.id, hashed, (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Mot de passe changé avec succès" });
        });
    } catch (e) { res.status(500).json(e); }
};

const deleteAccount = async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Mot de passe requis" });
    try {
        const [rows] = await require("../config/db").promise().query("SELECT mot_de_passe FROM utilisateurs WHERE id=?", [req.user.id]);
        if (!rows.length) return res.status(404).json({ message: "Utilisateur introuvable" });
        const valid = await bcrypt.compare(password, rows[0].mot_de_passe);
        if (!valid) return res.status(401).json({ message: "Mot de passe incorrect" });
        userModel.deleteUser(req.user.id, (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Compte supprimé" });
        });
    } catch (e) { res.status(500).json(e); }
};

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };
