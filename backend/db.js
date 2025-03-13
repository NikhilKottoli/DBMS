const mysql = require("mysql2/promise");
require("dotenv").config();

// Create MySQL connection pool (recommended for better performance)
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "mydatabase",
  waitForConnections: true,
  connectionLimit: 10,  // Limits max concurrent connections
  queueLimit: 0,
});

const testDBConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

testDBConnection();

module.exports = db;
