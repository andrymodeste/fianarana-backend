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

    void messageModel.sendMessage(msg, (err, result) => {

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

    void messageModel.getConversation(req.user.id, contactId, (err, result) => {

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

    void messageModel.getConversationsList(req.user.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            conversations: result
        });

    });

};

const getContacts = (req, res) => {
    void messageModel.getContactsForUser(req.user.id, req.user.role, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ contacts: result });
    });
};

// Modifier un message (seulement l'expéditeur)
const updateMsg = (req, res) => {
    const { id } = req.params;
    const { contenu } = req.body;
    if (!contenu || !contenu.trim()) return void res.status(400).json({ message: "Le contenu est requis" });

    void messageModel.updateMessage(id, req.user.id, contenu.trim(), (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(403).json({ message: "Action non autorisée" });
        res.json({ message: "Message modifié" });
    });
};

// Retirer pour moi
const deleteForMe = (req, res) => {
    const { id } = req.params;
    void messageModel.deleteForMe(id, req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(403).json({ message: "Action non autorisée" });
        res.json({ message: "Message retiré" });
    });
};

// Supprimer pour tout le monde (seulement l'expéditeur)
const deleteForAll = (req, res) => {
    const { id } = req.params;
    void messageModel.deleteForAll(id, req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(403).json({ message: "Action non autorisée" });
        res.json({ message: "Message supprimé pour tous" });
    });
};

module.exports = {
    sendMessage,
    getConversation,
    getConversationsList,
    getContacts,
    updateMsg,
    deleteForMe,
    deleteForAll
};
