const nodemailer = require('nodemailer');

// Cấu hình gửi mail (Dùng Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'truongminhtrang012@gmail.com', // Thay bằng email của bạn
    pass: 'suxl homp cfqd zgei' // Dán cái mã 16 ký tự vừa lấy ở Bước 0 vào đây
  }
});

exports.sendResetEmail = async (email, link) => {
  const mailOptions = {
    from: '"My Todo App" <no-reply@mytodo.com>',
    to: email,
    subject: '🔒 Đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Bạn đã yêu cầu đặt lại mật khẩu?</h2>
        <p>Vui lòng bấm vào nút bên dưới để tạo mật khẩu mới. Link này sẽ hết hạn sau 1 giờ.</p>
        <a href="${link}" style="background-color: #722ed1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu ngay</a>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};