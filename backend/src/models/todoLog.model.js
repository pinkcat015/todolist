const db = require("../config/db");

const TodoLog = {
  create: (log, callback) => {
    const sql = `
      INSERT INTO todo_logs (todo_id, action)
      VALUES (?, ?)
    `;
    db.query(sql, [log.todo_id, log.action], callback);
  },

  // lấy log theo user
  getLogsByUser: (userId, callback) => {
    const sql = `
      SELECT 
        l.id,
        l.todo_id,
        l.action,
        l.log_time,
        t.title
      FROM todo_logs l
      LEFT JOIN todos t ON l.todo_id = t.id
      WHERE t.user_id = ?
      ORDER BY l.log_time DESC
    `;
    db.query(sql, [userId], callback);
  },

  // lấy toàn bộ log (deprecated - dùng getLogsByUser)
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

  // lấy log theo todo + kiểm tra user ownership
  getByTodoId: (todoId, userId, callback) => {
    const sql = `
      SELECT 
        l.id,
        l.todo_id,
        l.action,
        l.log_time
      FROM todo_logs l
      LEFT JOIN todos t ON l.todo_id = t.id
      WHERE l.todo_id = ? AND t.user_id = ?
      ORDER BY l.log_time DESC
    `;
    db.query(sql, [todoId, userId], callback);
  }
,


deleteById: (logId, userId, callback) => {
    const sql = `
      DELETE todo_logs 
      FROM todo_logs 
      INNER JOIN todos ON todo_logs.todo_id = todos.id 
      WHERE todo_logs.id = ? AND todos.user_id = ?
    `;
    db.query(sql, [logId, userId], callback);
  },


  
clearLogsByUser: (userId, callback) => {
    // Logic: Xóa log nào mà todo_id của nó thuộc về user này
    const sql = `
      DELETE todo_logs 
      FROM todo_logs 
      INNER JOIN todos ON todo_logs.todo_id = todos.id 
      WHERE todos.user_id = ?
    `;
    db.query(sql, [userId], callback);
  }
};

module.exports = TodoLog;



