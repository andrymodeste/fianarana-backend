const db = require("../config/db");
const crypto = require("crypto");

const createCertificat = (certificat, callback) => {

    const code = crypto.randomBytes(12).toString("hex").toUpperCase();

    const sql = `
    INSERT INTO certificats (eleve_id, cours_id, code_verification)
    VALUES (?, ?, ?)
    `;

    db.query(sql, [certificat.eleve_id, certificat.cours_id, code], callback);

};

const getCertificatsByEleve = (eleveId, callback) => {

    const sql = `
    SELECT cert.*, c.titre AS cours_titre,
           u.nom AS professeur_nom, u.prenom AS professeur_prenom
    FROM certificats cert
    JOIN cours c ON cert.cours_id = c.id
    LEFT JOIN utilisateurs u ON c.professeur_id = u.id
    WHERE cert.eleve_id = ?
    ORDER BY cert.delivre_le DESC
    `;

    db.query(sql, [eleveId], callback);

};

const verifyCertificat = (code, callback) => {

    const sql = `
    SELECT cert.*, c.titre AS cours_titre,
           e.nom AS eleve_nom, e.prenom AS eleve_prenom
    FROM certificats cert
    JOIN cours c ON cert.cours_id = c.id
    JOIN utilisateurs e ON cert.eleve_id = e.id
    WHERE cert.code_verification = ?
    `;

    db.query(sql, [code], callback);

};

module.exports = {
    createCertificat,
    getCertificatsByEleve,
    verifyCertificat
};
