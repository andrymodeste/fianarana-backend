const certificatModel = require("../models/certificatModel");

const getMyCertificats = (req, res) => {

    void certificatModel.getCertificatsByEleve(req.user.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            certificats: result
        });

    });

};

const verifyCertificat = (req, res) => {

    const { code } = req.params;

    void certificatModel.verifyCertificat(code, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Certificat introuvable" });
        }

        res.json({
            certificat: result[0]
        });

    });

};

module.exports = {
    getMyCertificats,
    verifyCertificat
};
