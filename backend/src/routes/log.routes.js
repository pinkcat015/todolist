const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Tất cả routes cần auth
router.use(authMiddleware);

// Define actual routes
router.get("/", logController.getLogsByUser);
router.get("/todo/:todo_id", logController.getLogsByTodo);
router.delete("/:id", logController.deleteLog);
router.delete("/", logController.clearLogs);
module.exports = router;