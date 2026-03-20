const db = require("../config/db");

const createQuestion = (question, callback) => {

    const sql = `
    INSERT INTO questions (quiz_id, enonce, type_question, points, ordre, image_url, explication_globale)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [question.quiz_id, question.enonce, question.type_question, question.points || 1, question.ordre, question.image_url || null, question.explication_globale || null],
        callback
    );

};

const createOption = (option, callback) => {

    const sql = `
    INSERT INTO options_reponse (question_id, texte, est_correcte, explication, ordre)
    VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [option.question_id, option.texte, option.est_correcte, option.explication || null, option.ordre],
        callback
    );

};

module.exports = {
    createQuestion,
    createOption
};
