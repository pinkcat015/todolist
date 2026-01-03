const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");

router.get("/logs", logController.getAllLogs);
router.get("/logs/todo/:todo_id", logController.getLogsByTodo);

module.exports = router;
