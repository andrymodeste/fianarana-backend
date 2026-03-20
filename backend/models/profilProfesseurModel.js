const db = require("../config/db");

const getProfilByUserId = (utilisateurId, callback) => {

    const sql = `
    SELECT pp.*, u.nom, u.prenom, u.email, u.photo_url, u.ville, u.region
    FROM profil_professeur pp
    JOIN utilisateurs u ON pp.utilisateur_id = u.id
    WHERE pp.utilisateur_id = ?
    `;

    db.query(sql, [utilisateurId], callback);

};

const createOrUpdateProfil = (profil, callback) => {

    const sql = `
    INSERT INTO profil_professeur (utilisateur_id, bio, specialites, diplomes, experience_annees, tarif_heure, disponibilite)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        bio = VALUES(bio),
        specialites = VALUES(specialites),
        diplomes = VALUES(diplomes),
        experience_annees = VALUES(experience_annees),
        tarif_heure = VALUES(tarif_heure),
        disponibilite = VALUES(disponibilite)
    `;

    db.query(
        sql,
        [profil.utilisateur_id, profil.bio || null, profil.specialites || null, profil.diplomes || null, profil.experience_annees || 0, profil.tarif_heure || null, profil.disponibilite || null],
        callback
    );

};

const getAllProfesseurs = (callback) => {

    const sql = `
    SELECT pp.*, u.nom, u.prenom, u.photo_url, u.ville, u.region
    FROM profil_professeur pp
    JOIN utilisateurs u ON pp.utilisateur_id = u.id
    WHERE u.est_actif = 1 AND pp.est_verifie = 1
    ORDER BY pp.note_moyenne DESC
    `;

    db.query(sql, callback);

};

module.exports = {
    getProfilByUserId,
    createOrUpdateProfil,
    getAllProfesseurs
};
