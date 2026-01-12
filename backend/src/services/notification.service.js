const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const db = require('../config/db');

// Thay TOKEN bạn lấy từ BotFather vào đây
const token = '8262434358:AAGksLJPsbvzwwOU-g7ZbPNOjnqYnMljahA';
const bot = new TelegramBot(token, { polling: true });

const initNotificationService = () => {
  console.log("🤖 Bot Telegram đang chạy...");

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const resp = `
👋 Chào bạn!
Đây là ID của bạn: <code>${chatId}</code>
Hãy copy số này dán vào phần Cài đặt trên website nhé! 👇
    `;
    // Gửi tin nhắn có định dạng HTML để user copy cho dễ
    bot.sendMessage(chatId, resp, { parse_mode: 'HTML' });
  });

  // Cấu hình Cron Job: Chạy mỗi phút 1 lần (* * * * *)
  cron.schedule('* * * * *', () => {
    checkDeadlines();
  });
};

const checkDeadlines = () => {
  const sql = `
    SELECT t.id, t.title, t.deadline, u.telegram_chat_id 
    FROM todos t
    JOIN users u ON t.user_id = u.id
    WHERE t.status != 'completed' 
    AND t.is_notified = 0
    AND t.deadline IS NOT NULL
    AND u.telegram_chat_id IS NOT NULL
    AND t.deadline > NOW() 
    -- Sử dụng cột default_remind_minutes từ bảng users
    AND t.deadline <= DATE_ADD(NOW(), INTERVAL u.default_remind_minutes MINUTE) 
  `;

  db.query(sql, (err, tasks) => {
    if (err) return console.error("Lỗi Cron:", err);
    tasks.forEach(task => sendTelegramMessage(task));
  });
};

const sendTelegramMessage = (task) => {
  const message = `
🔔 **NHẮC NHỞ CÔNG VIỆC** 🔔

📝 **Việc:** ${task.title}
⏰ **Hạn chót:** ${new Date(task.deadline).toLocaleString('vi-VN')}

Sắp đến hạn rồi, làm ngay đi nhé! 💪
  `;

  bot.sendMessage(task.telegram_chat_id, message)
    .then(() => {
      // Gửi thành công -> Đánh dấu vào DB để không gửi lại
      db.query("UPDATE todos SET is_notified = 1 WHERE id = ?", [task.id]);
      console.log(`Đã gửi thông báo task ${task.id}`);
    })
    .catch((err) => {
      console.error("Lỗi gửi Telegram:", err.message);
    });
};

module.exports = initNotificationService;