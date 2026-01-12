const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Cập nhật thông tin cá nhân
exports.updateProfile = (req, res) => {
  const userId = req.userId;
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  const { full_name, avatar_url, phone } = req.body;

  console.log('Update profile request:', { userId, full_name, avatar_url, phone }); // Debug

  const userData = { 
    full_name: full_name || null, 
    avatar_url: avatar_url || null, 
    phone: phone || null 
  };

  User.updateProfile(userId, userData, (err, result) => {
    if (err) {
      console.error('Update profile error:', err); // Debug
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
    res.json({ message: "Cập nhật hồ sơ thành công" });
  });
};

// Đổi mật khẩu
exports.changePassword = (req, res) => {
  const userId = req.userId; // Lấy từ authMiddleware
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  // 1. Lấy mật khẩu hiện tại trong DB để kiểm tra
  User.getUserPasswordById(userId, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    // 2. So sánh mật khẩu người dùng nhập vào với mật khẩu trong DB
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // 3. Mã hóa mật khẩu mới
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // 4. Lưu vào DB
    User.updatePassword(userId, hashedPassword, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật mật khẩu", error: err });
      
      res.json({ message: "Đổi mật khẩu thành công" });
    });
  });
};

exports.getProfile = (req, res) => {
  const userId = req.userId;
  
  User.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.json(user);
  });
};