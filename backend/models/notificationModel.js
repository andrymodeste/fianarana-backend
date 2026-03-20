const db = require("../config/db");

const createNotification = (notif, callback) => {

    const sql = `
    INSERT INTO notifications (utilisateur_id, titre, message, type, lien)
    VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [notif.utilisateur_id, notif.titre, notif.message, notif.type, notif.lien || null],
        callback
    );

};

const getNotificationsByUser = (utilisateurId, callback) => {

    const sql = "SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY cree_le DESC LIMIT 50";

    db.query(sql, [utilisateurId], callback);

};

const markAsRead = (id, callback) => {

    const sql = "UPDATE notifications SET est_lue = 1 WHERE id = ?";

    db.query(sql, [id], callback);

};

const markAllAsRead = (utilisateurId, callback) => {

    const sql = "UPDATE notifications SET est_lue = 1 WHERE utilisateur_id = ?";

    db.query(sql, [utilisateurId], callback);

};

module.exports = {
    createNotification,
    getNotificationsByUser,
    markAsRead,
    markAllAsRead
};
