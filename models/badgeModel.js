const db = require("../config/db");

const getAllBadges = (callback) => {

    const sql = "SELECT * FROM badges ORDER BY type, condition_valeur ASC";

    db.query(sql, callback);

};

const getBadgesByEleve = (eleveId, callback) => {

    const sql = `
    SELECT b.*, be.obtenu_le
    FROM badges_eleve be
    JOIN badges b ON be.badge_id = b.id
    WHERE be.eleve_id = ?
    ORDER BY be.obtenu_le DESC
    `;

    db.query(sql, [eleveId], callback);

};

const awardBadge = (eleveId, badgeId, callback) => {

    const sql = `
    INSERT IGNORE INTO badges_eleve (eleve_id, badge_id)
    VALUES (?, ?)
    `;

    db.query(sql, [eleveId, badgeId], callback);

};

module.exports = {
    getAllBadges,
    getBadgesByEleve,
    awardBadge
};
