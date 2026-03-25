const profilProfesseurModel = require("../models/profilProfesseurModel");
const db = require("../config/db");

const getMyProfil = (req, res) => {
    void profilProfesseurModel.getProfilByUserId(req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ profil: result[0] || null });
    });
};

const getPublicProfil = (req, res) => {
    void profilProfesseurModel.getProfilByUserId(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.length) return res.status(404).json({ message: "Profil introuvable" });
        const profil = result[0];
        // Fetch professor's courses
        db.query(`SELECT c.id, c.titre, c.image_url, c.est_premium, c.prix, m.nom AS matiere_nom,
                  COALESCE(AVG(a.note),0) AS note_moyenne, COUNT(DISTINCT i.id) AS nb_inscrits
                  FROM cours c LEFT JOIN matieres m ON c.matiere_id=m.id
                  LEFT JOIN avis a ON c.id=a.cours_id LEFT JOIN inscriptions i ON c.id=i.cours_id
                  WHERE c.professeur_id=? AND c.est_publie=1 GROUP BY c.id`, [req.params.id], (err2, cours) => {
            res.json({ profil, cours: err2 ? [] : cours });
        });
    });
};

const updateProfil = (req, res) => {
    const { bio, specialites, diplomes, experience_annees, tarif_heure, disponibilite } = req.body;
    const profil = { utilisateur_id: req.user.id, bio, specialites, diplomes, experience_annees, tarif_heure, disponibilite };
    void profilProfesseurModel.createOrUpdateProfil(profil, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Profil mis à jour" });
    });
};

const getStudentStats = (req, res) => {
    const professeurId = req.user.id;
    const sql = `
    SELECT i.eleve_id, u.nom, u.prenom, u.photo_url, c.id AS cours_id, c.titre AS cours_titre,
           i.progression, i.est_termine, i.inscrit_le
    FROM inscriptions i
    JOIN cours c ON i.cours_id = c.id
    JOIN utilisateurs u ON i.eleve_id = u.id
    WHERE c.professeur_id = ?
    ORDER BY i.inscrit_le DESC`;
    void db.query(sql, [professeurId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ eleves: result });
    });
};

const getCourseStats = (req, res) => {
    const coursId = req.params.coursId;
    const queries = [
        db.query.bind(db, "SELECT COUNT(*) AS nb_inscrits FROM inscriptions WHERE cours_id=?", [coursId]),
        db.query.bind(db, "SELECT AVG(progression) AS progression_moyenne, COUNT(CASE WHEN est_termine=1 THEN 1 END) AS nb_termines FROM inscriptions WHERE cours_id=?", [coursId]),
        db.query.bind(db, "SELECT AVG(score) AS score_moyen FROM resultats_quiz rq JOIN quiz q ON rq.quiz_id=q.id JOIN lecons l ON q.lecon_id=l.id WHERE l.cours_id=?", [coursId])
    ];
    Promise.all(queries.map(q => new Promise((resolve, reject) => q((err, r) => err ? reject(err) : resolve(r)))))
        .then(([inscrits, prog, quiz]) => {
            res.json({
                nb_inscrits: inscrits[0].nb_inscrits,
                progression_moyenne: prog[0].progression_moyenne || 0,
                nb_termines: prog[0].nb_termines || 0,
                score_moyen: quiz[0].score_moyen || 0
            });
        }).catch(err => res.status(500).json(err));
};

module.exports = { getMyProfil, getPublicProfil, updateProfil, getStudentStats, getCourseStats };
