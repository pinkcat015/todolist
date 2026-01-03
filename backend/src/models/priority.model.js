const db = require("../config/db");

const Priority = {
  getAll: (cb) => {
    db.query("SELECT * FROM priorities", cb);
  },

  create: (data, cb) => {
    db.query(
      "INSERT INTO priorities (name) VALUES (?)",
      [data.name],
      cb
    );
  },

  update: (id, data, cb) => {
    db.query(
      "UPDATE priorities SET name = ? WHERE id = ?",
      [data.name, id],
      cb
    );
  },

  delete: (id, cb) => {
    db.query("DELETE FROM priorities WHERE id = ?", [id], cb);
  }
};

module.exports = Priority;
