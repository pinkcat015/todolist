// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd'; // Import theme của Antd

// Import Context vừa tạo
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import TaskManager from './pages/TaskManager';
import TodoLogs from './pages/TodoLogs';
import Login from './pages/Login';
import Settings from './pages/Settings';
import HistoryLogs from './pages/HistoryLogs';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Protected Route Component (Giữ nguyên)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- Component con chứa nội dung và cấu hình Theme ---
const AppContent = () => {
  const { isDarkMode } = useTheme();

  // Hiệu ứng: Đổi màu nền body của trình duyệt để không bị vệt trắng
  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#141414' : '#f5f7fa';
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        // Tự động chuyển đổi thuật toán Sáng/Tối
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        
        // Giữ nguyên màu tím chủ đạo
        token: {
          colorPrimary: '#722ed1', 
          borderRadius: 12,
          fontFamily: 'Nunito, Quicksand, sans-serif',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Route>
          {/* Protected Routes with Layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="logs" element={<TodoLogs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="history" element={<HistoryLogs />} />
            
          </Route>
  
          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

// --- Component App chính ---
function App() {
  return (
    // Bọc ThemeProvider ở ngoài cùng để toàn app truy cập được state
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;