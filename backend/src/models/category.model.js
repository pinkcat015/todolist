const db = require("../config/db");

const Category = {
  getAll: (callback) => {
    db.query("SELECT * FROM categories", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM categories WHERE id = ?", [id], callback);
  },

  create: (data, callback) => {
    const sql = `
      INSERT INTO categories (name, user_id)
      VALUES (?, ?)
    `;
    db.query(sql, [data.name, data.user_id], callback);
  },

  update: (id, data, callback) => {
    const sql = `
      UPDATE categories
      SET name = ?
      WHERE id = ?
    `;
    db.query(sql, [data.name, id], callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM categories WHERE id = ?", [id], callback);
  }
};

module.exports = Category;
