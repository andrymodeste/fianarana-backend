require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes             = require("./routes/authRoutes");
const userRoutes             = require("./routes/userRoutes");
const courseRoutes           = require("./routes/courseRoutes");
const lessonRoutes           = require("./routes/lessonRoutes");
const enrollmentRoutes       = require("./routes/enrollmentRoutes");
const lessonProgressRoutes   = require("./routes/lessonProgressRoutes");
const subscriptionRoutes     = require("./routes/subscriptionRoutes");
const planRoutes             = require("./routes/planRoutes");
const categorieRoutes        = require("./routes/categorieRoutes");
const niveauRoutes           = require("./routes/niveauRoutes");
const quizRoutes             = require("./routes/quizRoutes");
const notificationRoutes     = require("./routes/notificationRoutes");
const messageRoutes          = require("./routes/messageRoutes");
const avisRoutes             = require("./routes/avisRoutes");
const certificatRoutes       = require("./routes/certificatRoutes");
const badgeRoutes            = require("./routes/badgeRoutes");
const adminRoutes            = require("./routes/adminRoutes");
const profilProfesseurRoutes = require("./routes/profilProfesseurRoutes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",        authRoutes);
app.use("/api/utilisateurs", userRoutes);
app.use("/api/cours",       courseRoutes);
app.use("/api/lecons",      lessonRoutes);
app.use("/api/inscriptions", enrollmentRoutes);
app.use("/api/progression", lessonProgressRoutes);
app.use("/api/abonnements", subscriptionRoutes);
app.use("/api/plans",       planRoutes);
app.use("/api/categories",  categorieRoutes);
app.use("/api/niveaux",     niveauRoutes);
app.use("/api/quiz",        quizRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages",    messageRoutes);
app.use("/api/avis",        avisRoutes);
app.use("/api/certificats", certificatRoutes);
app.use("/api/badges",      badgeRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/professeurs", profilProfesseurRoutes);

app.get("/", (_req, res) => res.send("Fianarana API running"));

module.exports = app;
