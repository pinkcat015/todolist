const Category = require("../models/category.model");

/**
 * GET /categories
 */
exports.getCategories = (req, res) => {
  Category.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * POST /categories
 */
exports.createCategory = (req, res) => {
  const { name, user_id } = req.body;

  if (!name || !user_id) {
    return res.status(400).json({ message: "name & user_id are required" });
  }

  Category.create({ name, user_id }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Category created",
      id: result.insertId
    });
  });
};

/**
 * PUT /categories/:id
 */
exports.updateCategory = (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  Category.update(id, { name }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated" });
  });
};

/**
 * DELETE /categories/:id
 */
exports.deleteCategory = (req, res) => {
  const id = req.params.id;

  Category.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Category deleted" });
  });
};
