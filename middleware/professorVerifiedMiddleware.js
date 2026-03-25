const db = require("../config/db");

/**
 * Vérifie que le professeur a un profil validé (est_verifie = 1).
 * Doit être utilisé APRÈS authMiddleware et roleMiddleware("professeur").
 */
const professorVerifiedMiddleware = (req, res, next) => {
    if (req.user.role !== "professeur") return next();

    void db.query(
        "SELECT est_verifie FROM profil_professeur WHERE utilisateur_id = ?",
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Erreur serveur" });

            if (!rows.length || !rows[0].est_verifie) {
                return res.status(403).json({
                    message: "Votre profil professeur n'a pas encore été vérifié par l'administration. Veuillez compléter votre profil et attendre la validation.",
                    code: "PROFESSOR_NOT_VERIFIED"
                });
            }

            next();
        }
    );
};

module.exports = professorVerifiedMiddleware;
