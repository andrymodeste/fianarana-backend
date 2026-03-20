const db = require("../config/db");

const createSubscription = (subscription, callback) => {

    const sql = `
    INSERT INTO abonnements (utilisateur_id, plan_id, statut, debut, fin)
    VALUES (?, ?, 'actif', ?, ?)
    `;

    db.query(
        sql,
        [
            subscription.utilisateur_id,
            subscription.plan_id,
            subscription.debut,
            subscription.fin
        ],
        callback
    );

};

const getActiveSubscription = (utilisateurId, callback) => {

    const sql = `
    SELECT a.*, p.nom AS plan_nom, p.prix, p.duree_jours
    FROM abonnements a
    JOIN plans_abonnement p ON a.plan_id = p.id
    WHERE a.utilisateur_id = ? AND a.statut = 'actif' AND a.fin >= CURDATE()
    ORDER BY a.cree_le DESC
    LIMIT 1
    `;

    db.query(sql, [utilisateurId], callback);

};

module.exports = {
    createSubscription,
    getActiveSubscription
};
