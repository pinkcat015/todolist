import React, { useState, useEffect } from 'react';
import todoApi from '../api/todo.api';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 10, q: '', status: '', category: '', priority: '' });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  
  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, todo: null });
  const [editForm, setEditForm] = useState({ title: '', description: '', category_id: '', priority_id: '' });
  
  // Create modal state
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', category_id: '', priority_id: '' });

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prioRes] = await Promise.all([todoApi.getCategories(), todoApi.getPriorities()]);
      setCategories(catRes.data || []);
      setPriorities(prioRes.data || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await todoApi.getTodos(filters);
        if (res.data?.data) {
          setTodos(res.data.data);
          if (res.data.meta) setPagination({ total: res.data.meta.total, totalPages: res.data.meta.totalPages || 1 });
        }
      } catch (e) { console.error(e); }
    };
    const timer = setTimeout(() => fetchTodos(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilter = (k, v) => {
    // If changing page, don't reset to page 1
    if (k === 'page') {
      setFilters(prev => ({ ...prev, [k]: v }));
    } else {
      // For other filters, reset to page 1
      setFilters(prev => ({ ...prev, [k]: v, page: 1 }));
    }
  };
  const handleDelete = async (id) => { 
    if(window.confirm("Xóa nhé?")) { 
      await todoApi.deleteTodo(id); 
      setFilters(prev => ({ ...prev })); // Trigger refetch with current filters
    }
  };
  
  const handleStatusChange = async (id, currentStatus) => {
    let newStatus;
    if (currentStatus === 'pending') {
      newStatus = 'in_progress';
    } else if (currentStatus === 'in_progress') {
      newStatus = 'completed';
    } else {
      return; // Already completed
    }
    
    try {
      await todoApi.updateTodo(id, { status: newStatus });
      setFilters(prev => ({ ...prev })); // Trigger refetch
    } catch (err) {
      console.error('Status update error:', err);
      alert('Lỗi khi cập nhật trạng thái!');
    }
  };
  
  const getNextStatusInfo = (status) => {
    if (status === 'pending') return { label: '🔄 Bắt đầu', icon: '→' };
    if (status === 'in_progress') return { label: '✅ Hoàn thành', icon: '→' };
    return null;
  };

  const handleAdd = () => setCreateModal(true);

  // Create handlers
  const openCreateModal = () => {
    setCreateForm({ title: '', description: '', category_id: '', priority_id: '' });
    setCreateModal(true);
  };

  const closeCreateModal = () => {
    setCreateModal(false);
    setCreateForm({ title: '', description: '', category_id: '', priority_id: '' });
  };

  const handleCreateTodo = async () => {
    if (!createForm.title.trim()) {
      alert('Tiêu đề không được để trống!');
      return;
    }
    try {
      await todoApi.createTodo({
        title: createForm.title,
        description: createForm.description || null,
        category_id: createForm.category_id || null,
        priority_id: createForm.priority_id || null
      });
      closeCreateModal();
      setFilters(prev => ({ ...prev, page: 1 })); // Reset to page 1 and refetch
    } catch (err) {
      console.error('Create error:', err);
      alert('Lỗi khi tạo công việc!');
    }
  };

  // Edit handlers
  const openEditModal = (todo) => {
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      category_id: todo.category_id || '',
      priority_id: todo.priority_id || ''
    });
    setEditModal({ open: true, todo });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, todo: null });
    setEditForm({ title: '', description: '', category_id: '', priority_id: '' });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      alert('Tiêu đề không được để trống!');
      return;
    }
    try {
      await todoApi.updateTodo(editModal.todo.id, {
        title: editForm.title,
        description: editForm.description,
        category_id: editForm.category_id || null,
        priority_id: editForm.priority_id || null
      });
      closeEditModal();
      setFilters(prev => ({ ...prev })); // Trigger refetch
    } catch (err) {
      console.error('Edit error:', err);
      alert('Lỗi khi cập nhật công việc!');
    }
  };

  const getCatName = (id) => categories.find(c => c.id === id)?.name || 'Chung';
  const getPrioName = (id) => priorities.find(p => p.id === id)?.name || 'Bình thường';

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Danh sách công việc 🌸</h2>
          <span className="breadcrumb">Quản lý / Todo List</span>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <FaPlus /> Tạo mới
        </button>
      </div>

      {/* TABLE BOX */}
      <div className="table-container">
        
        {/* TOOLBAR */}
        <div className="toolbar">
          <input 
            style={{ width: '300px' }}
            placeholder="🔍 Tìm kiếm công việc..." 
            value={filters.q} onChange={e => handleFilter('q', e.target.value)} 
          />
          <select value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
            <option value="">📊 Tất cả trạng thái</option>
            <option value="pending">⏳ Chưa bắt đầu</option>
            <option value="in_progress">🔄 Đang làm</option>
            <option value="completed">✅ Đã hoàn thành</option>
          </select>
          <select onChange={e => handleFilter('category', e.target.value ? Number(e.target.value) : '')}>
            <option value="">📂 Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select onChange={e => handleFilter('priority', e.target.value ? Number(e.target.value) : '')}>
            <option value="">🔥 Tất cả ưu tiên</option>
            {priorities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* TABLE */}
        <table className="data-table">
          <thead>
            <tr>
              <th width="50">#</th>
              <th>Nội dung công việc</th>
              <th>Danh mục</th>
              <th>Độ ưu tiên</th>
              <th>Deadline</th>
              <th>Trạng thái</th>
              <th style={{textAlign: 'right'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Chưa có dữ liệu nào 🍃</td></tr>
            ) : (
              todos.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{fontWeight: 600, color: '#334155'}}>{item.title}</td>
                  <td>
                    {/* Badge Danh mục màu xanh dương nhạt */}
                    <span style={{background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600'}}>
                      {item.category_name || getCatName(item.category_id)}
                    </span>
                  </td>
                  <td>
                    {/* Priority Text color */}
                    <span className={`priority-badge ${(item.priority_id || 1) >= 3 ? 'high' : (item.priority_id || 1) === 2 ? 'medium' : 'low'}`}>
                      {item.priority_name || getPrioName(item.priority_id)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status === 'pending' ? '⏳ Chưa bắt đầu' : item.status === 'in_progress' ? '🔄 Đang làm' : '✅ Đã hoàn thành'}
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    {item.status !== 'completed' && (
                      <button 
                        className="action-btn check" 
                        title={getNextStatusInfo(item.status)?.label}
                        onClick={() => handleStatusChange(item.id, item.status)}
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button className="action-btn edit" onClick={() => openEditModal(item)}><FaEdit /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button disabled={filters.page <= 1} onClick={() => handleFilter('page', filters.page - 1)}>Prev</button>
          <button disabled={filters.page >= pagination.totalPages} onClick={() => handleFilter('page', filters.page + 1)}>Next</button>
        </div>

      </div>

      {/* EDIT MODAL */}
      {editModal.open && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa công việc</h3>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề công việc"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Nhập mô tả chi tiết"
                  rows="4"
                  style={{ fontFamily: 'inherit', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">-- Không có --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Độ ưu tiên</label>
                  <select
                    value={editForm.priority_id}
                    onChange={(e) => setEditForm({ ...editForm, priority_id: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">-- Không có --</option>
                    {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeEditModal}>Hủy</button>
              <button className="btn-save" onClick={handleSaveEdit}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo công việc mới</h3>
              <button className="modal-close" onClick={closeCreateModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề công việc"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Nhập mô tả chi tiết (tùy chọn)"
                  rows="4"
                  style={{ fontFamily: 'inherit', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    value={createForm.category_id}
                    onChange={(e) => setCreateForm({ ...createForm, category_id: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">-- Không có --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Độ ưu tiên</label>
                  <select
                    value={createForm.priority_id}
                    onChange={(e) => setCreateForm({ ...createForm, priority_id: e.target.value ? Number(e.target.value) : '' })}
                  >
                    <option value="">-- Không có --</option>
                    {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeCreateModal}>Hủy</button>
              <button className="btn-save" onClick={handleCreateTodo}>Tạo công việc</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;