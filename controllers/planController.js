const planModel = require("../models/planModel");

const getAllPlans = (req, res) => {

    void planModel.getAllPlans((err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            plans: result
        });

    });

};

module.exports = {
    getAllPlans
};
