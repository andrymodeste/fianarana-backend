const db = require("../config/db");

const createAvis = (avis, cb) =>
    db.query("INSERT INTO avis (eleve_id, cours_id, note, commentaire) VALUES (?, ?, ?, ?)",
        [avis.eleve_id, avis.cours_id, avis.note, avis.commentaire || null], cb);

const getAvisByCours = (coursId, cb) => {
    const sql = `SELECT a.*, u.nom, u.prenom, u.photo_url FROM avis a
                 JOIN utilisateurs u ON a.eleve_id = u.id
                 WHERE a.cours_id = ? AND a.est_visible = 1 ORDER BY a.cree_le DESC`;
    db.query(sql, [coursId], cb);
};

const getAverageNote = (coursId, cb) =>
    db.query("SELECT AVG(note) AS moyenne, COUNT(*) AS total FROM avis WHERE cours_id=? AND est_visible=1", [coursId], cb);

const getAllAvis = (cb) => {
    const sql = `SELECT a.*, u.nom, u.prenom, c.titre AS cours_titre FROM avis a
                 JOIN utilisateurs u ON a.eleve_id=u.id JOIN cours c ON a.cours_id=c.id
                 ORDER BY a.cree_le DESC`;
    db.query(sql, cb);
};

const updateAvis = (id, eleveId, data, cb) =>
    db.query("UPDATE avis SET note=?, commentaire=? WHERE id=? AND eleve_id=?",
        [data.note, data.commentaire, id, eleveId], cb);

const deleteAvis = (id, eleveId, cb) =>
    db.query("DELETE FROM avis WHERE id=? AND eleve_id=?", [id, eleveId], cb);

const hideAvis   = (id, cb) => db.query("UPDATE avis SET est_visible=0 WHERE id=?", [id], cb);
const showAvis   = (id, cb) => db.query("UPDATE avis SET est_visible=1 WHERE id=?", [id], cb);
const adminDeleteAvis = (id, cb) => db.query("DELETE FROM avis WHERE id=?", [id], cb);

module.exports = { createAvis, getAvisByCours, getAverageNote, getAllAvis, updateAvis, deleteAvis, hideAvis, showAvis, adminDeleteAvis };
