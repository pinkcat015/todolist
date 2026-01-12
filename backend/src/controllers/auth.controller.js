const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register
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

// Login
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

// Get current user
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
