const db = require("../config/db");

const createCourse = (course, callback) => {
    const sql = `INSERT INTO cours (professeur_id, matiere_id, niveau_id, titre, description, image_url, est_premium, prix, langue)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [course.professeur_id, course.matiere_id, course.niveau_id, course.titre,
        course.description || null, course.image_url || null, course.est_premium || 0, course.prix || 0, course.langue || 'fr'], callback);
};

const getAllCourses = (filters, callback) => {
    let sql = `
    SELECT c.*, u.nom AS professeur_nom, u.prenom AS professeur_prenom, u.photo_url AS professeur_photo,
           m.nom AS matiere_nom, m.couleur AS matiere_couleur, n.nom AS niveau_nom, cat.nom AS categorie_nom,
           COALESCE(AVG(a.note), 0) AS note_moyenne, COUNT(DISTINCT a.id) AS nb_avis,
           COUNT(DISTINCT i.id) AS nb_inscrits,
           (SELECT COUNT(*) FROM lecons WHERE cours_id = c.id) AS nombre_lecons
    FROM cours c
    LEFT JOIN utilisateurs u ON c.professeur_id = u.id
    LEFT JOIN matieres m ON c.matiere_id = m.id
    LEFT JOIN niveaux n ON c.niveau_id = n.id
    LEFT JOIN categories cat ON m.categorie_id = cat.id
    LEFT JOIN avis a ON c.id = a.cours_id AND a.est_visible = 1
    LEFT JOIN inscriptions i ON c.id = i.cours_id
    WHERE c.est_publie = 1`;
    const params = [];
    if (filters && filters.matiere_id) { sql += " AND c.matiere_id = ?"; params.push(filters.matiere_id); }
    if (filters && filters.niveau_id)  { sql += " AND c.niveau_id = ?";  params.push(filters.niveau_id); }
    if (filters && filters.langue)     { sql += " AND c.langue = ?";     params.push(filters.langue); }
    if (filters && filters.gratuit)    { sql += " AND c.est_premium = 0"; }
    if (filters && filters.search)     { sql += " AND c.titre LIKE ?";   params.push(`%${filters.search}%`); }
    sql += " GROUP BY c.id ORDER BY c.cree_le DESC";
    db.query(sql, params, callback);
};

const getCourseById = (id, callback) => {
    const sql = `
    SELECT c.*, u.nom AS professeur_nom, u.prenom AS professeur_prenom, u.photo_url AS professeur_photo,
           m.nom AS matiere_nom, m.couleur AS matiere_couleur, n.nom AS niveau_nom, cat.nom AS categorie_nom,
           COALESCE(AVG(a.note), 0) AS note_moyenne, COUNT(DISTINCT a.id) AS nb_avis,
           COUNT(DISTINCT i.id) AS nb_inscrits,
           (SELECT COUNT(*) FROM lecons WHERE cours_id = c.id) AS nombre_lecons,
           (SELECT COALESCE(SUM(duree_minutes),0) FROM lecons WHERE cours_id = c.id) AS duree_totale_minutes
    FROM cours c
    LEFT JOIN utilisateurs u ON c.professeur_id = u.id
    LEFT JOIN matieres m ON c.matiere_id = m.id
    LEFT JOIN niveaux n ON c.niveau_id = n.id
    LEFT JOIN categories cat ON m.categorie_id = cat.id
    LEFT JOIN avis a ON c.id = a.cours_id AND a.est_visible = 1
    LEFT JOIN inscriptions i ON c.id = i.cours_id
    WHERE c.id = ? GROUP BY c.id`;
    db.query(sql, [id], callback);
};

const getCoursesByProfesseur = (professeurId, callback) => {
    const sql = `
    SELECT c.*, m.nom AS matiere_nom, n.nom AS niveau_nom,
           COUNT(DISTINCT i.id) AS nb_inscrits, COALESCE(AVG(a.note), 0) AS note_moyenne,
           (SELECT COUNT(*) FROM lecons WHERE cours_id = c.id) AS nombre_lecons
    FROM cours c
    LEFT JOIN matieres m ON c.matiere_id = m.id
    LEFT JOIN niveaux n ON c.niveau_id = n.id
    LEFT JOIN inscriptions i ON c.id = i.cours_id
    LEFT JOIN avis a ON c.id = a.cours_id
    WHERE c.professeur_id = ? GROUP BY c.id ORDER BY c.cree_le DESC`;
    db.query(sql, [professeurId], callback);
};

const updateCourse = (id, data, callback) => {
    const fields = ["titre=?", "description=?", "matiere_id=?", "niveau_id=?", "est_premium=?", "prix=?", "langue=?"];
    const params = [data.titre, data.description, data.matiere_id, data.niveau_id, data.est_premium, data.prix, data.langue];
    if (data.image_url) { fields.push("image_url=?"); params.push(data.image_url); }
    params.push(id);
    db.query(`UPDATE cours SET ${fields.join(",")} WHERE id = ?`, params, callback);
};

const deleteCourse  = (id, cb) => db.query("DELETE FROM cours WHERE id=?", [id], cb);
const submitCourse  = (id, cb) => db.query("UPDATE cours SET statut='en_attente' WHERE id=?", [id], cb);
const publishCourse = (id, cb) => db.query("UPDATE cours SET est_publie=1, statut='valide' WHERE id=?", [id], cb);
const rejectCourse  = (id, motif, cb) => db.query("UPDATE cours SET statut='rejete', motif_rejet=? WHERE id=?", [motif, id], cb);
const archiveCourse = (id, cb) => db.query("UPDATE cours SET est_publie=0, statut='archive' WHERE id=?", [id], cb);

const getPendingCourses = (callback) => {
    const sql = `SELECT c.*, u.nom AS professeur_nom, u.prenom AS professeur_prenom,
                 m.nom AS matiere_nom, n.nom AS niveau_nom
                 FROM cours c LEFT JOIN utilisateurs u ON c.professeur_id=u.id
                 LEFT JOIN matieres m ON c.matiere_id=m.id LEFT JOIN niveaux n ON c.niveau_id=n.id
                 WHERE c.statut='en_attente' ORDER BY c.cree_le ASC`;
    db.query(sql, callback);
};

const countEnrolledStudents = (coursId, cb) =>
    db.query("SELECT COUNT(*) AS total FROM inscriptions WHERE cours_id=?", [coursId], cb);

module.exports = {
    createCourse, getAllCourses, getCourseById, getCoursesByProfesseur,
    updateCourse, deleteCourse, submitCourse, publishCourse, rejectCourse,
    archiveCourse, getPendingCourses, countEnrolledStudents
};
