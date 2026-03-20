const db = require("../config/db");

const sendMessage = (msg, callback) => {

    const sql = `
    INSERT INTO messages (expediteur_id, destinataire_id, cours_id, contenu, fichier_url)
    VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [msg.expediteur_id, msg.destinataire_id, msg.cours_id || null, msg.contenu, msg.fichier_url || null],
        callback
    );

};

const getConversation = (userId1, userId2, callback) => {

    const sql = `
    SELECT m.*,
           exp.nom AS expediteur_nom, exp.prenom AS expediteur_prenom,
           dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom
    FROM messages m
    LEFT JOIN utilisateurs exp ON m.expediteur_id = exp.id
    LEFT JOIN utilisateurs dest ON m.destinataire_id = dest.id
    WHERE (m.expediteur_id = ? AND m.destinataire_id = ?)
       OR (m.expediteur_id = ? AND m.destinataire_id = ?)
    ORDER BY m.envoye_le ASC
    `;

    db.query(sql, [userId1, userId2, userId2, userId1], callback);

};

const getConversationsList = (userId, callback) => {

    const sql = `
    SELECT DISTINCT
        CASE WHEN m.expediteur_id = ? THEN m.destinataire_id ELSE m.expediteur_id END AS contact_id,
        u.nom AS contact_nom, u.prenom AS contact_prenom, u.photo_url AS contact_photo,
        (SELECT contenu FROM messages m2
         WHERE (m2.expediteur_id = ? AND m2.destinataire_id = u.id) OR (m2.expediteur_id = u.id AND m2.destinataire_id = ?)
         ORDER BY m2.envoye_le DESC LIMIT 1) AS dernier_message
    FROM messages m
    JOIN utilisateurs u ON u.id = CASE WHEN m.expediteur_id = ? THEN m.destinataire_id ELSE m.expediteur_id END
    WHERE m.expediteur_id = ? OR m.destinataire_id = ?
    GROUP BY contact_id, u.nom, u.prenom, u.photo_url
    `;

    db.query(sql, [userId, userId, userId, userId, userId, userId], callback);

};

const markMessagesAsRead = (expediteurId, destinataireId, callback) => {

    const sql = "UPDATE messages SET est_lu = 1 WHERE expediteur_id = ? AND destinataire_id = ? AND est_lu = 0";

    db.query(sql, [expediteurId, destinataireId], callback);

};

module.exports = {
    sendMessage,
    getConversation,
    getConversationsList,
    markMessagesAsRead
};
