import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';

// --- Styles Reuse (Có thêm phần passwordContainer) ---
const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  videoBackground: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    objectFit: 'cover', zIndex: 1,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 2,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.85)', padding: '40px', borderRadius: '15px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.4)', width: '100%', maxWidth: '400px',
    zIndex: 3, position: 'relative', backdropFilter: 'blur(15px)',
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  h1: { fontSize: '2rem', margin: '0', color: '#ec4899' },
  errorMessage: {
    backgroundColor: '#fee', color: '#c33', padding: '12px',
    borderRadius: '5px', marginBottom: '20px', borderLeft: '4px solid #c33',
  },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#ec4899', fontWeight: '600' },
  input: {
    width: '100%', padding: '12px', border: '1px solid #ddd',
    borderRadius: '5px', fontSize: '1rem', transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  passwordContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  toggleBtn: {
    position: 'absolute', right: '12px', background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '1.2rem', color: '#ec4899', padding: '0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hovered, setHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (formData.password !== formData.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/auth/reset-password', {
        token,
        newPassword: formData.password
      });
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Link đã hết hạn hoặc lỗi hệ thống');
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
          <h1 style={styles.h1}>ĐẶT LẠI MẬT KHẨU </h1>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Mật khẩu mới */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Mật khẩu mới</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPass ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Nhập mật khẩu mới"
                required
                style={{...styles.input, paddingRight: '40px'}}
              />
              <button type="button" style={styles.toggleBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Nhập lại mật khẩu</label>
            <div style={styles.passwordContainer}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirm}
                onChange={e => setFormData({...formData, confirm: e.target.value})}
                placeholder="Xác nhận mật khẩu"
                required
                style={{...styles.input, paddingRight: '40px'}}
              />
              <button type="button" style={styles.toggleBtn} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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
            {loading ? 'Đang xử lý...' : 'Xác Nhận'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;