const db = require("../config/db");

const createLesson = (lesson, cb) => {
    const sql = `INSERT INTO lecons (cours_id, titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable, statut)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [lesson.cours_id, lesson.titre, lesson.description || null, lesson.video_url || null,
        lesson.pdf_url || null, lesson.ordre, lesson.duree_minutes || 0, lesson.est_gratuite || 0,
        lesson.est_telechargeable !== undefined ? lesson.est_telechargeable : 1,
        lesson.statut || 'valide'], cb);
};

const getLessonsByCourse = (coursId, cb) =>
    db.query("SELECT * FROM lecons WHERE cours_id=? ORDER BY ordre ASC", [coursId], cb);

const getLessonById = (id, cb) =>
    db.query("SELECT * FROM lecons WHERE id=?", [id], cb);

const updateLesson = (id, data, cb) => {
    const fields = ["titre=?", "description=?", "ordre=?", "duree_minutes=?", "est_gratuite=?", "est_telechargeable=?"];
    const params = [data.titre, data.description, data.ordre, data.duree_minutes, data.est_gratuite, data.est_telechargeable];
    if (data.video_url !== undefined) { fields.push("video_url=?"); params.push(data.video_url); }
    if (data.pdf_url !== undefined)   { fields.push("pdf_url=?");   params.push(data.pdf_url); }
    params.push(id);
    db.query(`UPDATE lecons SET ${fields.join(",")} WHERE id=?`, params, cb);
};

const deleteLesson = (id, cb) => db.query("DELETE FROM lecons WHERE id=?", [id], cb);

const reorderLessons = (lessons, cb) => {
    // lessons = [{id, ordre}, ...]
    const promises = lessons.map(l => new Promise((res, rej) => {
        db.query("UPDATE lecons SET ordre=? WHERE id=?", [l.ordre, l.id], (err) => err ? rej(err) : res());
    }));
    Promise.all(promises).then(() => cb(null)).catch(cb);
};

const getPendingLessons = (cb) => {
    const sql = `SELECT l.*, c.titre AS cours_titre, u.nom AS professeur_nom, u.prenom AS professeur_prenom
                 FROM lecons l
                 JOIN cours c ON l.cours_id = c.id
                 JOIN utilisateurs u ON c.professeur_id = u.id
                 WHERE l.statut = 'en_attente'
                 ORDER BY l.cree_le ASC`;
    db.query(sql, cb);
};

const validateLesson = (id, cb) => db.query("UPDATE lecons SET statut='valide' WHERE id=?", [id], cb);

const rejectLesson = (id, cb) => db.query("DELETE FROM lecons WHERE id=?", [id], cb);

module.exports = { createLesson, getLessonsByCourse, getLessonById, updateLesson, deleteLesson, reorderLessons, getPendingLessons, validateLesson, rejectLesson };
