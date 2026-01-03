const db = require("../config/db");

const TodoLog = {
  create: (log, callback) => {
    const sql = `
      INSERT INTO todo_logs (todo_id, action)
      VALUES (?, ?)
    `;
    db.query(sql, [log.todo_id, log.action], callback);
  },

  // lấy toàn bộ log
  getAll: (callback) => {
    const sql = `
      SELECT 
        l.id,
        l.todo_id,
        l.action,
        l.log_time,
        t.title
      FROM todo_logs l
      LEFT JOIN todos t ON l.todo_id = t.id
      ORDER BY l.log_time DESC
    `;
    db.query(sql, callback);
  },

  // lấy log theo todo
  getByTodoId: (todoId, callback) => {
    const sql = `
      SELECT 
        id,
        todo_id,
        action,
        log_time
      FROM todo_logs
      WHERE todo_id = ?
      ORDER BY log_time DESC
    `;
    db.query(sql, [todoId], callback);
  }
};

module.exports = TodoLog;
