const lessonProgressModel = require("../models/lessonProgressModel");

const updateProgress = (req, res) => {

    const { lecon_id, est_terminee, temps_regarde, derniere_position } = req.body;
    const eleve_id = req.user.id;

    const progress = {
        eleve_id,
        lecon_id,
        est_terminee: est_terminee || 0,
        temps_regarde: temps_regarde || 0,
        derniere_position: derniere_position || 0
    };

    void lessonProgressModel.upsertProgress(progress, (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: "Progression mise à jour"
        });

    });

};

const getCourseProgress = (req, res) => {

    const { coursId } = req.params;
    const eleve_id = req.user.id;

    void lessonProgressModel.getProgressByCourse(eleve_id, coursId, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            progression: result
        });

    });

};

module.exports = {
    updateProgress,
    getCourseProgress
};
