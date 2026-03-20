const db = require("../config/db");

const getAllMatieres = (callback) => {

    const sql = `
    SELECT m.*, c.nom AS categorie_nom
    FROM matieres m
    LEFT JOIN categories c ON m.categorie_id = c.id
    ORDER BY c.ordre ASC, m.nom ASC
    `;

    db.query(sql, callback);

};

const getMatieresByCategorie = (categorieId, callback) => {

    const sql = "SELECT * FROM matieres WHERE categorie_id = ? ORDER BY nom ASC";

    db.query(sql, [categorieId], callback);

};

const getMatiereById = (id, callback) => {

    const sql = `
    SELECT m.*, c.nom AS categorie_nom
    FROM matieres m
    LEFT JOIN categories c ON m.categorie_id = c.id
    WHERE m.id = ?
    `;

    db.query(sql, [id], callback);

};

const createMatiere = (matiere, callback) => {

    const sql = `
    INSERT INTO matieres (categorie_id, nom, description, couleur, icone_url)
    VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [matiere.categorie_id, matiere.nom, matiere.description || null, matiere.couleur || null, matiere.icone_url || null], callback);

};

const updateMatiere = (id, matiere, callback) => {

    const sql = `
    UPDATE matieres SET categorie_id = ?, nom = ?, description = ?, couleur = ?, icone_url = ?
    WHERE id = ?
    `;

    db.query(sql, [matiere.categorie_id, matiere.nom, matiere.description || null, matiere.couleur || null, matiere.icone_url || null, id], callback);

};

const deleteMatiere = (id, callback) => {

    const sql = "DELETE FROM matieres WHERE id = ?";

    db.query(sql, [id], callback);

};

module.exports = {
    getAllMatieres,
    getMatieresByCategorie,
    getMatiereById,
    createMatiere,
    updateMatiere,
    deleteMatiere
};
