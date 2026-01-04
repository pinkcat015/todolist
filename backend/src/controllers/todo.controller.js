// ==================== IMPORTS ====================
const Todo = require("../models/todo.model");
const TodoLog = require("../models/todoLog.model");

// ==================== CONTROLLERS ====================

/**
 * GET /todos
 * Lấy danh sách tất cả todos với thông tin priority và category
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Array} Danh sách todos kèm thông tin chi tiết
 */
/**
 * GET /todos
 * Pagination + filter + search + meta
 */
exports.getTodos = (req, res) => {
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
        : undefined
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
 * Lấy chi tiết 1 todo theo ID
 * @param {Object} req - Request object, req.params.id = ID của todo
 * @param {Object} res - Response object
 * @returns {Object} Thông tin chi tiết của todo hoặc lỗi nếu không tìm thấy
 */
exports.getTodoById = (req, res) => {
  // Lấy ID từ URL parameters
  Todo.getById(req.params.id, (err, rows) => {
    // Nếu có lỗi từ database, trả về lỗi 500
    if (err) return res.status(500).json({ error: err.message });
    // Nếu không tìm thấy todo, trả về lỗi 404
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    // Trả về chi tiết todo (lấy phần tử đầu tiên của rows)
    res.json(rows[0]);
  });
};

/**
 * POST /todos
 * Tạo 1 todo mới
 * @param {Object} req - Request object với body chứa: title, description, priority_id, category_id, deadline
 * @param {Object} res - Response object
 * @returns {Object} Message và ID của todo vừa tạo
 */
exports.createTodo = (req, res) => {
  // Destructure dữ liệu từ request body
  const {
    title,
    description,
    priority_id,
    category_id,
    deadline
  } = req.body;

  // Validate: title là bắt buộc
  if (!title)
    return res.status(400).json({ message: "Title is required" });

  // Tạo object todo với giá trị mặc định
  const todo = {
    title,
    description: description || null,  // Nếu không có description, gán null
    priority_id: priority_id || 1,     // Mặc định priority_id = 1 (ưu tiên thấp)
    category_id: category_id || null,  // Nếu không có category_id, gán null
    deadline: deadline || null,        // Nếu không có deadline, gán null
    status: "pending",                 // Trạng thái mặc định là pending
    completed: false                   // Chưa hoàn thành
  };

  // Gọi model để thêm todo vào database
  Todo.create(todo, (err, result) => {
    // Nếu có lỗi, trả về lỗi 500
    if (err) return res.status(500).json({ error: err.message });

    // Ghi log hành động tạo todo
    TodoLog.create(
      {
        todo_id: result.insertId,  // ID của todo vừa tạo
        action: "create"           // Hành động: tạo mới
      },
      () => {}  // Callback không cần xử lý gì
    );

    // Trả về thông báo thành công và ID của todo vừa tạo
    res.status(201).json({
      message: "Todo created",
      id: result.insertId
    });
  });
};


/**
 * PUT /todos/:id
 * Cập nhật thông tin 1 todo
 * @param {Object} req - Request object, req.params.id = ID của todo, body chứa dữ liệu cần cập nhật
 * @param {Object} res - Response object
 * @returns {Object} Message thành công hoặc lỗi
 */
exports.updateTodo = (req, res) => {
  // Lấy ID từ URL parameters
  const id = req.params.id;

  // Kiểm tra xem todo có tồn tại không
  Todo.getById(id, (err, rows) => {
    // Nếu có lỗi khi truy vấn, trả về lỗi 500
    if (err) return res.status(500).json({ error: err.message });
    // Nếu không tìm thấy todo, trả về lỗi 404
    if (rows.length === 0)
      return res.status(404).json({ message: "Todo not found" });

    // Nếu todo tồn tại, thực hiện update
    Todo.update(id, req.body, (err) => {
      // Nếu có lỗi khi update, trả về lỗi 500
      if (err) return res.status(500).json({ error: err.message });

      // Ghi log hành động cập nhật todo
      TodoLog.create(
        {
          todo_id: id,
          action: "update"
        },
        () => {}
      );

      // Trả về thông báo thành công
      res.json({ message: "Todo updated" });
    });
  });
};


/**
 * DELETE /todos/:id
 * Xóa 1 todo
 * @param {Object} req - Request object, req.params.id = ID của todo cần xóa
 * @param {Object} res - Response object
 * @returns {Object} Message thành công hoặc lỗi
 */
exports.deleteTodo = (req, res) => {
  // Lấy ID từ URL parameters
  const id = req.params.id;

  // Ghi log hành động xóa todo (ghi trước khi xóa)
  TodoLog.create(
    {
      todo_id: id,
      action: "delete"
    },
    () => {}
  );

  // Thực hiện xóa todo từ database
  Todo.delete(id, (err) => {
    // Nếu có lỗi khi xóa, trả về lỗi 500
    if (err) return res.status(500).json({ error: err.message });

    // Trả về thông báo thành công
    res.json({ message: "Todo deleted" });
  });
};


/**
 * PATCH /todos/:id/complete
 * Đánh dấu 1 todo đã hoàn thành
 * @param {Object} req - Request object, req.params.id = ID của todo cần đánh dấu hoàn thành
 * @param {Object} res - Response object
 * @returns {Object} Message thành công hoặc lỗi
 */
exports.completeTodo = (req, res) => {
  // Lấy ID từ URL parameters
  const id = req.params.id;

  // Cập nhật trạng thái todo: completed = true, status = "completed"
  Todo.update(
    id,
    { completed: true, status: "completed" },
    (err) => {
      // Nếu có lỗi khi update, trả về lỗi 500
      if (err) return res.status(500).json({ error: err.message });

      // Ghi log hành động hoàn thành todo
      TodoLog.create(
        {
          todo_id: id,
          action: "complete"
        },
        () => {}
      );

      // Trả về thông báo thành công
      res.json({ message: "Todo completed" });
    }
  );
};


/**
 * PATCH /todos/:id/priority
 * Cập nhật mức độ ưu tiên của 1 todo
 * @param {Object} req - Request object, req.params.id = ID của todo, req.body.priority_id = ID mức độ ưu tiên mới
 * @param {Object} res - Response object
 * @returns {Object} Message thành công hoặc lỗi
 */
exports.updateTodoPriority = (req, res) => {
  // Lấy ID từ URL parameters
  const { id } = req.params;
  // Lấy priority_id từ request body
  const { priority_id } = req.body;

  // Validate: priority_id là bắt buộc
  if (!priority_id)
    return res.status(400).json({ message: "priority_id is required" });

  // Cập nhật priority_id của todo
  Todo.updatePriority(id, priority_id, (err, result) => {
    // Nếu có lỗi khi update, trả về lỗi 500
    if (err) return res.status(500).json({ error: err.message });

    // Nếu không có hàng nào bị ảnh hưởng => todo không tồn tại
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Ghi log thay đổi priority
    TodoLog.create(
      {
        todo_id: id,
        action: `change priority to ${priority_id}`
      },
      () => {}
    );

    // Trả về thông báo thành công
    res.json({ message: "Priority updated" });
  });
};



// PATCH /todos/:id/category
exports.updateTodoCategory = (req, res) => {
  const todoId = req.params.id;
  const { category_id } = req.body;

  if (!category_id) {
    return res.status(400).json({ message: "category_id is required" });
  }

  Todo.updateCategory(todoId, category_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    TodoLog.create(
      {
        todo_id: todoId,
        action: `change category to ${category_id}`
      },
      () => {}
    );

    res.json({ message: "Category updated" });
  });
};


