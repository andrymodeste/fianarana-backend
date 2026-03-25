const niveauModel = require("../models/niveauModel");

const getAllNiveaux = (req, res) => {

    void niveauModel.getAllNiveaux((err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            niveaux: result
        });

    });

};

const getNiveauById = (req, res) => {

    const { id } = req.params;

    void niveauModel.getNiveauById(id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Niveau introuvable" });
        }

        res.json({
            niveau: result[0]
        });

    });

};

const createNiveau = (req, res) => {

    const { nom, description, ordre } = req.body;

    if (!nom || !nom.trim()) {
        return res.status(400).json({ message: "Le nom du niveau est requis" });
    }

    if (ordre === undefined) {
        return res.status(400).json({ message: "L'ordre est requis" });
    }

    void niveauModel.createNiveau({ nom, description, ordre }, (err, result) => {

        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Ce niveau existe déjà" });
            }
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Niveau créé avec succès",
            niveauId: result.insertId
        });

    });

};

const updateNiveau = (req, res) => {

    const { id } = req.params;
    const { nom, description, ordre } = req.body;

    if (!nom || !nom.trim()) {
        return res.status(400).json({ message: "Le nom du niveau est requis" });
    }

    void niveauModel.updateNiveau(id, { nom, description, ordre }, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Niveau introuvable" });
        }

        res.json({ message: "Niveau mis à jour" });

    });

};

const deleteNiveau = (req, res) => {

    const { id } = req.params;

    void niveauModel.deleteNiveau(id, (err, result) => {

        if (err) {
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({ message: "Impossible de supprimer : des cours sont liés à ce niveau" });
            }
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Niveau introuvable" });
        }

        res.json({ message: "Niveau supprimé" });

    });

};

module.exports = {
    getAllNiveaux,
    getNiveauById,
    createNiveau,
    updateNiveau,
    deleteNiveau
};
