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

exports.clearLogs = (req, res) => {
  const userId = req.user.id;
  
  TodoLog.clearLogsByUser(userId, (err, result) => {
    if (err) {
      console.error("Clear logs error:", err);
      return res.status(500).json({ error: "Lỗi khi xóa lịch sử" });
    }
    
    return res.status(200).json({ 
      message: "Đã xóa toàn bộ lịch sử thành công",
      affectedRows: result.affectedRows 
    });
  });
};
// Remove deprecated getAllLogs if not needed
exports.deleteLog = (req, res) => {
  const logId = req.params.id;
  const userId = req.user.id;

  TodoLog.deleteById(logId, userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Log không tồn tại hoặc bạn không có quyền xóa." });
    }

    res.json({ message: "Đã xóa log thành công." });
  });
};