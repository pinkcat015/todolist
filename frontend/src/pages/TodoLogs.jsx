import React, { useState, useEffect } from 'react';
import todoApi from '../api/todo.api';
import { FaClock, FaFilter } from 'react-icons/fa';

const TodoLogs = () => {
  const [logs, setLogs] = useState([]); // Always initialize as array
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await todoApi.getLogs();
      // Ensure we always set an array
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      
      // Check if it's auth error
      if (err.response?.status === 401) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      } else {
        setError('Không thể tải lịch sử. Vui lòng thử lại.');
      }
      
      // Always ensure logs is an array
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const query = search.toLowerCase();
    return (
      (log.title && log.title.toLowerCase().includes(query)) ||
      (log.action && log.action.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
  };

  const getActionBadgeColor = (action) => {
    if (action?.includes('created')) return '#3b82f6';
    if (action?.includes('delete')) return '#ef4444';
    if (action?.includes('completed')) return '#22c55e';
    if (action?.includes('updated')) return '#f59e0b';
    return '#64748b';
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Lịch sử chỉnh sửa 📋</h2>
          <span className="breadcrumb">Quản lý / Lịch sử hoạt động</span>
        </div>
      </div>

      {/* TABLE BOX */}
      <div className="table-container">
        
        {/* TOOLBAR */}
        <div className="toolbar">
          <input 
            style={{ width: '350px' }}
            placeholder="🔍 Tìm kiếm theo công việc hoặc hành động..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-refresh" onClick={fetchLogs} style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            padding: '10px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaFilter /> Làm mới
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ 
            padding: '16px', 
            background: '#fee2e2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            margin: '16px 0'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            ⏳ Đang tải dữ liệu...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            {search ? '❌ Không tìm thấy bản ghi nào' : '📭 Chưa có lịch sử chỉnh sửa'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Công việc</th>
                <th>Hành động</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td>{log.id}</td>
                  <td style={{ fontWeight: '600', color: '#334155' }}>
                    {log.title || `Todo #${log.todo_id}`}
                  </td>
                  <td>
                    <span style={{
                      background: getActionBadgeColor(log.action),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaClock style={{ fontSize: '12px' }} />
                      {formatDate(log.log_time)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TodoLogs;