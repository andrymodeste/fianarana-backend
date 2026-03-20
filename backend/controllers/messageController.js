const messageModel = require("../models/messageModel");

const sendMessage = (req, res) => {

    const { destinataire_id, cours_id, contenu } = req.body;

    if (!destinataire_id || !contenu) {
        return res.status(400).json({ message: "Le destinataire et le contenu sont requis" });
    }

    const msg = {
        expediteur_id: req.user.id,
        destinataire_id,
        cours_id: cours_id || null,
        contenu
    };

    messageModel.sendMessage(msg, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Message envoyé",
            messageId: result.insertId
        });

    });

};

const getConversation = (req, res) => {

    const { contactId } = req.params;

    messageModel.getConversation(req.user.id, contactId, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        messageModel.markMessagesAsRead(contactId, req.user.id, () => {});

        res.json({
            messages: result
        });

    });

};

const getConversationsList = (req, res) => {

    messageModel.getConversationsList(req.user.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            conversations: result
        });

    });

};

module.exports = {
    sendMessage,
    getConversation,
    getConversationsList
};
