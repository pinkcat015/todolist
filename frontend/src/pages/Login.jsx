import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/auth.api';

const styles = {
  loginContainer: {
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
  loginCard: {
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
  loginHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  h1: {
    fontSize: '2.5rem',
    margin: '0',
    color: '#ec4899',
  },
  h2: {
    fontSize: '1.5rem',
    color: '#ec4899',
    margin: '10px 0 0 0',
    fontWeight: '600',
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    borderLeft: '4px solid #c33',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#ec4899',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#667eea',
    boxShadow: '0 0 5px rgba(102, 126, 234, 0.2)',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  submitBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 25px rgba(244, 114, 182, 0.5)',
  },
  submitBtnDisabled: {
    opacity: '0.7',
    cursor: 'not-allowed',
  },
  toggleMode: {
    textAlign: 'center',
    marginTop: '20px',
  },
  toggleP: {
    color: '#666',
    margin: '0',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#ec4899',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '5px',
    textDecoration: 'underline',
    fontSize: '1rem',
  },
  toggleBtnHover: {
    color: '#f472b6',
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#ec4899',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredSubmit, setHoveredSubmit] = useState(false);
  const [hoveredToggle, setHoveredToggle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authApi.login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        response = await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
  };

  return (
    <div style={styles.loginContainer}>
      <video
        style={styles.videoBackground}
        autoPlay
        muted
        loop
        src="https://www.pexels.com/download/video/9034457/"
      />
      <div style={styles.overlay} />
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <h1 style={styles.h1}>TODOLIST</h1>
          <h2 style={styles.h2}>{isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</h2>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Tên người dùng</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên người dùng"
              required
              style={styles.input}
            />
          </div>

          {!isLogin && (
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email"
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Mật khẩu</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                style={{...styles.input, paddingRight: '40px'}}
              />
              <button
                type="button"
                style={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Xác nhận mật khẩu</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu"
                  required
                  style={{...styles.input, paddingRight: '40px'}}
                />
                <button
                  type="button"
                  style={styles.togglePasswordBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(hoveredSubmit && !loading ? styles.submitBtnHover : {}),
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
            onMouseEnter={() => !loading && setHoveredSubmit(true)}
            onMouseLeave={() => setHoveredSubmit(false)}
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
          </button>
        </form>

        <div style={styles.toggleMode}>
          <p style={styles.toggleP}>
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button 
              type="button" 
              onClick={toggleMode}
              style={{
                ...styles.toggleBtn,
                ...(hoveredToggle ? styles.toggleBtnHover : {}),
              }}
              onMouseEnter={() => setHoveredToggle(true)}
              onMouseLeave={() => setHoveredToggle(false)}
            >
              {isLogin ? 'Đăng Ký' : 'Đăng Nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
