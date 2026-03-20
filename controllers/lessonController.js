const lessonModel = require("../models/lessonModel");
const upload = require("../middleware/uploadMiddleware");

const createLesson = (req, res) => {
    const { cours_id, titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable } = req.body;
    if (!cours_id || !titre || ordre === undefined) return res.status(400).json({ message: "Le cours, le titre et l'ordre sont requis" });
    const lesson = { cours_id, titre, description, video_url, pdf_url, ordre, duree_minutes: duree_minutes || 0, est_gratuite: est_gratuite || 0, est_telechargeable: est_telechargeable !== undefined ? est_telechargeable : 1 };
    if (req.files) {
        if (req.files.video) lesson.video_url = `/uploads/${req.files.video[0].filename}`;
        if (req.files.pdf)   lesson.pdf_url   = `/uploads/${req.files.pdf[0].filename}`;
    }
    lessonModel.createLesson(lesson, (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Leçon créée avec succès", leconId: result.insertId });
    });
};

const getLessonsByCourse = (req, res) => {
    lessonModel.getLessonsByCourse(req.params.coursId, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ lecons: result });
    });
};

const getLessonById = (req, res) => {
    lessonModel.getLessonById(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.length) return res.status(404).json({ message: "Leçon introuvable" });
        res.json({ lecon: result[0] });
    });
};

const updateLesson = (req, res) => {
    const { titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable } = req.body;
    const data = { titre, description, video_url, pdf_url, ordre, duree_minutes, est_gratuite, est_telechargeable };
    if (req.files) {
        if (req.files.video) data.video_url = `/uploads/${req.files.video[0].filename}`;
        if (req.files.pdf)   data.pdf_url   = `/uploads/${req.files.pdf[0].filename}`;
    }
    lessonModel.updateLesson(req.params.id, data, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Leçon introuvable" });
        res.json({ message: "Leçon mise à jour" });
    });
};

const deleteLesson = (req, res) => {
    lessonModel.deleteLesson(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Leçon introuvable" });
        res.json({ message: "Leçon supprimée" });
    });
};

const reorderLessons = (req, res) => {
    const { lessons } = req.body; // [{id, ordre}, ...]
    if (!lessons || !Array.isArray(lessons)) return res.status(400).json({ message: "Format invalide" });
    lessonModel.reorderLessons(lessons, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Ordre mis à jour" });
    });
};

module.exports = { createLesson, getLessonsByCourse, getLessonById, updateLesson, deleteLesson, reorderLessons };
