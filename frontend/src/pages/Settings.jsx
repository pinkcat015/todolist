import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, Button, Tabs, Upload, message, 
  Avatar, Row, Col, Typography, Switch, Divider, Spin, theme, Select 
} from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, 
  PhoneOutlined, SaveOutlined, UploadOutlined, 
  SettingOutlined, BellOutlined, CameraOutlined 
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import authApi from '../api/auth.api';
import userApi from '../api/user.api';

const { Text } = Typography;
const THEME_COLOR = '#722ed1';
const API_URL = 'http://localhost:3000'; 

const Settings = () => {
  // 1. Lấy Token màu sắc
  const { token } = theme.useToken();
  const { isDarkMode, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [user, setUser] = useState({ 
    full_name: '', email: '', avatar_url: '', phone: '', telegram_chat_id: '', default_remind_minutes: 30
  });
  
  const [fileList, setFileList] = useState([]); 
  const [previewImage, setPreviewImage] = useState(null);

  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();

  // --- LOGIC GIỮ NGUYÊN ---
  useEffect(() => {
    const fetchUser = async () => {
      setDataLoading(true);
      try {
        const res = await authApi.getCurrentUser(); 
        if (res.data && res.data.user) {
          const userData = res.data.user;
          setUser(userData);
          formProfile.setFieldsValue(userData);
        }
      } catch (error) {
        console.error(error);
        message.error('Không thể tải thông tin người dùng');
      } finally {
        setDataLoading(false);
      }
    };
    fetchUser();
  }, [formProfile]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const objectUrl = URL.createObjectURL(newFileList[0].originFileObj);
      setPreviewImage(objectUrl);
    } else {
      setPreviewImage(null);
    }
  };

  const getAvatarSrc = () => {
    if (previewImage) return previewImage;
    if (user.avatar_url) {
      if (user.avatar_url.startsWith('http')) return user.avatar_url;
      return `${API_URL}${user.avatar_url}`;
    }
    return null;
  };

  const onFinishProfile = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', values.full_name || '');
      formData.append('phone', values.phone || '');
      formData.append('telegram_chat_id', values.telegram_chat_id || '');
      formData.append('default_remind_minutes', values.default_remind_minutes || 30);
      if (fileList.length > 0) {
        formData.append('avatar', fileList[0].originFileObj);
      }
      const res = await userApi.updateProfile(formData);
      message.success('Cập nhật hồ sơ thành công! 🎉');
      if (res.data?.newAvatar) {
        setUser(prev => ({ ...prev, avatar_url: res.data.newAvatar }));
        setPreviewImage(null);
        setFileList([]);
      }
      setUser(prev => ({ ...prev, ...values }));
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const onFinishPassword = async (values) => {
    setLoading(true);
    try {
      await userApi.changePassword(values);
      message.success('Đổi mật khẩu thành công!');
      formPassword.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Mật khẩu cũ không đúng');
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateRemindTime = async (minutes) => {
    try {
      // 1. Cập nhật giao diện ngay lập tức cho mượt
      setUser(prev => ({ ...prev, default_remind_minutes: minutes }));

      // 2. Gọi API lưu xuống Database
      // Lưu ý: Phải gửi kèm cả tên và sđt cũ để không bị mất dữ liệu
      const formData = new FormData();
      formData.append('full_name', user.full_name || '');
      formData.append('phone', user.phone || '');
      formData.append('telegram_chat_id', user.telegram_chat_id || '');
      formData.append('default_remind_minutes', minutes); // Giá trị mới

      await userApi.updateProfile(formData);
      message.success('Đã lưu thời gian nhắc!');
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu cài đặt');
    }
  };
  // --- UI COMPONENTS (Đã chỉnh màu) ---

  const GeneralSettings = () => (
    <Form form={formProfile} layout="vertical" onFinish={onFinishProfile}>
      <Row gutter={40}>
        <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <Avatar 
                size={140} 
                src={getAvatarSrc()}
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: token.colorFill, // Màu nền avatar động
                  // Border màu trùng với màu nền Card để tạo hiệu ứng cắt
                  border: `4px solid ${token.colorBgContainer}`, 
                  boxShadow: token.boxShadow
                }} 
              />
              <Upload
                beforeUpload={() => false} fileList={fileList} onChange={handleUploadChange}
                maxCount={1} accept="image/*" showUploadList={false}
              >
                <Button 
                  shape="circle" icon={<CameraOutlined />} type="primary"
                  style={{ position: 'absolute', bottom: 10, right: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} 
                />
              </Upload>
            </div>
            
            <div style={{ textAlign: 'center' }}>
               <Text strong style={{ fontSize: 18, color: token.colorText }}>{user.username}</Text>
               <div style={{ color: token.colorTextSecondary }}>Người dùng</div>
            </div>

            <Upload
              beforeUpload={() => false} fileList={fileList} onChange={handleUploadChange}
              maxCount={1} accept="image/*" showUploadList={false}
            >
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>Thay đổi ảnh</Button>
            </Upload>
          </div>
        </Col>
        
        <Col xs={24} md={16}>
          <Row gutter={20}>
            <Col span={24}>
              <Form.Item label="Họ và tên hiển thị" name="full_name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input size="large" prefix={<UserOutlined style={{color: THEME_COLOR}} />} placeholder="Nhập tên của bạn" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email (Không thể sửa)" name="email">
                <Input 
                  size="large" prefix={<MailOutlined />} disabled 
                  style={{ 
                    borderRadius: 10, cursor: 'not-allowed', 
                    backgroundColor: token.colorFillQuaternary, // Màu nền input disabled
                    color: token.colorTextDisabled 
                  }} 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input size="large" prefix={<PhoneOutlined />} placeholder="09xxxx..." style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Divider orientation="left" style={{ borderColor: '#d9d9d9', color: '#888', fontSize: 13 }}>
                 Thông báo & Nhắc nhở
              </Divider>
              
              <Form.Item 
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Telegram Chat ID 
                    <a 
                      href="https://t.me/pinkcat015_bot" // Thay link bot của bạn vào đây
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ fontSize: 12, fontWeight: 400, color: THEME_COLOR }}
                    >
                      (Lấy ID thế nào?)
                    </a>
                  </span>
                } 
                name="telegram_chat_id"
                help="Chat '/start' với bot trên Telegram để lấy ID và dán vào đây."
              >
                <Input 
                  size="large" 
                  prefix={<span style={{fontSize: 18}}>✈️</span>} 
                  placeholder="Ví dụ: 123456789" 
                  style={{ borderRadius: 10 }} 
                />
              </Form.Item>
            </Col>

          </Row>
          
          <Divider style={{ margin: '15px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="primary" htmlType="submit" size="large" loading={loading} icon={<SaveOutlined />}
              style={{ borderRadius: 12, padding: '0 35px', height: 45, fontWeight: 600, boxShadow: '0 4px 15px rgba(114, 46, 209, 0.3)' }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );

  const SecuritySettings = () => (
    <div style={{ maxWidth: 450, margin: '20px auto 0' }}>
      <Form form={formPassword} layout="vertical" onFinish={onFinishPassword}>
        <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Nhập mật khẩu cũ để xác nhận' }]}>
          <Input.Password size="large" style={{ borderRadius: 10 }} prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>
        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
          <Input.Password size="large" style={{ borderRadius: 10 }} prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>
        <Form.Item label="Nhập lại mật khẩu mới" name="confirmPassword" dependencies={['newPassword']} rules={[{ required: true, message: 'Nhập lại mật khẩu' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Mật khẩu không khớp!')); }, }),]}>
          <Input.Password size="large" style={{ borderRadius: 10 }} prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ borderRadius: 12, marginTop: 15, background: '#ff4d4f', borderColor: '#ff4d4f', height: 45, fontWeight: 600 }}>Đổi mật khẩu</Button>
      </Form>
    </div>
  );

  const PreferenceSettings = () => (
    <div style={{ padding: '10px 20px' }}>
      
      {/* 1. Cài đặt Email */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <Text strong style={{ fontSize: 16, color: token.colorText }}>Thông báo Email</Text>
          <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>Nhận email nhắc nhở khi có công việc sắp đến hạn.</div>
        </div>
        <Switch defaultChecked style={{ background: THEME_COLOR }} />
      </div>

      {/* 2. Cài đặt Âm thanh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
           <Text strong style={{ fontSize: 16, color: token.colorText }}>Âm thanh hoàn thành</Text>
           <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>Phát âm thanh "Ting" khi bạn tích hoàn thành một việc.</div>
        </div>
        <Switch defaultChecked style={{ background: '#52c41a' }} />
      </div>

      {/* 3. Cài đặt Dark Mode */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <Text strong style={{ fontSize: 16, color: token.colorText }}>Chế độ tối (Dark Mode)</Text>
           <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>Chuyển sang giao diện tối để bảo vệ mắt.</div>
        </div>
        <Switch 
          checked={isDarkMode} 
          onChange={toggleTheme} 
          checkedChildren="Bật" 
          unCheckedChildren="Tắt" 
        />
      </div>

      {/* --- PHẦN MỚI THÊM: Dòng kẻ ngăn cách --- */}
      <Divider style={{ margin: '25px 0' }} />

      {/* 4. Cài đặt Thời gian nhắc Telegram */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <Text strong style={{ fontSize: 16, color: token.colorText }}>Thời gian nhắc hẹn (Telegram)</Text>
           <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>
             Bot sẽ nhắn tin nhắc bạn trước Deadline bao lâu?
           </div>
        </div>
        
        {/* Ô chọn Select */}
        <Select 
          value={user.default_remind_minutes || 30} // Lấy giá trị từ User
          onChange={handleUpdateRemindTime}          // Gọi hàm lưu khi thay đổi
          style={{ width: 140 }}
          options={[
            { value: 10, label: 'Trước 10 phút' },
            { value: 30, label: 'Trước 30 phút' },
            { value: 60, label: 'Trước 1 tiếng' },
            { value: 180, label: 'Trước 3 tiếng' },
            { value: 1440, label: 'Trước 1 ngày' },
          ]}
        />
      </div>
    </div>
  );

  const items = [
    { key: '1', label: <span><UserOutlined /> Hồ sơ cá nhân</span>, children: <GeneralSettings /> },
    { key: '2', label: <span><LockOutlined /> Mật khẩu & Bảo mật</span>, children: <SecuritySettings /> },
    { key: '3', label: <span><BellOutlined /> Tùy chọn ứng dụng</span>, children: <PreferenceSettings /> },
  ];

  return (
    // Xóa ConfigProvider để nhận Theme Global
    <>
      {/* HEADER CARD */}
      <Card variant="borderless" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: token.boxShadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: '50%', display: 'flex' }}><SettingOutlined style={{ fontSize: 32, color: 'white' }} /></div>
          <div><h1 style={{ color: 'white', margin: 0, fontSize: 24 }}>Cài đặt tài khoản</h1><p style={{ opacity: 0.9, marginTop: 5, fontSize: 15, margin: 0 }}>Quản lý thông tin cá nhân và bảo mật của bạn.</p></div>
        </div>
      </Card>

      {/* MAIN CONTENT CARD */}
      <Card variant="borderless" style={{ borderRadius: 16, boxShadow: token.boxShadowTertiary, minHeight: 550 }}>
        {dataLoading ? (<div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>) : (
          <Tabs defaultActiveKey="1" items={items} tabPlacement="left" size="large" tabBarStyle={{ minWidth: 220, paddingRight: 20 }} />
        )}
      </Card>
    </>
  );
};

export default Settings;