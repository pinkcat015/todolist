const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
// Áp dụng middleware xác thực cho tất cả các route bên dưới
router.use(authMiddleware);

// API cập nhật thông tin: PUT /api/users/profile
router.put("/profile", upload.single('avatar'), userController.updateProfile);

// API đổi mật khẩu: PUT /api/users/change-password
router.put("/change-password", userController.changePassword);
router.get("/profile", userController.getProfile);
module.exports = router;