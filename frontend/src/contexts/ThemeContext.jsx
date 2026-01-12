import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Tạo Context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 2. Lấy trạng thái từ localStorage (nếu có), mặc định là false (Light mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved === 'true';
  });

  // 3. Hàm chuyển đổi
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('isDarkMode', newMode); // Lưu vào bộ nhớ
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook để dùng nhanh ở các file khác
export const useTheme = () => useContext(ThemeContext);