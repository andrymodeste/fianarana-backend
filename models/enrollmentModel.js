const db = require("../config/db");

const enrollUser = (enrollment, callback) => {

    const sql = `
    INSERT INTO inscriptions (eleve_id, cours_id)
    VALUES (?, ?)
    `;

    db.query(sql, [enrollment.eleve_id, enrollment.cours_id], callback);

};

const getEnrollmentsByUser = (eleveId, callback) => {

    const sql = `
    SELECT i.*, c.titre, c.image_url, c.description,
           u.nom AS professeur_nom, u.prenom AS professeur_prenom,
           m.nom AS matiere_nom
    FROM inscriptions i
    JOIN cours c ON i.cours_id = c.id
    LEFT JOIN utilisateurs u ON c.professeur_id = u.id
    LEFT JOIN matieres m ON c.matiere_id = m.id
    WHERE i.eleve_id = ?
    `;

    db.query(sql, [eleveId], callback);

};

const getEnrollment = (eleveId, coursId, callback) => {

    const sql = `
    SELECT * FROM inscriptions
    WHERE eleve_id = ? AND cours_id = ?
    `;

    db.query(sql, [eleveId, coursId], callback);

};

const updateProgression = (eleveId, coursId, progression, callback) => {

    const sql = `
    UPDATE inscriptions SET progression = ?, est_termine = ?
    WHERE eleve_id = ? AND cours_id = ?
    `;

    const estTermine = progression >= 100 ? 1 : 0;

    db.query(sql, [progression, estTermine, eleveId, coursId], callback);

};

module.exports = {
    enrollUser,
    getEnrollmentsByUser,
    getEnrollment,
    updateProgression
};
