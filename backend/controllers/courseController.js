const courseModel = require("../models/courseModel");

const createCourse = (req, res) => {
    const { titre, description, matiere_id, niveau_id, est_premium, prix, langue } = req.body;
    let image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null);
    if (!titre || !titre.trim()) return res.status(400).json({ message: "Le titre est requis" });
    if (!matiere_id || !niveau_id) return res.status(400).json({ message: "La matière et le niveau sont requis" });
    const course = { professeur_id: req.user.id, matiere_id, niveau_id, titre, description, image_url, est_premium: est_premium || 0, prix: prix || 0, langue: langue || 'fr' };
    courseModel.createCourse(course, (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Cours créé avec succès", coursId: result.insertId });
    });
};

const getAllCourses = (req, res) => {
    const filters = {
        matiere_id: req.query.matiere_id,
        niveau_id:  req.query.niveau_id,
        langue:     req.query.langue,
        gratuit:    req.query.gratuit === "1",
        search:     req.query.search
    };
    courseModel.getAllCourses(filters, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ cours: result });
    });
};

const getCourseById = (req, res) => {
    courseModel.getCourseById(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.length) return res.status(404).json({ message: "Cours introuvable" });
        res.json({ cours: result[0] });
    });
};

const getMyCourses = (req, res) => {
    courseModel.getCoursesByProfesseur(req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ cours: result });
    });
};

const updateCourse = (req, res) => {
    const { titre, description, matiere_id, niveau_id, est_premium, prix, langue } = req.body;
    const data = { titre, description, matiere_id, niveau_id, est_premium, prix, langue };
    if (req.file) data.image_url = `/uploads/${req.file.filename}`;
    courseModel.updateCourse(req.params.id, data, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Cours introuvable" });
        res.json({ message: "Cours mis à jour" });
    });
};

const deleteCourse = (req, res) => {
    courseModel.countEnrolledStudents(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result[0].total > 0) return res.status(400).json({ message: "Impossible de supprimer : des élèves sont inscrits" });
        courseModel.deleteCourse(req.params.id, (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "Cours supprimé" });
        });
    });
};

const submitCourse  = (req, res) => courseModel.submitCourse(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Cours soumis pour validation" }));
const archiveCourse = (req, res) => courseModel.archiveCourse(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Cours archivé" }));

module.exports = { createCourse, getAllCourses, getCourseById, getMyCourses, updateCourse, deleteCourse, submitCourse, archiveCourse };
