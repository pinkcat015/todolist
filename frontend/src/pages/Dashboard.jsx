import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import todoApi from '../api/todo.api';
import { FaCheckCircle, FaClipboardList, FaClock, FaPlus, FaClock as FaClockIcon } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [nearDeadline, setNearDeadline] = useState([]);
  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '🌅 Chào buổi sáng';
  if (hour >= 12 && hour < 13) return '☀️ Chào buổi trưa';
  if (hour >= 13 && hour < 18) return '🌤️ Chào buổi chiều';
  return '🌙 Chào buổi tối';
};
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await todoApi.getTodos({ limit: 100 });
        if (res.data?.data) {
          const all = res.data.data;
          const completed = all.filter(t => t.status === 'completed').length;
          const pending = all.filter(t => t.status === 'pending').length;
          const inProgress = all.filter(t => t.status === 'in_progress').length;
          
          setStats({
            total: res.data.meta?.total || all.length,
            completed,
            pending,
            inProgress
          });

          // Get 10 most recent tasks (ordered by creation)
          setRecentTasks(all.slice(0, 10));

          // Get tasks with deadline in next 7 days
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);

          const upcomingDeadlines = all.filter(t => {
            if (!t.deadline || t.status === 'completed') return false;
            const deadline = new Date(t.deadline);
            deadline.setHours(0, 0, 0, 0);
            return deadline >= today && deadline <= nextWeek;
          }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

          setNearDeadline(upcomingDeadlines);
        }
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  const getCatName = (catId) => {
    // This will be a simple function for now
    return catId ? `Category ${catId}` : '—';
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') return '⏳ Chưa bắt đầu';
    if (status === 'in_progress') return '🔄 Đang làm';
    return '✅ Đã hoàn thành';
  };

  return (
    <div className="page-container">
      <div>
        <h2 className="page-title">{getGreeting()}!</h2>
        <span className="breadcrumb">Dashboard / Tổng quan công việc</span>
      </div>

      {/* STATS ROW */}
      <div className="dashboard-stats" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div className="stat-card blue">
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284c7' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Total</div>
        </div>
        <div className="stat-card yellow">
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Pending</div>
        </div>
        <div className="stat-card orange">
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f97316' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>In Progress</div>
        </div>
        <div className="stat-card green">
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{stats.completed}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Completed</div>
        </div>
      </div>

      {/* CHART & NEAR DEADLINE ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* CHART PLACEHOLDER */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#334155' }}>📈 Biểu đồ tiến độ</h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '150px',
            background: '#f8fafc',
            borderRadius: '8px',
            color: '#94a3b8',
            fontSize: '13px'
          }}>
            Biểu đồ tùy chỉnh sẽ hiển thị tại đây
          </div>
        </div>

        {/* NEAR DEADLINE */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#334155' }}>⏰ Sắp hết hạn (7 ngày tới)</h3>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {nearDeadline.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px 0' }}>
                Không có công việc sắp hết hạn 🎉
              </div>
            ) : (
              nearDeadline.map(task => (
                <div key={task.id} style={{
                  padding: '10px',
                  borderLeft: '3px solid #f97316',
                  borderRadius: '4px',
                  background: '#fef3c7',
                  marginBottom: '8px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: '600', color: '#334155' }}>{task.title}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RECENT TASKS */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#334155' }}>📝 Công việc gần đây</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '30px 0' }}>
              Chưa có công việc nào 🍃
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {recentTasks.map((task, index) => (
                  <tr key={task.id} style={{
                    borderBottom: index < recentTasks.length - 1 ? '1px solid #e2e8f0' : 'none',
                    padding: '12px 0'
                  }}>
                    <td style={{ padding: '12px 0', width: '45%', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                      {task.title}
                    </td>
                    <td style={{ padding: '12px 0', width: '25%', fontSize: '12px', color: '#64748b' }}>
                      <span style={{
                        background: task.status === 'pending' ? '#fce7f3' : task.status === 'in_progress' ? '#fef3c7' : '#dcfce7',
                        color: task.status === 'pending' ? '#be185d' : task.status === 'in_progress' ? '#b45309' : '#166534',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {getStatusBadge(task.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', width: '30%', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD TASK BUTTON */}
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/tasks')}
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <FaPlus /> Thêm công việc mới
        </button>
      </div>
    </div>
  );
};

export default Dashboard;