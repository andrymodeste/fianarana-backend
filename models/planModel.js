const db = require("../config/db");

const getAllPlans = (callback) => {

    const sql = "SELECT * FROM plans_abonnement WHERE est_actif = 1 ORDER BY prix ASC";

    db.query(sql, callback);

};

const getPlanById = (id, callback) => {

    const sql = "SELECT * FROM plans_abonnement WHERE id = ?";

    db.query(sql, [id], callback);

};

module.exports = {
    getAllPlans,
    getPlanById
};
