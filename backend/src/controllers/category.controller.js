const Category = require("../models/category.model");

/**
 * GET /categories
 * Lấy categories của user hiện tại
 */
exports.getCategories = (req, res) => {
  const userId = req.userId; // Từ authMiddleware
  
  Category.getByUserId(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
};

/**
 * POST /categories
 * Tạo category mới cho user hiện tại
 */
exports.createCategory = (req, res) => {
  const userId = req.userId; // Từ authMiddleware
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  Category.create({ name, user_id: userId }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Category created",
      id: result.insertId
    });
  });
};

/**
 * PUT /categories/:id
 * Cập nhật category (check ownership)
 */
exports.updateCategory = (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  // Check ownership trước
  Category.getById(id, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Sau đó mới update
    Category.update(id, { name }, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Category updated" });
    });
  });
};

/**
 * DELETE /categories/:id
 * Xóa category (check ownership)
 */
exports.deleteCategory = (req, res) => {
  const userId = req.userId;
  const id = req.params.id;

  // Check ownership trước
  Category.getById(id, userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Sau đó mới delete
    Category.delete(id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Category deleted" });
    });
  });
};