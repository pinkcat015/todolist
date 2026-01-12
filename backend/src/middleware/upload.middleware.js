const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Lưu vào thư mục 'uploads/' ở root dự án
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    // Đặt tên file: timestamp + tên gốc (để tránh trùng)
    // Ví dụ: 16789999-avatar.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Bộ lọc file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file ảnh!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Giới hạn 2MB
});

module.exports = upload;