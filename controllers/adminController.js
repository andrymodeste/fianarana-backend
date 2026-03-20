const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");
const notificationModel = require("../models/notificationModel");
const db = require("../config/db");

// ── Users ──
const getAllUsers = (req, res) => {
    const { search } = req.query;
    const fn = search ? userModel.searchUsers(search, cb) : userModel.getAllUsers(cb);
    function cb(err, result) {
        if (err) return res.status(500).json(err);
        res.json({ users: result });
    }
    if (search) userModel.searchUsers(search, cb);
    else userModel.getAllUsers(cb);
};

const getUserById = (req, res) => {
    userModel.findUserById(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.length) return res.status(404).json({ message: "Utilisateur introuvable" });
        res.json({ user: result[0] });
    });
};

const toggleUserActive = (req, res) => {
    const { actif } = req.body;
    userModel.setUserActive(req.params.id, actif ? 1 : 0, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: actif ? "Compte activé" : "Compte désactivé" });
    });
};

const deleteUser = (req, res) => {
    userModel.deleteUser(req.params.id, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Utilisateur supprimé" });
    });
};

const changeUserRole = (req, res) => {
    const { role } = req.body;
    if (!["eleve", "professeur", "admin"].includes(role)) return res.status(400).json({ message: "Rôle invalide" });
    userModel.changeUserRole(req.params.id, role, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Rôle mis à jour" });
    });
};

// ── Teacher Validation ──
const getProfesseursEnAttente = (req, res) => {
    userModel.getProfesseursEnAttente((err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ professeurs: result });
    });
};

const validateProfesseur = (req, res) => {
    const { action, motif } = req.body; // action: 'valider' | 'rejeter' | 'suspendre'
    if (action === "valider") {
        userModel.verifyProfesseur(req.params.id, (err) => {
            if (err) return res.status(500).json(err);
            notificationModel.createNotification({ utilisateur_id: req.params.id, titre: "Profil validé", message: "Votre profil de professeur a été validé !", type: "info" }, () => {});
            res.json({ message: "Professeur validé" });
        });
    } else if (action === "rejeter") {
        db.query("UPDATE profil_professeur SET est_verifie=0 WHERE utilisateur_id=?", [req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            notificationModel.createNotification({ utilisateur_id: req.params.id, titre: "Profil rejeté", message: motif || "Votre profil n'a pas été validé.", type: "warning" }, () => {});
            res.json({ message: "Professeur rejeté" });
        });
    } else if (action === "suspendre") {
        userModel.setUserActive(req.params.id, 0, (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Professeur suspendu" });
        });
    } else {
        res.status(400).json({ message: "Action invalide" });
    }
};

// ── Course Validation ──
const getPendingCourses = (req, res) => {
    courseModel.getPendingCourses((err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ cours: result });
    });
};

const validateCourse = (req, res) => {
    const { action, motif } = req.body;
    const id = req.params.id;
    if (action === "valider") {
        courseModel.publishCourse(id, (err) => {
            if (err) return res.status(500).json(err);
            db.query("SELECT professeur_id FROM cours WHERE id=?", [id], (e, rows) => {
                if (!e && rows.length) notificationModel.createNotification({ utilisateur_id: rows[0].professeur_id, titre: "Cours validé", message: "Votre cours a été validé et publié !", type: "success" }, () => {});
            });
            res.json({ message: "Cours validé et publié" });
        });
    } else if (action === "rejeter") {
        courseModel.rejectCourse(id, motif || "", (err) => {
            if (err) return res.status(500).json(err);
            db.query("SELECT professeur_id FROM cours WHERE id=?", [id], (e, rows) => {
                if (!e && rows.length) notificationModel.createNotification({ utilisateur_id: rows[0].professeur_id, titre: "Cours rejeté", message: motif || "Votre cours n'a pas été validé.", type: "warning" }, () => {});
            });
            res.json({ message: "Cours rejeté" });
        });
    } else if (action === "depublier") {
        courseModel.archiveCourse(id, (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Cours dépublié" });
        });
    } else {
        res.status(400).json({ message: "Action invalide" });
    }
};

