const db = require("../config/db");

const getAllCategories = (callback) => {

    const sql = "SELECT * FROM categories ORDER BY ordre ASC";

    db.query(sql, callback);

};

const getCategorieById = (id, callback) => {

    const sql = "SELECT * FROM categories WHERE id = ?";

    db.query(sql, [id], callback);

};

const createCategorie = (categorie, callback) => {

    const sql = `
    INSERT INTO categories (nom, description, icone_url, ordre)
    VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [categorie.nom, categorie.description || null, categorie.icone_url || null, categorie.ordre || 0], callback);

};

const updateCategorie = (id, categorie, callback) => {

    const sql = `
    UPDATE categories SET nom = ?, description = ?, icone_url = ?, ordre = ?
    WHERE id = ?
    `;

    db.query(sql, [categorie.nom, categorie.description || null, categorie.icone_url || null, categorie.ordre || 0, id], callback);

};

const deleteCategorie = (id, callback) => {

    const sql = "DELETE FROM categories WHERE id = ?";

    db.query(sql, [id], callback);

};

module.exports = {
    getAllCategories,
    getCategorieById,
    createCategorie,
    updateCategorie,
    deleteCategorie
};
