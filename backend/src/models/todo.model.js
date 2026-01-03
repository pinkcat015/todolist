const db = require("../config/db");

/**
 * GET all todos
 */
exports.getAll = (callback) => {
  db.query("SELECT * FROM todos ORDER BY created_at DESC", callback);
};

/**
 * GET todo by id
 */
exports.getById = (id, callback) => {
  db.query("SELECT * FROM todos WHERE id = ?", [id], callback);
};

/**
 * CREATE todo
 */
exports.create = (todo, callback) => {
  db.query("INSERT INTO todos SET ?", todo, callback);
};

/**
 * UPDATE todo
 */
exports.update = (id, data, callback) => {
  db.query("UPDATE todos SET ? WHERE id = ?", [data, id], callback);
};

/**
 * DELETE todo
 */
exports.delete = (id, callback) => {
  db.query("DELETE FROM todos WHERE id = ?", [id], callback);
};
