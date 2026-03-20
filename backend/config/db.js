const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

// Clever Cloud et autres hébergeurs cloud nécessitent SSL
if (process.env.NODE_ENV === "production") {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(dbConfig);

module.exports = db;
