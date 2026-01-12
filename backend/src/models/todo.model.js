const db = require("../config/db");


/**
 * GET todo by id (kiểm tra user_id để security)
 */
exports.getById = (id, userId, callback) => {
  db.query("SELECT * FROM todos WHERE id = ? AND user_id = ?", [id, userId], callback);
};

/**
 * CREATE todo
 */
exports.create = (todo, callback) => {
  db.query("INSERT INTO todos SET ?", todo, callback);
};

/**
 * UPDATE todo
 */
/**
 * UPDATE todo
 * Đã sửa: Xử lý dữ liệu đầu vào & Check quyền sở hữu (userId)
 */
exports.update = (id, userId, data, callback) => {
  // 1. Xử lý dữ liệu sạch (Sanitize)
  // Nếu không có giá trị (undefined/empty) thì chuyển về null để lưu vào DB
  const priority_id = data.priority_id || null;
  const category_id = data.category_id || null;
  
  // Xử lý ngày tháng: Nếu có chuỗi thì convert sang Date, không thì null
  const deadline = data.deadline ? new Date(data.deadline) : null;
  
  // Xử lý completed: convert true/false sang 1/0
  const completed = data.completed ? 1 : 0;

  // 2. Viết câu SQL tường minh
  const sql = `
    UPDATE todos 
    SET 
      title = ?, 
      description = ?, 
      priority_id = ?, 
      category_id = ?, 
      deadline = ?, 
      status = ?, 
      completed = ?
    WHERE id = ? AND user_id = ?
  `;

  // 3. Tạo mảng tham số
  const values = [
    data.title, 
    data.description, 
    priority_id, 
    category_id, 
    deadline, 
    data.status, 
    completed,
    id,     // WHERE id
    userId  // AND user_id (Bảo mật)
  ];

  db.query(sql, values, callback);
};

/**
 * DELETE todo
 */
exports.delete = (id, callback) => {
  db.query("DELETE FROM todos WHERE id = ?", [id], callback);
};


/**
 * UPDATE priority for todo
 */
exports.updatePriority = (id, priorityId, callback) => {
  const sql = `
    UPDATE todos
    SET priority_id = ?
    WHERE id = ?
  `;
  db.query(sql, [priorityId, id], callback);
};


exports.updateCategory = (id, categoryId, callback) => {
  const sql = `
    UPDATE todos
    SET category_id = ?
    WHERE id = ?
  `;
  db.query(sql, [categoryId, id], callback);
};



/**
 * GET todos with pagination + filter + search + meta
 */
exports.getWithPaginationAndFilter = (options, callback) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const offset = (page - 1) * limit;

  let baseSql = `
    FROM todos t
    LEFT JOIN priorities p ON t.priority_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
  `;

  const params = [options.userId]; // Thêm userId vào đầu params

  if (options.q) {
    baseSql += " AND t.title LIKE ?";
    params.push(`%${options.q}%`);
  }

  if (options.status) {
    baseSql += " AND t.status = ?";
    params.push(options.status);
  }

  if (options.priority) {
    baseSql += " AND t.priority_id = ?";
    params.push(options.priority);
  }

  if (options.category) {
    baseSql += " AND t.category_id = ?";
    params.push(options.category);
  }

  if (options.completed !== undefined) {
    baseSql += " AND t.completed = ?";
    params.push(options.completed);
  }

  const countSql = `
    SELECT COUNT(*) AS total
    ${baseSql}
  `;

  const dataSql = `
    SELECT
      t.*,
      p.name AS priority_name,
      c.name AS category_name
    ${baseSql}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, params, (err, countRows) => {
    if (err) return callback(err);

    const total = countRows[0].total;

    db.query(
      dataSql,
      [...params, limit, offset],
      (err, rows) => {
        if (err) return callback(err);

        callback(null, {
          data: rows,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
    );
  });
};

