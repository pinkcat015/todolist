require('dotenv').config();
const db = require('./config/db');

const pool = db.promise ? db.promise() : db;

async function tableCount(table) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${table}\``);
  return rows[0].cnt;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function cleanupData() {
  try {
    console.log('🗑️ Deleting old data...');
    
    // Tắt foreign key check tạm thời
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Dùng TRUNCATE thay vì DELETE - reset AUTO_INCREMENT
    await pool.query('TRUNCATE TABLE todo_logs');
    await pool.query('TRUNCATE TABLE todos');
    await pool.query('TRUNCATE TABLE categories');
    await pool.query('TRUNCATE TABLE priorities');
    
    // Bật lại foreign key check
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Old data deleted and AUTO_INCREMENT reset');
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
}

async function ensurePriorities() {
  const names = ['Low', 'Medium', 'High'];
  for (const n of names) {
    await pool.query('INSERT INTO priorities (name) VALUES (?)', [n]);
    console.log('✓ Inserted priority:', n);
  }
}

async function ensureCategories() {
  const [users] = await pool.query('SELECT id FROM users');
  
  if (users.length === 0) {
    console.log('⚠️ No users found. Please run seed:users first');
    return;
  }

  const desired = [
    'Work',
    'Personal',
    'Shopping',
    'Health',
    'Finance',
    'Learning',
    'Chores',
    'Others'
  ];

  // Tạo categories cho mỗi user
  for (const user of users) {
    for (const name of desired) {
      await pool.query('INSERT INTO categories (name, user_id) VALUES (?, ?)', [name, user.id]);
    }
    console.log(`✓ Inserted ${desired.length} categories for user ${user.id}`);
  }
}

async function ensureTodos(minCount = 50) {
  const [users] = await pool.query('SELECT id FROM users');
  const [priorities] = await pool.query('SELECT id FROM priorities');
  const [categories] = await pool.query('SELECT id FROM categories');
  
  if (users.length === 0) {
    console.log('⚠️ No users found. Skipping todos.');
    return;
  }

  const priorityIds = priorities.map(p => p.id);
  const categoryIds = categories.map(c => c.id);

  const templates = [
    ['Write unit tests', 'Add tests for the new API endpoints'],
    ['Clean the house', 'Vacuum and dust living room and bedrooms'],
    ['Pay electricity bill', 'Pay via online banking before due date'],
    ['Read JavaScript book', 'Finish chapter about async/await'],
    ['Grocery shopping', 'Buy ingredients for dinner and snacks'],
    ['Design presentation', 'Prepare slides for Monday meeting'],
    ['Workout', '30 minutes cardio and strength training'],
    ['Backup laptop', 'Create a zip backup of important files'],
    ['Call plumber', 'Fix the kitchen sink leak'],
    ['Practice Vietnamese', 'Do language exercises for 30 minutes'],
    ['Review code changes', 'Check pull request from team members'],
    ['Schedule dentist', 'Book appointment for dental checkup'],
    ['Update documentation', 'Write README for new features'],
    ['Team standup', 'Attend daily standup meeting at 10am'],
    ['Submit expense report', 'File reimbursement for client meeting'],
    ['Fix bug in login', 'Debug authentication issue on mobile'],
    ['Plan sprint', 'Prepare tasks for next two-week sprint'],
    ['Buy birthday gift', 'Purchase and wrap gift for friend'],
    ['Water plants', 'Check and water all indoor plants'],
    ['Learn TypeScript', 'Complete TypeScript basics course'],
  ];

  console.log(`📝 Inserting ${minCount} todos for each user...`);
  
  for (const user of users) {
    for (let i = 0; i < minCount; i++) {
      const [title, description] = pick(templates);
      const priority = pick(priorityIds);
      const category = pick(categoryIds);
      const statuses = ['pending', 'in_progress', 'completed'];
      const status = pick(statuses);
      const completed = status === 'completed';
      
      // Random deadline in next 30 days
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 30));
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await pool.query(
        'INSERT INTO todos (title, description, status, completed, priority_id, category_id, user_id, deadline, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, status, completed, priority, category, user.id, deadline.toISOString().slice(0, 19).replace('T', ' '), now]
      );
      
      if ((i + 1) % 10 === 0) console.log(`  ✓ ${i + 1}/${minCount} todos inserted for user ${user.id}`);
    }
  }
  console.log(`✅ All todos inserted for all users`);
}

async function ensureLogs(minLogs = 150) {
  const [users] = await pool.query('SELECT id FROM users');
  if (!users.length) return;

  console.log(`📝 Inserting logs for each user...`);
  const actions = [
    'created', 'updated', 'marked as in_progress', 'marked as completed', 'priority changed',
    'category changed', 'description updated', 'assigned', 'due date set', 'reminder set'
  ];

  for (const user of users) {
    const [userTodos] = await pool.query('SELECT id FROM todos WHERE user_id = ?', [user.id]);
    if (!userTodos.length) continue;

    for (let i = 0; i < minLogs; i++) {
      const todo = pick(userTodos);
      const action = pick(actions);
      await pool.query('INSERT INTO todo_logs (todo_id, action) VALUES (?, ?)', [todo.id, action]);
    }
    console.log(`  ✓ ${minLogs} logs inserted for user ${user.id}`);
  }
  console.log(`✅ All logs inserted`);
}

async function run() {
  try {
    await cleanupData();
    await ensurePriorities();
    await ensureCategories();
    await ensureTodos(50);
    await ensureLogs(150);

    console.log('\n🎉 Seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

run();
