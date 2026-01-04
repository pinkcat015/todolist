require("dotenv").config();
require("./config/db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend ToDoList chạy OK 🚀");
});

const todoRoutes = require("./routes/todo.routes");
app.use("/todos", todoRoutes);

const logRoutes = require("./routes/log.routes");
app.use("/", logRoutes);

const priorityRoutes = require("./routes/priority.routes");
app.use("/priorities", priorityRoutes);

const categoryRoutes = require("./routes/category.routes");
app.use("/categories", categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
