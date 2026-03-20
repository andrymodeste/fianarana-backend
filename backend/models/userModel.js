const db = require("../config/db");

const createUser = (user, callback) => {
    const sql = `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, telephone, ville, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [user.nom, user.prenom, user.email, user.mot_de_passe, user.role, user.telephone || null, user.ville || null, user.region || null], callback);
};

const findUserByEmail = (email, cb) => db.query("SELECT * FROM utilisateurs WHERE email=?", [email], cb);
const findUserById    = (id, cb)    => db.query("SELECT id, nom, prenom, email, role, telephone, photo_url, ville, region, est_actif, cree_le FROM utilisateurs WHERE id=?", [id], cb);

const updateUser = (id, data, cb) => {
    const fields = [], params = [];
    if (data.nom !== undefined)       { fields.push("nom=?");       params.push(data.nom); }
    if (data.prenom !== undefined)    { fields.push("prenom=?");    params.push(data.prenom); }
    if (data.telephone !== undefined) { fields.push("telephone=?"); params.push(data.telephone); }
    if (data.ville !== undefined)     { fields.push("ville=?");     params.push(data.ville); }
    if (data.region !== undefined)    { fields.push("region=?");    params.push(data.region); }
    if (data.photo_url !== undefined) { fields.push("photo_url=?"); params.push(data.photo_url); }
    if (fields.length === 0) return cb(null, { affectedRows: 0 });
    params.push(id);
    db.query(`UPDATE utilisateurs SET ${fields.join(",")} WHERE id=?`, params, cb);
};

const changePassword = (id, hashedPwd, cb) =>
    db.query("UPDATE utilisateurs SET mot_de_passe=? WHERE id=?", [hashedPwd, id], cb);

const deleteUser = (id, cb) => db.query("DELETE FROM utilisateurs WHERE id=?", [id], cb);

const getAllUsers = (cb) =>
    db.query("SELECT id, nom, prenom, email, role, ville, region, est_actif, cree_le FROM utilisateurs ORDER BY cree_le DESC", cb);

const setUserActive = (id, actif, cb) =>
    db.query("UPDATE utilisateurs SET est_actif=? WHERE id=?", [actif, id], cb);

const changeUserRole = (id, role, cb) =>
    db.query("UPDATE utilisateurs SET role=? WHERE id=?", [role, id], cb);

const searchUsers = (query, cb) => {
    const q = `%${query}%`;
    db.query("SELECT id, nom, prenom, email, role, ville, est_actif, cree_le FROM utilisateurs WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR ville LIKE ? ORDER BY cree_le DESC", [q, q, q, q], cb);
};

const getProfesseursEnAttente = (cb) => {
    const sql = `SELECT u.id, u.nom, u.prenom, u.email, u.photo_url, u.ville,
                 pp.bio, pp.specialites, pp.diplomes, pp.experience_annees, pp.est_verifie
                 FROM utilisateurs u LEFT JOIN profil_professeur pp ON u.id=pp.utilisateur_id
                 WHERE u.role='professeur' AND (pp.est_verifie IS NULL OR pp.est_verifie=0)`;
    db.query(sql, cb);
};

const verifyProfesseur = (id, cb) =>
    db.query("UPDATE profil_professeur SET est_verifie=1 WHERE utilisateur_id=?", [id], cb);

const saveResetToken = (email, token, expiry, cb) =>
    db.query("UPDATE utilisateurs SET reset_token=?, reset_token_expiry=? WHERE email=?", [token, expiry, email], cb);

const findByResetToken = (token, cb) =>
    db.query("SELECT * FROM utilisateurs WHERE reset_token=? AND reset_token_expiry > NOW()", [token], cb);

const clearResetToken = (id, cb) =>
    db.query("UPDATE utilisateurs SET reset_token=NULL, reset_token_expiry=NULL WHERE id=?", [id], cb);

module.exports = {
    createUser, findUserByEmail, findUserById, updateUser, changePassword, deleteUser,
    getAllUsers, setUserActive, changeUserRole, searchUsers, getProfesseursEnAttente,
    verifyProfesseur, saveResetToken, findByResetToken, clearResetToken
};
