import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd'; // Dùng message của Antd cho đẹp

// --- Copy nguyên bộ Style từ Login sang ---
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
  card: {
    background: 'rgba(255, 255, 255, 0.85)',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '400px',
    zIndex: 3,
    position: 'relative',
    backdropFilter: 'blur(15px)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  h1: { fontSize: '2rem', margin: '0', color: '#ec4899' },
  p: { color: '#666', marginTop: '10px' },
  errorMessage: {
    backgroundColor: '#fee', color: '#c33', padding: '12px',
    borderRadius: '5px', marginBottom: '20px', borderLeft: '4px solid #c33',
  },
  successMessage: {
    backgroundColor: '#f6ffed', color: '#52c41a', padding: '12px',
    borderRadius: '5px', marginBottom: '20px', borderLeft: '4px solid #52c41a',
  },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#ec4899', fontWeight: '600' },
  input: {
    width: '100%', padding: '12px', border: '1px solid #ddd',
    borderRadius: '5px', fontSize: '1rem', transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  submitBtnHover: { transform: 'translateY(-2px)', boxShadow: '0 5px 25px rgba(244, 114, 182, 0.5)' },
  submitBtnDisabled: { opacity: '0.7', cursor: 'not-allowed' },
  backLink: {
    textAlign: 'center', marginTop: '20px', display: 'block',
    color: '#ec4899', fontWeight: '600', textDecoration: 'none'
  }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' }); // type: 'error' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await axios.post('http://localhost:3000/auth/forgot-password', { email });
      setStatus({ type: 'success', msg: 'Đã gửi email! Hãy kiểm tra hộp thư (cả mục Spam).' });
      message.success('Đã gửi yêu cầu!');
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Không thể gửi yêu cầu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <video style={styles.videoBackground} autoPlay muted loop src="https://www.pexels.com/download/video/9034457/" />
      <div style={styles.overlay} />
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.h1}>QUÊN MẬT KHẨU? </h1>
          <p style={styles.p}>Nhập email để lấy lại quyền truy cập</p>
        </div>

        {status.msg && (
          <div style={status.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email đăng ký</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(hovered && !loading ? styles.submitBtnHover : {}),
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
          </button>
        </form>

        <Link 
            to="/login" 
            style={styles.backLink}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;