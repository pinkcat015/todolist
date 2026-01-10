const db = require("../config/db");

const Category = {
  /**
   * Lấy categories theo user_id
   */
  getByUserId: (userId, callback) => {
    const sql = `
      SELECT * FROM categories 
      WHERE user_id = ? 
      ORDER BY name ASC
    `;
    db.query(sql, [userId], callback);
  },

  /**
   * Lấy category theo ID + check user_id (ownership)
   */
  getById: (id, userId, callback) => {
    const sql = `
      SELECT * FROM categories 
      WHERE id = ? AND user_id = ?
    `;
    db.query(sql, [id, userId], callback);
  },

  /**
   * Tạo category mới (với user_id)
   */
  create: (data, callback) => {
    const sql = `
      INSERT INTO categories (name, user_id) 
      VALUES (?, ?)
    `;
    db.query(sql, [data.name, data.user_id], callback);
  },

  /**
   * Cập nhật category
   */
  update: (id, data, callback) => {
    const sql = `
      UPDATE categories 
      SET name = ? 
      WHERE id = ?
    `;
    db.query(sql, [data.name, id], callback);
  },

  /**
   * Xóa category
   */
  delete: (id, callback) => {
    const sql = "DELETE FROM categories WHERE id = ?";
    db.query(sql, [id], callback);
  }
};

module.exports = Category;