const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

// Empêcher le crash du serveur sur les erreurs non fatales
process.on("uncaughtException", (err) => {
    if (err.code === "ERR_HTTP_HEADERS_SENT") {
        console.error("Warning: headers already sent (ignored)", err.message);
        return; // Ne pas crasher
    }
    console.error("Uncaught exception:", err);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});