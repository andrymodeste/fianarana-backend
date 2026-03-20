const db = require("../config/db");

const createResultat = (resultat, callback) => {

    const sql = `
    INSERT INTO resultats_quiz (eleve_id, quiz_id, score, points_obtenus, points_total, est_valide, tentative_num, duree_secondes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [resultat.eleve_id, resultat.quiz_id, resultat.score, resultat.points_obtenus, resultat.points_total, resultat.est_valide, resultat.tentative_num || 1, resultat.duree_secondes || null],
        callback
    );

};

const getResultatsByEleve = (eleveId, callback) => {

    const sql = `
    SELECT r.*, q.titre AS quiz_titre
    FROM resultats_quiz r
    JOIN quiz q ON r.quiz_id = q.id
    WHERE r.eleve_id = ?
    ORDER BY r.fait_le DESC
    `;

    db.query(sql, [eleveId], callback);

};

const countTentatives = (eleveId, quizId, callback) => {

    const sql = "SELECT COUNT(*) AS total FROM resultats_quiz WHERE eleve_id = ? AND quiz_id = ?";

    db.query(sql, [eleveId, quizId], callback);

};

module.exports = {
    createResultat,
    getResultatsByEleve,
    countTentatives
};
