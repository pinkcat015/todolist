const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Tất cả routes cần auth
router.use(authMiddleware);

// GET /todos - CHỈ lấy todos của user đang login
router.get("/", todoController.getTodos);

// GET /todos/:id - Kiểm tra ownership
router.get("/:id", todoController.getTodoById);

// POST /todos - Tự động gán user_id
router.post("/", todoController.createTodo);

// PUT /todos/:id - Kiểm tra ownership
router.put("/:id", todoController.updateTodo);

// DELETE /todos/:id - Kiểm tra ownership
router.delete("/:id", todoController.deleteTodo);

// PATCH /todos/:id/complete - Kiểm tra ownership
router.patch("/:id/complete", todoController.completeTodo);

// PATCH /todos/:id/priority - Kiểm tra ownership
router.patch("/:id/priority", todoController.updateTodoPriority);

// PATCH /todos/:id/category - Kiểm tra ownership
router.patch("/:id/category", todoController.updateTodoCategory);

module.exports = router;