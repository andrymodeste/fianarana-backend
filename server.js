const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

// // test DB
// db.query("SELECT 1", (err, result) => {

//     if (err) {
//         console.error("❌ Database connection failed");
//     } else {
//         console.log("✅ Database connected");
//     }

// });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});