const db = require("../config/db");

const upsertProgress = (progress, callback) => {

    const sql = `
    INSERT INTO progression_lecons (eleve_id, lecon_id, est_terminee, temps_regarde, derniere_position)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        est_terminee = VALUES(est_terminee),
        temps_regarde = VALUES(temps_regarde),
        derniere_position = VALUES(derniere_position),
        vue_le = CURRENT_TIMESTAMP
    `;

    db.query(
        sql,
        [
            progress.eleve_id,
            progress.lecon_id,
            progress.est_terminee || 0,
            progress.temps_regarde || 0,
            progress.derniere_position || 0
        ],
        callback
    );

};

const getProgressByCourse = (eleveId, coursId, callback) => {

    const sql = `
    SELECT pl.*
    FROM progression_lecons pl
    JOIN lecons l ON pl.lecon_id = l.id
    WHERE pl.eleve_id = ? AND l.cours_id = ?
    `;

    db.query(sql, [eleveId, coursId], callback);

};

module.exports = {
    upsertProgress,
    getProgressByCourse
};
