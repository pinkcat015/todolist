import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="content-wrapper">
        {/* Outlet là nơi nội dung các trang con (Dashboard, TaskManager) hiển thị */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;