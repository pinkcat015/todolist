require("dotenv").config();
require("./config/db");
const express = require("express");
const cors = require("cors");
const User = require("./models/user.model");

const app = express();

app.use(cors());
app.use(express.json());

// Initialize users table
User.createUsersTable();

app.get("/", (req, res) => {
  res.send("Backend ToDoList chạy OK 🚀");
});

// Auth routes
const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

const todoRoutes = require("./routes/todo.routes");
app.use("/todos", todoRoutes);

const logRoutes = require("./routes/log.routes");
app.use("/logs", logRoutes);

const priorityRoutes = require("./routes/priority.routes");
app.use("/priorities", priorityRoutes);

const categoryRoutes = require("./routes/category.routes");
app.use("/categories", categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
