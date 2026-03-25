const subscriptionModel = require("../models/subscriptionModel");
const planModel = require("../models/planModel");

const subscribe = (req, res) => {

    const { plan_id } = req.body;
    const utilisateur_id = req.user.id;

    void planModel.getPlanById(plan_id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Plan introuvable"
            });
        }

        const plan = result[0];

        const debut = new Date().toISOString().split("T")[0];
        const end = new Date();
        end.setDate(end.getDate() + plan.duree_jours);
        const fin = end.toISOString().split("T")[0];

        const subscription = {
            utilisateur_id,
            plan_id,
            debut,
            fin
        };

        subscriptionModel.createSubscription(subscription, (err2, result2) => {

            if (err2) {
                return res.status(500).json(err2);
            }

            res.status(201).json({
                message: "Abonnement souscrit avec succès",
                abonnementId: result2.insertId,
                debut,
                fin
            });

        });

    });

};

const getMySubscription = (req, res) => {

    const utilisateur_id = req.user.id;

    void subscriptionModel.getActiveSubscription(utilisateur_id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Aucun abonnement actif"
            });
        }

        res.json({
            abonnement: result[0]
        });

    });

};

module.exports = {
    subscribe,
    getMySubscription
};
