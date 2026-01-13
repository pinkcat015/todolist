import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Thêm FaHistory vào danh sách import
import { FaHome, FaHeart, FaCog, FaSignOutAlt, FaClock, FaHistory, FaCalendar } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      {/* Tiêu đề dùng gradient text trong CSS */}
      <div className="sidebar-header">
        MY TODO ✨
      </div>
      
      <div className="sidebar-menu">
        <NavLink to="/" end className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <FaHome className="icon" /> Tổng quan
        </NavLink>
        
        <NavLink to="/tasks" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <FaHeart className="icon" /> Công việc của tôi
        </NavLink>
        
        {/* --- MỤC MỚI THÊM VÀO --- */}
        <NavLink to="/history" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <FaHistory className="icon" /> Lưu trữ & Đã xong
        </NavLink>
        {/* ------------------------- */}

        <NavLink to="/calendar" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <FaCalendar className="icon" /> Lịch làm việc
        </NavLink> 

        <NavLink to="/logs" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <FaClock className="icon" /> Lịch sử hoạt động
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
          <FaCog className="icon" /> Cài đặt
        </NavLink>
      </div>

      <div style={{ padding: '20px' }}>
        <button
          onClick={handleLogout}
          style={{ 
            width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', 
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <FaSignOutAlt /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;