const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Thư viện tạo chuỗi ngẫu nhiên
const db = require("../config/db"); // [QUAN TRỌNG] Import kết nối DB để chạy câu lệnh update token
const User = require("../models/user.model");
const emailService = require("../services/email.service"); // Import service gửi mail

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// --- 1. REGISTER ---
exports.register = (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate input
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Tất cả các trường là bắt buộc" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Mật khẩu không khớp" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  // Check if user already exists
  User.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (user) {
      return res.status(400).json({ message: "Tên người dùng đã tồn tại" });
    }

    // Check if email already exists
    User.getUserByEmail(email, (err, userEmail) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi server", error: err });
      }

      if (userEmail) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
      };

      User.createUser(userData, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Lỗi khi đăng ký", error: err });
        }

        // Generate token
        const token = jwt.sign(
          { id: result.id, username: result.username, email: result.email },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.status(201).json({
          message: "Đăng ký thành công",
          token,
          user: result,
        });
      });
    });
  });
};

// --- 2. LOGIN ---
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tên người dùng và mật khẩu" });
  }

  // Find user
  User.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (!user) {
      return res.status(401).json({ message: "Tên người dùng hoặc mật khẩu không đúng" });
    }

    // Compare password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Tên người dùng hoặc mật khẩu không đúng" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        telegram_chat_id: user.telegram_chat_id,         
        default_remind_minutes: user.default_remind_minutes 
      },
    });
  });
};

// --- 3. GET CURRENT USER ---
exports.getCurrentUser = (req, res) => {
  const userId = req.userId;

  User.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tìm thấy" });
    }

    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  });
};

// --- 4. FORGOT PASSWORD (MỚI) ---
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Vui lòng nhập Email" });

  // Kiểm tra email có tồn tại không
  User.getUserByEmail(email, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString('hex');
    const expireTime = new Date(Date.now() + 3600000); // Hết hạn sau 1 giờ

    // Lưu token vào DB
    const sql = "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?";
    
    db.query(sql, [token, expireTime, email], (err) => {
      if (err) return res.status(500).json({ message: "Lỗi database khi lưu token" });

      // Link frontend (Bạn nhớ đổi localhost:5173 thành port thực tế của React nếu khác)
      const resetLink = `http://localhost:5173/reset-password/${token}`;
      
      emailService.sendResetEmail(email, resetLink)
        .then(() => res.json({ message: "Đã gửi email hướng dẫn! Hãy kiểm tra hộp thư." }))
        .catch(e => {
            console.error("Lỗi gửi mail:", e);
            res.status(500).json({ message: "Gửi mail thất bại" });
        });
    });
  });
};

// --- 5. RESET PASSWORD (MỚI) ---
exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  // Tìm user có token này và chưa hết hạn (expires > NOW)
  const sqlCheck = "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()";
  
  db.query(sqlCheck, [token], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    
    if (results.length === 0) {
      return res.status(400).json({ message: "Link đã hết hạn hoặc không hợp lệ" });
    }

    const user = results[0];

    // Hash mật khẩu mới
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Cập nhật mật khẩu & Xóa token
    const sqlUpdate = "UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?";
    
    db.query(sqlUpdate, [hashedPassword, user.id], (err) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật mật khẩu" });
      res.json({ message: "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay." });
    });
  });
};