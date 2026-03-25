const courseModel = require("../models/courseModel");

const createCourse = (req, res) => {
    const { titre, description, matiere_id, niveau_id, est_premium, prix, langue } = req.body;
    let image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null);
    if (!titre || !titre.trim()) return void res.status(400).json({ message: "Le titre est requis" });
    if (!matiere_id || !niveau_id) return void res.status(400).json({ message: "La matière et le niveau sont requis" });
    const course = { professeur_id: req.user.id, matiere_id, niveau_id, titre, description, image_url, est_premium: est_premium || 0, prix: prix || 0, langue: langue || 'fr' };
    void courseModel.createCourse(course, (err, result) => {
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
    void courseModel.getAllCourses(filters, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ cours: result });
    });
};

const getCourseById = (req, res) => {
    void courseModel.getCourseById(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.length) return res.status(404).json({ message: "Cours introuvable" });
        res.json({ cours: result[0] });
    });
};

const getMyCourses = (req, res) => {
    void courseModel.getCoursesByProfesseur(req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ cours: result });
    });
};

const updateCourse = (req, res) => {
    const id = req.params.id;
    // Vérifier le statut du cours avant modification
    void courseModel.getCourseById(id, (err, rows) => {
        if (err) return res.status(500).json(err);
        if (!rows.length) return res.status(404).json({ message: "Cours introuvable" });
        const cours = rows[0];
        // Seuls les cours brouillon, en_attente ou rejeté peuvent être modifiés par le prof
        if (!['brouillon', 'en_attente', 'rejete'].includes(cours.statut)) {
            return res.status(403).json({ message: "Un cours validé ne peut plus être modifié (vous pouvez ajouter des leçons)" });
        }
        const { titre, description, matiere_id, niveau_id, est_premium, prix, langue } = req.body;
        const data = { titre, description, matiere_id, niveau_id, est_premium, prix, langue };
        if (req.file) data.image_url = `/uploads/${req.file.filename}`;
        courseModel.updateCourse(id, data, (err2, result) => {
            if (err2) return res.status(500).json(err2);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Cours introuvable" });
            res.json({ message: "Cours mis à jour" });
        });
    });
};

const deleteCourse = (req, res) => {
    void courseModel.countEnrolledStudents(req.params.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result[0].total > 0) return res.status(400).json({ message: "Impossible de supprimer : des élèves sont inscrits" });
        courseModel.deleteCourse(req.params.id, (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "Cours supprimé" });
        });
    });
};

const submitCourse  = (req, res) => void courseModel.submitCourse(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Cours soumis pour validation" }));
const archiveCourse = (req, res) => void courseModel.archiveCourse(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: "Cours archivé" }));

module.exports = { createCourse, getAllCourses, getCourseById, getMyCourses, updateCourse, deleteCourse, submitCourse, archiveCourse };
