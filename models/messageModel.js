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

const getConversation = (currentUserId, contactId, callback) => {

    const sql = `
    SELECT m.*,
           exp.nom AS expediteur_nom, exp.prenom AS expediteur_prenom,
           dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom
    FROM messages m
    LEFT JOIN utilisateurs exp ON m.expediteur_id = exp.id
    LEFT JOIN utilisateurs dest ON m.destinataire_id = dest.id
    WHERE ((m.expediteur_id = ? AND m.destinataire_id = ?)
       OR  (m.expediteur_id = ? AND m.destinataire_id = ?))
      AND NOT (m.expediteur_id = ? AND m.est_supprime_expediteur = 1)
      AND NOT (m.destinataire_id = ? AND m.est_supprime_destinataire = 1)
    ORDER BY m.envoye_le ASC
    `;

    db.query(sql, [currentUserId, contactId, contactId, currentUserId, currentUserId, currentUserId], callback);

};

const getConversationsList = (userId, callback) => {

    const sql = `
    SELECT DISTINCT
        CASE WHEN m.expediteur_id = ? THEN m.destinataire_id ELSE m.expediteur_id END AS contact_id,
        u.nom AS contact_nom, u.prenom AS contact_prenom, u.photo_url AS contact_photo,
        (SELECT m2.contenu FROM messages m2
         WHERE ((m2.expediteur_id = ? AND m2.destinataire_id = u.id) OR (m2.expediteur_id = u.id AND m2.destinataire_id = ?))
           AND NOT (m2.expediteur_id = ? AND m2.est_supprime_expediteur = 1)
           AND NOT (m2.destinataire_id = ? AND m2.est_supprime_destinataire = 1)
         ORDER BY m2.envoye_le DESC LIMIT 1) AS dernier_message,
        (SELECT COUNT(*) FROM messages m3
         WHERE m3.expediteur_id = u.id AND m3.destinataire_id = ? AND m3.est_lu = 0
           AND m3.est_supprime_destinataire = 0) AS nb_non_lus
    FROM messages m
    JOIN utilisateurs u ON u.id = CASE WHEN m.expediteur_id = ? THEN m.destinataire_id ELSE m.expediteur_id END
    WHERE (m.expediteur_id = ? OR m.destinataire_id = ?)
      AND NOT (m.expediteur_id = ? AND m.est_supprime_expediteur = 1)
      AND NOT (m.destinataire_id = ? AND m.est_supprime_destinataire = 1)
    GROUP BY contact_id, u.nom, u.prenom, u.photo_url
    ORDER BY (SELECT MAX(m4.envoye_le) FROM messages m4
              WHERE (m4.expediteur_id = ? AND m4.destinataire_id = u.id) OR (m4.expediteur_id = u.id AND m4.destinataire_id = ?)) DESC
    `;

    db.query(sql, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId], callback);

};

const markMessagesAsRead = (expediteurId, destinataireId, callback) => {

    const sql = "UPDATE messages SET est_lu = 1 WHERE expediteur_id = ? AND destinataire_id = ? AND est_lu = 0";

    db.query(sql, [expediteurId, destinataireId], callback);

};

// Modifier un message (seulement l'expéditeur)
const updateMessage = (messageId, expediteurId, contenu, callback) => {
    db.query(
        "UPDATE messages SET contenu=?, est_modifie=1 WHERE id=? AND expediteur_id=?",
        [contenu, messageId, expediteurId], callback
    );
};

// Retirer pour moi (l'expéditeur ne voit plus le message)
const deleteForMe = (messageId, userId, callback) => {
    // Déterminer si l'utilisateur est l'expéditeur ou le destinataire
    db.query("SELECT expediteur_id, destinataire_id FROM messages WHERE id=?", [messageId], (err, rows) => {
        if (err) return callback(err);
        if (!rows.length) return callback(null, { affectedRows: 0 });
        const msg = rows[0];
        if (msg.expediteur_id === userId) {
            db.query("UPDATE messages SET est_supprime_expediteur=1 WHERE id=?", [messageId], callback);
        } else if (msg.destinataire_id === userId) {
            db.query("UPDATE messages SET est_supprime_destinataire=1 WHERE id=?", [messageId], callback);
        } else {
            callback(null, { affectedRows: 0 });
        }
    });
};

// Supprimer pour tout le monde (seulement l'expéditeur)
const deleteForAll = (messageId, expediteurId, callback) => {
    db.query(
        "UPDATE messages SET est_supprime_expediteur=1, est_supprime_destinataire=1, contenu='Ce message a été supprimé' WHERE id=? AND expediteur_id=?",
        [messageId, expediteurId], callback
    );
};

// Vérifier que l'utilisateur est l'expéditeur
const getMessageById = (messageId, callback) => {
    db.query("SELECT * FROM messages WHERE id=?", [messageId], callback);
};

// Contacts possibles : pour un élève → profs de ses cours, pour un prof → élèves inscrits à ses cours
const getContactsForUser = (userId, role, callback) => {
    let sql;
    if (role === "eleve") {
        sql = `
        SELECT DISTINCT u.id, u.nom, u.prenom, u.photo_url, u.role,
               c.titre AS cours_titre, c.id AS cours_id
        FROM inscriptions i
        JOIN cours c ON i.cours_id = c.id
        JOIN utilisateurs u ON c.professeur_id = u.id
        WHERE i.eleve_id = ?
        ORDER BY u.prenom, u.nom`;
    } else if (role === "professeur") {
        sql = `
        SELECT DISTINCT u.id, u.nom, u.prenom, u.photo_url, u.role,
               c.titre AS cours_titre, c.id AS cours_id
        FROM inscriptions i
        JOIN cours c ON i.cours_id = c.id
        JOIN utilisateurs u ON i.eleve_id = u.id
        WHERE c.professeur_id = ?
        ORDER BY u.prenom, u.nom`;
    } else {
        // Admin peut contacter tout le monde
        sql = `
        SELECT DISTINCT u.id, u.nom, u.prenom, u.photo_url, u.role,
               NULL AS cours_titre, NULL AS cours_id
        FROM utilisateurs u
        WHERE u.id != ?
        ORDER BY u.prenom, u.nom
        LIMIT 50`;
    }
    db.query(sql, [userId], callback);
};

module.exports = {
    sendMessage,
    getConversation,
    getConversationsList,
    markMessagesAsRead,
    getContactsForUser,
    updateMessage,
    deleteForMe,
    deleteForAll,
    getMessageById
};
