const badgeModel = require("../models/badgeModel");

const getAllBadges = (req, res) => {

    badgeModel.getAllBadges((err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            badges: result
        });

    });

};

const getMyBadges = (req, res) => {

    badgeModel.getBadgesByEleve(req.user.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            badges: result
        });

    });

};

module.exports = {
    getAllBadges,
    getMyBadges
};
