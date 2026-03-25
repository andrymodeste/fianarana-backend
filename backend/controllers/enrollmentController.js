const enrollmentModel = require("../models/enrollmentModel");

const enrollUser = (req, res) => {

    const { cours_id } = req.body;
    const eleve_id = req.user.id;

    void enrollmentModel.getEnrollment(eleve_id, cours_id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length > 0) {
            return res.status(400).json({
                message: "Vous êtes déjà inscrit à ce cours"
            });
        }

        enrollmentModel.enrollUser({ eleve_id, cours_id }, (err2, result2) => {

            if (err2) {
                return res.status(500).json(err2);
            }

            res.status(201).json({
                message: "Inscription réussie",
                inscriptionId: result2.insertId
            });

        });

    });

};

const getMyCourses = (req, res) => {

    const eleve_id = req.user.id;

    void enrollmentModel.getEnrollmentsByUser(eleve_id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            cours: result
        });

    });

};

module.exports = {
    enrollUser,
    getMyCourses
};
