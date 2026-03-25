const categorieModel = require("../models/categorieModel");
const matiereModel = require("../models/matiereModel");

const getAllCategories = (req, res) => {

    void categorieModel.getAllCategories((err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            categories: result
        });

    });

};

const getCategorieById = (req, res) => {

    const { id } = req.params;

    void categorieModel.getCategorieById(id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        res.json({
            categorie: result[0]
        });

    });

};

const createCategorie = (req, res) => {

    const { nom, description, icone_url, ordre } = req.body;

    if (!nom || !nom.trim()) {
        return res.status(400).json({ message: "Le nom de la catégorie est requis" });
    }

    void categorieModel.createCategorie({ nom, description, icone_url, ordre }, (err, result) => {

        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Cette catégorie existe déjà" });
            }
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Catégorie créée avec succès",
            categorieId: result.insertId
        });

    });

};

const updateCategorie = (req, res) => {

    const { id } = req.params;
    const { nom, description, icone_url, ordre } = req.body;

    if (!nom || !nom.trim()) {
        return res.status(400).json({ message: "Le nom de la catégorie est requis" });
    }

    void categorieModel.updateCategorie(id, { nom, description, icone_url, ordre }, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        res.json({ message: "Catégorie mise à jour" });

    });

};

const deleteCategorie = (req, res) => {

    const { id } = req.params;

    void categorieModel.deleteCategorie(id, (err, result) => {

        if (err) {
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({ message: "Impossible de supprimer : des matières sont liées à cette catégorie" });
            }
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        res.json({ message: "Catégorie supprimée" });

    });

};

// ── Matières ──

const getAllMatieres = (req, res) => {

    void matiereModel.getAllMatieres((err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            matieres: result
        });

    });

};

const getMatieresByCategorie = (req, res) => {

    const { categorieId } = req.params;

    void matiereModel.getMatieresByCategorie(categorieId, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            matieres: result
        });

    });

};

const getMatiereById = (req, res) => {

    const { id } = req.params;

    void matiereModel.getMatiereById(id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Matière introuvable" });
        }

        res.json({
            matiere: result[0]
        });

    });

};

const createMatiere = (req, res) => {

    const { categorie_id, nom, description, couleur, icone_url } = req.body;

    if (!nom || !nom.trim()) {
        return res.status(400).json({ message: "Le nom de la matière est requis" });
    }

    if (!categorie_id) {
        return res.status(400).json({ message: "La catégorie est requise" });
    }

    void matiereModel.createMatiere({ categorie_id, nom, description, couleur, icone_url }, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Matière créée avec succès",
            matiereId: result.insertId
        });

    });

};

const updateMatiere = (req, res) => {

    const { id } = req.params;
    const { categorie_id, nom, description, couleur, icone_url } = req.body;

    if (!nom || !nom.trim()) {
        return res.status(400).json({ message: "Le nom de la matière est requis" });
    }

    void matiereModel.updateMatiere(id, { categorie_id, nom, description, couleur, icone_url }, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Matière introuvable" });
        }

        res.json({ message: "Matière mise à jour" });

    });

};

const deleteMatiere = (req, res) => {

    const { id } = req.params;

    void matiereModel.deleteMatiere(id, (err, result) => {

        if (err) {
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({ message: "Impossible de supprimer : des cours sont liés à cette matière" });
            }
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Matière introuvable" });
        }

        res.json({ message: "Matière supprimée" });

    });

};

module.exports = {
    getAllCategories,
    getCategorieById,
    createCategorie,
    updateCategorie,
    deleteCategorie,
    getAllMatieres,
    getMatieresByCategorie,
    getMatiereById,
    createMatiere,
    updateMatiere,
    deleteMatiere
};
