const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {

    const { nom, prenom, email, password, role, telephone, ville, region } = req.body;

    if (!nom || !prenom || !email || !password) {
        return res.status(400).json({ message: "Nom, prénom, email et mot de passe sont requis" });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            nom,
            prenom,
            email,
            mot_de_passe: hashedPassword,
            role: role || "eleve",
            telephone,
            ville,
            region
        };

        void userModel.createUser(user, (err, result) => {

            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Cet email est déjà utilisé" });
                }
                return res.status(500).json(err);
            }

            const newUser = {
                id: result.insertId,
                nom,
                prenom,
                email,
                role: role || "eleve",
                telephone: telephone || null,
                ville: ville || null,
                region: region || null,
                photo_url: null
            };

            const token = generateToken(newUser);

            res.status(201).json({
                message: "Compte créé avec succès",
                token,
                user: newUser
            });

        });

    } catch (error) {

        res.status(500).json(error);

    }

};

const login = (req, res) => {

    const { email, password } = req.body;

    void userModel.findUserByEmail(email, async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        const user = result[0];

        if (!user.est_actif) {
            return res.status(403).json({
                message: "Ce compte est désactivé"
            });
        }

        const validPassword = await bcrypt.compare(password, user.mot_de_passe);

        if (!validPassword) {
            return res.status(401).json({
                message: "Mot de passe incorrect"
            });
        }

        const token = generateToken(user);

        res.json({
            message: "Connexion réussie",
            token: token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                photo_url: user.photo_url,
                telephone: user.telephone,
                ville: user.ville,
                region: user.region
            }
        });

    });

};

module.exports = {
    register,
    login
};
