const db = require("../config/db");

const createQuiz = (quiz, callback) => {

    const sql = `
    INSERT INTO quiz (lecon_id, titre, description, duree_secondes, nombre_tentatives, score_minimum)
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [quiz.lecon_id, quiz.titre, quiz.description || null, quiz.duree_secondes || null, quiz.nombre_tentatives || 3, quiz.score_minimum || 50],
        callback
    );

};

const getQuizByLecon = (leconId, callback) => {

    const sql = "SELECT * FROM quiz WHERE lecon_id = ? AND est_actif = 1";

    db.query(sql, [leconId], callback);

};

const getQuizById = (id, callback) => {

    const sql = "SELECT * FROM quiz WHERE id = ?";

    db.query(sql, [id], callback);

};

const getQuizWithQuestions = (quizId, callback) => {

    const sql = `
    SELECT q.*, qst.id AS question_id, qst.enonce, qst.type_question, qst.points, qst.ordre AS question_ordre,
           qst.image_url AS question_image, qst.explication_globale,
           o.id AS option_id, o.texte AS option_texte, o.est_correcte, o.explication AS option_explication, o.ordre AS option_ordre
    FROM quiz q
    LEFT JOIN questions qst ON qst.quiz_id = q.id
    LEFT JOIN options_reponse o ON o.question_id = qst.id
    WHERE q.id = ?
    ORDER BY qst.ordre ASC, o.ordre ASC
    `;

    db.query(sql, [quizId], callback);

};

module.exports = {
    createQuiz,
    getQuizByLecon,
    getQuizById,
    getQuizWithQuestions
};
