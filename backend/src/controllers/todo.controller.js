const Todo = require("../models/todo.model");
/**
 * GET /todos
 */
exports.getTodos = (req, res) => {
  Todo.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * GET /todos/:id
 */
exports.getTodoById = (req, res) => {
  Todo.getById(req.params.id, (err, rows) => {
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
  const { title } = req.body;

  if (!title)
    return res.status(400).json({ message: "Title is required" });

  const todo = {
    title,
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
  const id = req.params.id;

  Todo.getById(id, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    Todo.update(id, req.body, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // ghi log
      TodoLog.create(
        {
          todo_id: id,
          action: "update"
        },
        () => {}
      );

      res.json({ message: "Todo updated" });
    });
  });
};


/**
 * DELETE /todos/:id
 */
exports.deleteTodo = (req, res) => {
  const id = req.params.id;

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
};


// COMPLETE TODO --> LOG  PATCH /todos/:id/complete
exports.completeTodo = (req, res) => {
  const id = req.params.id;

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
};


