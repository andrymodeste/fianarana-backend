const quizModel = require("../models/quizModel");
const questionModel = require("../models/questionModel");
const resultatQuizModel = require("../models/resultatQuizModel");

const createQuiz = (req, res) => {

    const { lecon_id, titre, description, duree_secondes, nombre_tentatives, score_minimum } = req.body;

    if (!lecon_id || !titre) {
        return res.status(400).json({ message: "La leçon et le titre sont requis" });
    }

    void quizModel.createQuiz({ lecon_id, titre, description, duree_secondes, nombre_tentatives, score_minimum }, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Quiz créé avec succès",
            quizId: result.insertId
        });

    });

};

const getQuizByLecon = (req, res) => {

    const { leconId } = req.params;

    void quizModel.getQuizByLecon(leconId, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            quiz: result
        });

    });

};

const getQuizWithQuestions = (req, res) => {

    const { quizId } = req.params;

    void quizModel.getQuizWithQuestions(quizId, (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "Quiz introuvable" });
        }

        const quiz = {
            id: rows[0].id,
            lecon_id: rows[0].lecon_id,
            titre: rows[0].titre,
            description: rows[0].description,
            duree_secondes: rows[0].duree_secondes,
            nombre_tentatives: rows[0].nombre_tentatives,
            score_minimum: rows[0].score_minimum,
            questions: []
        };

        const questionsMap = {};

        rows.forEach(row => {
            if (!row.question_id) return;

            if (!questionsMap[row.question_id]) {
                questionsMap[row.question_id] = {
                    id: row.question_id,
                    enonce: row.enonce,
                    type_question: row.type_question,
                    points: row.points,
                    ordre: row.question_ordre,
                    image_url: row.question_image,
                    explication_globale: row.explication_globale,
                    options: []
                };
                quiz.questions.push(questionsMap[row.question_id]);
            }

            if (row.option_id) {
                questionsMap[row.question_id].options.push({
                    id: row.option_id,
                    texte: row.option_texte,
                    est_correcte: row.est_correcte,
                    explication: row.option_explication,
                    ordre: row.option_ordre
                });
            }
        });

        res.json({ quiz });

    });

};

const addQuestion = (req, res) => {

    const { quiz_id, enonce, type_question, points, ordre, image_url, explication_globale, options } = req.body;

    if (!quiz_id || !enonce || !type_question) {
        return res.status(400).json({ message: "Le quiz, l'énoncé et le type sont requis" });
    }

    void questionModel.createQuestion({ quiz_id, enonce, type_question, points, ordre, image_url, explication_globale }, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        const questionId = result.insertId;

        if (options && options.length > 0) {
            let completed = 0;
            options.forEach((opt, index) => {
                questionModel.createOption({
                    question_id: questionId,
                    texte: opt.texte,
                    est_correcte: opt.est_correcte,
                    explication: opt.explication,
                    ordre: index + 1
                }, (err2) => {
                    if (err2) return res.status(500).json(err2);
                    completed++;
                    if (completed === options.length) {
                        res.status(201).json({ message: "Question ajoutée avec succès", questionId });
                    }
                });
            });
        } else {
            res.status(201).json({ message: "Question ajoutée avec succès", questionId });
        }

    });

};

const submitQuiz = (req, res) => {

    const { quiz_id, reponses, duree_secondes } = req.body;
    const eleve_id = req.user.id;

    void quizModel.getQuizById(quiz_id, (err, quizRows) => {

        if (err) return res.status(500).json(err);
        if (quizRows.length === 0) return res.status(404).json({ message: "Quiz introuvable" });

        const quiz = quizRows[0];

        resultatQuizModel.countTentatives(eleve_id, quiz_id, (err2, countRows) => {

            if (err2) return res.status(500).json(err2);

            const tentatives = countRows[0].total;
            if (tentatives >= quiz.nombre_tentatives) {
                return res.status(400).json({ message: "Nombre maximum de tentatives atteint" });
            }

            quizModel.getQuizWithQuestions(quiz_id, (err3, rows) => {

                if (err3) return res.status(500).json(err3);

                const questionsMap = {};
                rows.forEach(row => {
                    if (!row.question_id) return;
                    if (!questionsMap[row.question_id]) {
                        questionsMap[row.question_id] = { points: row.points, options: [] };
                    }
                    if (row.option_id) {
                        questionsMap[row.question_id].options.push({
                            id: row.option_id,
                            est_correcte: row.est_correcte
                        });
                    }
                });

                let pointsObtenus = 0;
                let pointsTotal = 0;

                Object.keys(questionsMap).forEach(qId => {
                    pointsTotal += questionsMap[qId].points;
                    const reponse = reponses.find(r => r.question_id === Number(qId));
                    if (reponse && reponse.option_id) {
                        const correctOption = questionsMap[qId].options.find(o => o.est_correcte);
                        if (correctOption && correctOption.id === reponse.option_id) {
                            pointsObtenus += questionsMap[qId].points;
                        }
                    }
                });

                const score = pointsTotal > 0 ? (pointsObtenus / pointsTotal) * 100 : 0;
                const estValide = score >= quiz.score_minimum ? 1 : 0;

                const resultat = {
                    eleve_id,
                    quiz_id,
                    score,
                    points_obtenus: pointsObtenus,
                    points_total: pointsTotal,
                    est_valide: estValide,
                    tentative_num: tentatives + 1,
                    duree_secondes
                };

                resultatQuizModel.createResultat(resultat, (err4, result4) => {

                    if (err4) return res.status(500).json(err4);

                    res.json({
                        message: estValide ? "Quiz réussi !" : "Quiz échoué",
                        resultat: {
                            id: result4.insertId,
                            score,
                            points_obtenus: pointsObtenus,
                            points_total: pointsTotal,
                            est_valide: estValide,
                            tentative_num: tentatives + 1
                        }
                    });

                });

            });

        });

    });

};

module.exports = {
    createQuiz,
    getQuizByLecon,
    getQuizWithQuestions,
    addQuestion,
    submitQuiz
};
