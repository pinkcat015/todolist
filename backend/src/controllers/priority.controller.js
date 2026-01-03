const Priority = require("../models/priority.model");

exports.getPriorities = (req, res) => {
  Priority.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createPriority = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  Priority.create({ name }, () => {
    res.status(201).json({ message: "Priority created" });
  });
};

exports.updatePriority = (req, res) => {
  Priority.update(req.params.id, req.body, () => {
    res.json({ message: "Priority updated" });
  });
};

exports.deletePriority = (req, res) => {
  Priority.delete(req.params.id, () => {
    res.json({ message: "Priority deleted" });
  });
};
