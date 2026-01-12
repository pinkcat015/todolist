import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Sidebar from '../components/Sidebar';

const { Content } = Layout;

const MainLayout = () => {
  // Lấy màu nền động từ Theme (để hỗ trợ Dark Mode)
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      {/* Sidebar giữ nguyên (đang có width=260px và position: fixed) */}
      <Sidebar />

      {/* SỬA LỖI Ở ĐÂY:
         Thêm marginLeft: 260 để đẩy nội dung sang phải, 
         tránh bị Sidebar che mất.
      */}
      <Layout style={{ marginLeft: 260, transition: 'all 0.2s' }}>
        <Content
          style={{
            // Màu nền tự động đổi theo chế độ Sáng/Tối
            background: colorBgLayout, 
            minHeight: '100vh',
            // Thêm padding để nội dung không dính sát lề
            padding: '24px', 
            overflow: 'initial' 
          }}
        >
          {/* Nơi hiển thị các trang con */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;