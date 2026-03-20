const db = require("../config/db");

const subscriptionMiddleware = (req, res, next) => {

    const userId = req.user.id;

    const sql = `
    SELECT * FROM abonnements
    WHERE utilisateur_id = ? AND statut = 'actif' AND fin >= CURDATE()
    LIMIT 1
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(403).json({
                message: "Un abonnement actif est requis"
            });
        }

        next();

    });

};

module.exports = subscriptionMiddleware;
