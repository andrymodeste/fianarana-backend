const avisModel = require("../models/avisModel");

const createAvis = (req, res) => {
    const { cours_id, note, commentaire } = req.body;
    if (!cours_id || !note || note < 1 || note > 5) return res.status(400).json({ message: "Le cours et une note entre 1 et 5 sont requis" });
    avisModel.createAvis({ eleve_id: req.user.id, cours_id, note, commentaire }, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Vous avez déjà donné un avis sur ce cours" });
            return res.status(500).json(err);
        }
        res.status(201).json({ message: "Avis ajouté avec succès", avisId: result.insertId });
    });
};

const getAvisByCours = (req, res) => {
    avisModel.getAvisByCours(req.params.coursId, (err, result) => {
        if (err) return res.status(500).json(err);
        avisModel.getAverageNote(req.params.coursId, (err2, avg) => {
            if (err2) return res.status(500).json(err2);
            res.json({ avis: result, moyenne: avg[0].moyenne || 0, total: avg[0].total || 0 });
        });
    });
};

const updateAvis = (req, res) => {
    const { note, commentaire } = req.body;
    if (!note || note < 1 || note > 5) return res.status(400).json({ message: "Note entre 1 et 5 requise" });
    avisModel.updateAvis(req.params.id, req.user.id, { note, commentaire }, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Avis introuvable" });
        res.json({ message: "Avis mis à jour" });
    });
};

const deleteAvis = (req, res) => {
    avisModel.deleteAvis(req.params.id, req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Avis introuvable" });
        res.json({ message: "Avis supprimé" });
    });
};

// Admin
const getAllAvis = (req, res) => {
    avisModel.getAllAvis((err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ avis: result });
    });
};

const adminHideAvis  = (req, res) => avisModel.hideAvis(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Avis masqué" }));
const adminShowAvis  = (req, res) => avisModel.showAvis(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Avis rendu visible" }));
const adminDeleteAvis = (req, res) => avisModel.adminDeleteAvis(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Avis supprimé" }));

module.exports = { createAvis, getAvisByCours, updateAvis, deleteAvis, getAllAvis, adminHideAvis, adminShowAvis, adminDeleteAvis };
