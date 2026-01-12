// ==================== IMPORTS ====================
const Todo = require("../models/todo.model");
const TodoLog = require("../models/todoLog.model");

// ==================== CONTROLLERS ====================

/**
 * GET /todos
 * Pagination + filter + search + meta
 */
exports.getTodos = (req, res) => {
  const userId = req.userId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    q: req.query.q,
    status: req.query.status,
    priority: req.query.priority,
    category: req.query.category,
    completed:
      req.query.completed !== undefined
        ? req.query.completed === "true"
        : undefined,
    userId: userId
  };

  Todo.getWithPaginationAndFilter(options, (err, result) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: err.message
      });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  });
};

/**
 * GET /todos/:id
 */
exports.getTodoById = (req, res) => {
  const userId = req.userId;
  Todo.getById(req.params.id, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    res.json(rows[0]);
  });
};

/**
 * POST /todos
 */
exports.createTodo = (req, res) => {
  const userId = req.userId;
  const {
    title,
    description,
    priority_id,
    category_id,
    deadline
  } = req.body;

  if (!title)
    return res.status(400).json({ message: "Title is required" });

  const todo = {
    title,
    description: description || null,
    priority_id: priority_id || 1,
    category_id: category_id || null,
    deadline: deadline || null,
    user_id: userId,
    status: "pending",
    completed: false
  };

  Todo.create(todo, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    TodoLog.create(
      {
        todo_id: result.insertId,
        action: "create"
      },
      () => {}
    );

    res.status(201).json({
      message: "Todo created",
      id: result.insertId
    });
  });
};

/**
 * PUT /todos/:id
 */
exports.updateTodo = (req, res) => {
  const userId = req.userId; // Lấy từ token
  const id = req.params.id;

  // Gọi Model (truyền thêm userId vào tham số thứ 2)
  Todo.update(id, userId, req.body, (err, result) => {
    if (err) {
      console.error("Lỗi Update:", err);
      return res.status(500).json({ error: err.message });
    }

    // result của câu lệnh UPDATE chứa thông tin affectedRows
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy công việc hoặc bạn không có quyền sửa." });
    }

    // Ghi Log
    TodoLog.create({ todo_id: id, action: "update" }, () => {});

    res.json({ message: "Todo updated successfully" });
  });
};

/**
 * DELETE /todos/:id
 */
exports.deleteTodo = (req, res) => {
  const userId = req.userId;
  const id = req.params.id;

  Todo.getById(id, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    TodoLog.create(
      {
        todo_id: id,
        action: "delete"
      },
      () => {}
    );

    Todo.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Todo deleted" });
    });
  });
};

/**
 * PATCH /todos/:id/complete
 */
exports.completeTodo = (req, res) => {
  const userId = req.userId;
  const id = req.params.id;

  Todo.getById(id, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    Todo.update(
      id,
      { completed: true, status: "completed" },
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        TodoLog.create(
          {
            todo_id: id,
            action: "complete"
          },
          () => {}
        );

        res.json({ message: "Todo completed" });
      }
    );
  });
};

/**
 * PATCH /todos/:id/priority
 * 🔒 FIXED: Thêm ownership check
 */
exports.updateTodoPriority = (req, res) => {
  const userId = req.userId; // ← THÊM
  const { id } = req.params;
  const { priority_id } = req.body;

  if (!priority_id)
    return res.status(400).json({ message: "priority_id is required" });

  // ← CHECK OWNERSHIP TRƯỚC KHI UPDATE
  Todo.getById(id, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    Todo.updatePriority(id, priority_id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      TodoLog.create(
        {
          todo_id: id,
          action: `change priority to ${priority_id}`
        },
        () => {}
      );

      res.json({ message: "Priority updated" });
    });
  });
};

/**
 * PATCH /todos/:id/category
 * 🔒 FIXED: Thêm ownership check
 */
exports.updateTodoCategory = (req, res) => {
  const userId = req.userId; // ← THÊM
  const todoId = req.params.id;
  const { category_id } = req.body;

  if (!category_id) {
    return res.status(400).json({ message: "category_id is required" });
  }

  // ← CHECK OWNERSHIP TRƯỚC KHI UPDATE
  Todo.getById(todoId, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    Todo.updateCategory(todoId, category_id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      TodoLog.create(
        {
          todo_id: todoId,
          action: `change category to ${category_id}`
        },
        () => {}
      );

      res.json({ message: "Category updated" });
    });
  });
};

