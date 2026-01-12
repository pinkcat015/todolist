const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
// Cập nhật thông tin cá nhân
exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, telegram_chat_id, default_remind_minutes } = req.body;
  
  // 1. Lấy thông tin file từ req.file (Log của bạn cho thấy cái này ĐÃ CÓ)
  const file = req.file; 

  let sql, params;

  if (file) {
    // 2. Nếu có file, tạo đường dẫn URL từ filename
    // Lưu ý: Phải có dấu / ở đầu: /uploads/...
    const avatarUrl = `/uploads/${file.filename}`; 

    

    // Cập nhật CÓ đổi ảnh
    sql = "UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, telegram_chat_id = ?, default_remind_minutes = ? WHERE id = ?";
    params = [full_name, phone, avatarUrl, telegram_chat_id, default_remind_minutes, userId];
  } else {
    // Cập nhật KHÔNG đổi ảnh (giữ nguyên ảnh cũ)
    sql = "UPDATE users SET full_name = ?, phone = ?, telegram_chat_id = ?, default_remind_minutes = ? WHERE id = ?";
    params = [full_name, phone, telegram_chat_id, default_remind_minutes, userId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Lỗi SQL:", err);
      return res.status(500).json({ error: err.message });
    }

    // Trả về avatar mới cho Frontend hiển thị ngay
    const newAvatar = file ? `/uploads/${file.filename}` : null;
    
    res.json({ 
      message: "Cập nhật hồ sơ thành công",
      newAvatar: newAvatar
    });
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