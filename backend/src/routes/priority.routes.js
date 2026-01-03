const express = require("express");
const router = express.Router();
const controller = require("../controllers/priority.controller");

router.get("/", controller.getPriorities);
router.post("/", controller.createPriority);
router.put("/:id", controller.updatePriority);
router.delete("/:id", controller.deletePriority);

module.exports = router;
