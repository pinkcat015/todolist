const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.query("SELECT 1", (err) => {
  if (err) {
    console.log("❌ Kết nối MySQL thất bại:", err.message);
  } else {
    console.log("✅ Kết nối MySQL thành công");
  }
});

module.exports = db;
