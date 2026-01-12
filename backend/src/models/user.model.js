const db = require("../config/db");

// Create users table if not exists
const createUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) {
      console.log("❌ Error creating users table:", err.message);
    } else {
      console.log("✅ Users table ready");
    }
  });
};

// Register user
const createUser = (userData, callback) => {
  const { username, email, password } = userData;
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  
  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { id: result.insertId, username, email });
    }
  });
};

// Find user by username
const getUserByUsername = (username, callback) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results[0]);
    }
  });
};

// Find user by email
const getUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results[0]);
    }
  });
};

// Find user by id
const getUserById = (id, callback) => {
  const sql = "SELECT id, username, email, full_name, avatar_url, phone, created_at FROM users WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) callback(err, null);
    else callback(null, results[0]);
  });
};

// Lấy mật khẩu theo ID (Dùng riêng cho chức năng đổi mật khẩu)
const getUserPasswordById = (id, callback) => {
  const sql = "SELECT password FROM users WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) callback(err, null);
    else callback(null, results[0]);
  });
};

//Cập nhật thông tin cá nhân
const updateProfile = (id, userData, callback) => {
  const { full_name, avatar_url, phone } = userData;
  // Chỉ update 3 trường này, không đụng đến email/username/password
  const sql = "UPDATE users SET full_name = ?, avatar_url = ?, phone = ? WHERE id = ?";
  db.query(sql, [full_name, avatar_url, phone, id], (err, result) => {
    if (err) callback(err, null);
    else callback(null, result);
  });
};

//  Cập nhật mật khẩu
const updatePassword = (id, newPassword, callback) => {
  const sql = "UPDATE users SET password = ? WHERE id = ?";
  db.query(sql, [newPassword, id], (err, result) => {
    if (err) callback(err, null);
    else callback(null, result);
  });
};

module.exports = {
  createUsersTable,
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById, 
  getUserPasswordById,
  updateProfile,
  updatePassword
};
