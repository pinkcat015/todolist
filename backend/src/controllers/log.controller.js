const TodoLog = require("../models/todoLog.model");

/**
 * GET /logs - Lấy logs theo user đang đăng nhập
 */
exports.getLogsByUser = (req, res) => {
  const userId = req.user.id; // từ authMiddleware
  
  TodoLog.getLogsByUser(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []); // Always return array
  });
};

/**
 * GET /logs/todo/:todo_id
 */
exports.getLogsByTodo = (req, res) => {
  const todoId = req.params.todo_id;
  const userId = req.user.id; // FIX: Add userId

  TodoLog.getByTodoId(todoId, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No logs found for this todo"
      });
    }

    res.json(rows);
  });
};

// Remove deprecated getAllLogs if not needed