// ── Stats Dashboard ──
const getDashboardStats = (req, res) => {
    const queries = [
        "SELECT COUNT(*) AS total FROM utilisateurs",
        "SELECT COUNT(*) AS total FROM utilisateurs WHERE MONTH(cree_le)=MONTH(NOW()) AND YEAR(cree_le)=YEAR(NOW())",
        "SELECT COUNT(*) AS total FROM cours WHERE est_publie=1",
        "SELECT COUNT(*) AS total FROM abonnements WHERE statut='actif' AND fin>=CURDATE()",
        "SELECT COALESCE(SUM(montant), 0) AS total FROM paiements WHERE statut='reussi'",
        "SELECT COALESCE(SUM(montant), 0) AS total FROM paiements WHERE statut='reussi' AND MONTH(cree_le)=MONTH(NOW()) AND YEAR(cree_le)=YEAR(NOW())",
        "SELECT COUNT(*) AS total FROM cours WHERE statut='en_attente'",
        "SELECT COUNT(*) AS total FROM utilisateurs WHERE role='professeur' AND id IN (SELECT utilisateur_id FROM profil_professeur WHERE est_verifie=0)",
        `SELECT c.id, c.titre, COUNT(i.id) AS nb_inscrits FROM cours c LEFT JOIN inscriptions i ON c.id=i.cours_id WHERE c.est_publie=1 GROUP BY c.id ORDER BY nb_inscrits DESC LIMIT 5`,
        `SELECT u.id, u.nom, u.prenom, COALESCE(AVG(a.note),0) AS note_moyenne FROM utilisateurs u JOIN cours c ON u.id=c.professeur_id LEFT JOIN avis a ON c.id=a.cours_id WHERE u.role='professeur' GROUP BY u.id ORDER BY note_moyenne DESC LIMIT 5`
    ];
    const db_ = require("../config/db");
    Promise.all(queries.map(q => new Promise((resolve, reject) =>
        db_.query(q, (err, r) => err ? reject(err) : resolve(r))
    ))).then(([users, newUsers, cours, abonnements, revenus, revenusMois, coursPendants, profsPendants, topCours, topProfs]) => {
        res.json({
            nb_utilisateurs: users[0].total,
            nb_nouveaux_ce_mois: newUsers[0].total,
            nb_cours_publies: cours[0].total,
            nb_abonnements_actifs: abonnements[0].total,
            revenus_total: revenus[0].total,
            revenus_ce_mois: revenusMois[0].total,
            nb_cours_en_attente: coursPendants[0].total,
            nb_profs_en_attente: profsPendants[0].total,
            top_cours: topCours,
            top_professeurs: topProfs
        });
    }).catch(err => res.status(500).json(err));
};

// ── Bulk Notifications ──
const sendBulkNotification = (req, res) => {
    const { titre, message, cible } = req.body; // cible: 'tous' | 'eleves' | 'professeurs'
    let sql = "SELECT id FROM utilisateurs";
    if (cible === "eleves")      sql += " WHERE role='eleve'";
    else if (cible === "professeurs") sql += " WHERE role='professeur'";
    db.query(sql, (err, users) => {
        if (err) return res.status(500).json(err);
        const promises = users.map(u => new Promise((resolve) =>
            notificationModel.createNotification({ utilisateur_id: u.id, titre, message, type: "info" }, resolve)
        ));
        Promise.all(promises).then(() => res.json({ message: `Notification envoyée à ${users.length} utilisateurs` }));
    });
};

// ── Payments ──
const getAllPayments = (req, res) => {
    db.query(`SELECT p.*, u.nom, u.prenom, u.email, pl.nom AS plan_nom FROM paiements p
              LEFT JOIN utilisateurs u ON p.utilisateur_id=u.id
              LEFT JOIN plans_abonnement pl ON p.plan_id=pl.id ORDER BY p.cree_le DESC`, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ paiements: result });
    });
};

module.exports = {
    getAllUsers, getUserById, toggleUserActive, deleteUser, changeUserRole,
    getProfesseursEnAttente, validateProfesseur,
    getPendingCourses, validateCourse,
    getDashboardStats, sendBulkNotification, getAllPayments
};
