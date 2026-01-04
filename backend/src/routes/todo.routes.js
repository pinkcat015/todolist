const express = require("express");
const router = express.Router();
const controller = require("../controllers/todo.controller");

router.get("/", controller.getTodos);
router.post("/", controller.createTodo);
router.put("/:id", controller.updateTodo);
router.delete("/:id", controller.deleteTodo);
router.get("/:id", controller.getTodoById);
router.patch("/:id/complete", controller.completeTodo);
router.patch("/:id/priority", controller.updateTodoPriority);
router.patch("/:id/category", controller.updateTodoCategory);

module.exports = router;
