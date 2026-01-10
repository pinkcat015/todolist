const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");

// QUAN TRỌNG: Tất cả routes cần auth
router.use(authMiddleware);

// GET /categories - Lấy categories của user hiện tại
router.get("/", controller.getCategories);

// POST /categories - Tạo category mới
router.post("/", controller.createCategory);

// PUT /categories/:id - Cập nhật category (check ownership)
router.put("/:id", controller.updateCategory);

// DELETE /categories/:id - Xóa category (check ownership)
router.delete("/:id", controller.deleteCategory);

module.exports = router;