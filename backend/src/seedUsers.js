require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const pool = db.promise ? db.promise() : db;

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');
    
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: '123456'
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: '123456'
      },
      {
        username: 'pinkcat',
        email: 'pinkcat015@gmail.com',
        password: '123456'
      }
    ];

    for (const userData of users) {
      try {
        // Check if user exists
        const [existing] = await pool.query(
          'SELECT id FROM users WHERE username = ?',
          [userData.username]
        );

        if (existing.length === 0) {
          // Hash password
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(userData.password, salt);

          await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [userData.username, userData.email, hashedPassword]
          );
          console.log(`✓ Created user: ${userData.username}`);
        } else {
          console.log(`⚠️ User already exists: ${userData.username}`);
        }
      } catch (err) {
        console.error(`Error creating user ${userData.username}:`, err.message);
      }
    }

    console.log('✅ User seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedUsers();
