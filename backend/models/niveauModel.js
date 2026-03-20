const db = require("../config/db");

const getAllNiveaux = (callback) => {

    const sql = "SELECT * FROM niveaux ORDER BY ordre ASC";

    db.query(sql, callback);

};

const getNiveauById = (id, callback) => {

    const sql = "SELECT * FROM niveaux WHERE id = ?";

    db.query(sql, [id], callback);

};

const createNiveau = (niveau, callback) => {

    const sql = `
    INSERT INTO niveaux (nom, description, ordre)
    VALUES (?, ?, ?)
    `;

    db.query(sql, [niveau.nom, niveau.description || null, niveau.ordre], callback);

};

const updateNiveau = (id, niveau, callback) => {

    const sql = `
    UPDATE niveaux SET nom = ?, description = ?, ordre = ?
    WHERE id = ?
    `;

    db.query(sql, [niveau.nom, niveau.description || null, niveau.ordre, id], callback);

};

const deleteNiveau = (id, callback) => {

    const sql = "DELETE FROM niveaux WHERE id = ?";

    db.query(sql, [id], callback);

};

module.exports = {
    getAllNiveaux,
    getNiveauById,
    createNiveau,
    updateNiveau,
    deleteNiveau
};
