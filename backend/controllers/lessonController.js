const lessonModel = require("../models/lessonModel");
const db = require("../config/db");
const upload = require("../middleware/uploadMiddleware");

const createLesson = (req, res) => {
    const { cours_id, titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable } = req.body;
    if (!cours_id || !titre || ordre === undefined) return void res.status(400).json({ message: "Le cours, le titre et l'ordre sont requis" });

    // Vérifier le statut du cours pour déterminer le statut de la leçon
    void db.query("SELECT statut FROM cours WHERE id=?", [cours_id], (err, rows) => {
        if (err) return res.status(500).json(err);
        if (!rows.length) return res.status(404).json({ message: "Cours introuvable" });

        // Si le cours est déjà validé, la nouvelle leçon doit être validée par l'admin
        const coursStatut = rows[0].statut;
        const leconStatut = coursStatut === 'valide' ? 'en_attente' : 'valide';

        const lesson = { cours_id, titre, description, video_url, pdf_url, ordre, duree_minutes: duree_minutes || 0, est_gratuite: est_gratuite || 0, est_telechargeable: est_telechargeable !== undefined ? est_telechargeable : 1, statut: leconStatut };
        if (req.files) {
            if (req.files.video) lesson.video_url = req.files.video[0].path || `/uploads/${req.files.video[0].filename}`;
            if (req.files.pdf)   lesson.pdf_url   = req.files.pdf[0].path || `/uploads/${req.files.pdf[0].filename}`;
        }
        lessonModel.createLesson(lesson, (err2, result) => {
            if (err2) return res.status(500).json(err2);
            const msg = leconStatut === 'en_attente'
                ? "Leçon créée — en attente de validation par l'admin"
                : "Leçon créée avec succès";
            res.status(201).json({ message: msg, leconId: result.insertId, statut: leconStatut });
        });
    });
};

const getLessonsByCourse = (req, res) => {
    void lessonModel.getLessonsByCourse(req.params.coursId, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ lecons: result });
    });
};

const getLessonById = (req, res) => {
    void lessonModel.getLessonById(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.length) return res.status(404).json({ message: "Leçon introuvable" });
        res.json({ lecon: result[0] });
    });
};

const updateLesson = (req, res) => {
    const { titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable } = req.body;
    const data = { titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable };
    if (req.files) {
        if (req.files.video) data.video_url = req.files.video[0].path || `/uploads/${req.files.video[0].filename}`;
        if (req.files.pdf)   data.pdf_url   = req.files.pdf[0].path || `/uploads/${req.files.pdf[0].filename}`;
    }
    void lessonModel.updateLesson(req.params.id, data, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Leçon introuvable" });
        res.json({ message: "Leçon mise à jour" });
    });
};

const deleteLesson = (req, res) => {
    void lessonModel.deleteLesson(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Leçon introuvable" });
        res.json({ message: "Leçon supprimée" });
    });
};

const reorderLessons = (req, res) => {
    const { lessons } = req.body; // [{id, ordre}, ...]
    if (!lessons || !Array.isArray(lessons)) return void res.status(400).json({ message: "Format invalide" });
    void lessonModel.reorderLessons(lessons, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Ordre mis à jour" });
    });
};

module.exports = { createLesson, getLessonsByCourse, getLessonById, updateLesson, deleteLesson, reorderLessons };
