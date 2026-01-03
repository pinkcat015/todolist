const TodoLog = require("../models/todoLog.model");

/**
 * GET /logs
 */
exports.getAllLogs = (req, res) => {
  TodoLog.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * GET /logs/todo/:todo_id
 */
exports.getLogsByTodo = (req, res) => {
  const todoId = req.params.todo_id;

  TodoLog.getByTodoId(todoId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No logs found for this todo"
      });
    }

    res.json(rows);
  });
};
