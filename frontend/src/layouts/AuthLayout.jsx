import React from 'react';
import { Outlet } from 'react-router-dom';

// Style chung cho phần nền
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  // Wrapper để định vị nội dung con ở giữa
  contentWrapper: {
    zIndex: 3,
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  }
};

const AuthLayout = () => {
  return (
    <div style={styles.container}>
      {/* Video Background chạy 1 lần duy nhất ở đây */}
      <video
        style={styles.videoBackground}
        autoPlay
        muted
        loop
        src="https://www.pexels.com/download/video/9034457/"
      />
      <div style={styles.overlay} />

      {/* Outlet là nơi các trang Login/Forgot/Reset sẽ hiển thị */}
      <div style={styles.contentWrapper}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;