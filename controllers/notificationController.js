const notificationModel = require("../models/notificationModel");
const db = require("../config/db");

const getMyNotifications = (req, res) => {
    void notificationModel.getNotificationsByUser(req.user.id, (err, result) => {
        if (err) return res.status(500).json(err);
        const unread = result.filter(n => !n.est_lue).length;
        res.json({ notifications: result, unread });
    });
};

const markAsRead = (req, res) => {
    void notificationModel.markAsRead(req.params.id, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Notification marquée comme lue" });
    });
};

const markAllAsRead = (req, res) => {
    void notificationModel.markAllAsRead(req.user.id, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Toutes les notifications marquées comme lues" });
    });
};

const deleteNotification = (req, res) => {
    void db.query("DELETE FROM notifications WHERE id=? AND utilisateur_id=?", [req.params.id, req.user.id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Notification introuvable" });
        res.json({ message: "Notification supprimée" });
    });
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
