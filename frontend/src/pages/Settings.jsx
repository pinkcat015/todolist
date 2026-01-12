import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, Button, Tabs, Upload, message, 
  Avatar, Row, Col, Typography, ConfigProvider, Switch, Divider, Spin 
} from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, 
  PhoneOutlined, SaveOutlined, UploadOutlined, 
  SettingOutlined, BellOutlined, CameraOutlined 
} from '@ant-design/icons';

// Import 2 file API bạn đã tạo
import authApi from '../api/auth.api';
import userApi from '../api/user.api';

const { Text } = Typography;
const THEME_COLOR = '#722ed1';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  // State lưu thông tin user
  const [user, setUser] = useState({ 
    full_name: '', 
    email: '', 
    avatar_url: '', 
    phone: '' 
  });
  
  // State lưu file ảnh tạm thời khi chọn
  const [fileList, setFileList] = useState([]); 
  const [previewImage, setPreviewImage] = useState(null);

  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();

  // 1. Load thông tin user khi vào trang
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

  // 2. Xử lý khi người dùng chọn ảnh (Preview)
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    // Tạo link ảnh ảo (blob) để xem trước ngay lập tức
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const objectUrl = URL.createObjectURL(newFileList[0].originFileObj);
      setPreviewImage(objectUrl);
    } else {
      setPreviewImage(null);
    }
  };

  // 3. Submit cập nhật Hồ sơ (Upload ảnh + Text)
  const onFinishProfile = async (values) => {
    setLoading(true);
    try {
      // Dùng FormData để gửi file
      const formData = new FormData();
      formData.append('full_name', values.full_name) || '';
      formData.append('phone', values.phone || '');
      
      // Nếu có chọn ảnh mới thì gửi file, không thì thôi
      if (fileList.length > 0) {
        formData.append('avatar', fileList[0].originFileObj);
      }

      // Gọi API updateProfile
      const res = await userApi.updateProfile(formData);
      
      message.success('Cập nhật hồ sơ thành công! 🎉');
      
      // Cập nhật lại state UI với avatar mới từ server (nếu có)
      if (res.data?.newAvatar) {
        setUser(prev => ({ ...prev, avatar_url: res.data.newAvatar }));
        setPreviewImage(null); // Xóa preview tạm
        setFileList([]); // Reset list upload
      }
      
      // Cập nhật các text khác
      setUser(prev => ({ ...prev, ...values }));

    } catch (error) {
      console.error(error);
      message.error('Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit đổi mật khẩu
  const onFinishPassword = async (values) => {
    setLoading(true);
    try {
      await userApi.changePassword(values);
      message.success('Đổi mật khẩu thành công! Hãy nhớ mật khẩu mới nhé 🔐');
      formPassword.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Mật khẩu cũ không đúng');
    } finally {
      setLoading(false);
    }
  };

  // --- UI TAB 1: THÔNG TIN CÁ NHÂN ---
  const GeneralSettings = () => (
    <Form 
      form={formProfile} 
      layout="vertical" 
      onFinish={onFinishProfile}
    >
      <Row gutter={40}>
        {/* Cột trái: Avatar */}
        <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <Avatar 
                size={140} 
                // Ưu tiên hiện ảnh preview (vừa chọn), nếu không có thì hiện ảnh từ DB
                src={previewImage || user.avatar_url || null}
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: '#f0f2f5', 
                  border: `4px solid white`, 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)' 
                }} 
              />
              {/* Nút upload nhỏ góc ảnh */}
              <Upload
                beforeUpload={() => false} // Chặn upload tự động
                fileList={fileList}
                onChange={handleUploadChange}
                maxCount={1}
                accept="image/*"
                showUploadList={false}
              >
                <Button 
                  shape="circle" 
                  icon={<CameraOutlined />} 
                  type="primary"
                  style={{ 
                    position: 'absolute', 
                    bottom: 10, 
                    right: 10, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)' 
                  }} 
                />
              </Upload>
            </div>
            
            <div style={{ textAlign: 'center' }}>
               <Text strong style={{ fontSize: 18 }}>{user.username}</Text>
               <div style={{ color: '#888' }}>Người dùng</div>
            </div>

            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={1}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>Thay đổi ảnh</Button>
            </Upload>
          </div>
        </Col>
        
        {/* Cột phải: Form nhập liệu */}
        <Col xs={24} md={16}>
          <Row gutter={20}>
            <Col span={24}>
              <Form.Item label="Họ và tên hiển thị" name="full_name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input size="large" prefix={<UserOutlined style={{color: THEME_COLOR}} />} placeholder="Nhập tên của bạn" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email (Không thể sửa)" name="email">
                <Input size="large" prefix={<MailOutlined />} disabled style={{ borderRadius: 10, cursor: 'not-allowed', backgroundColor: '#f9f9f9', color: '#888' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input size="large" prefix={<PhoneOutlined />} placeholder="09xxxx..." style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider style={{ margin: '15px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={loading}
              icon={<SaveOutlined />}
              style={{ borderRadius: 12, padding: '0 35px', height: 45, fontWeight: 600, boxShadow: '0 4px 15px rgba(114, 46, 209, 0.3)' }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );

  // --- UI TAB 2: BẢO MẬT ---
  const SecuritySettings = () => (
    <div style={{ maxWidth: 450, margin: '20px auto 0' }}>
      <Form form={formPassword} layout="vertical" onFinish={onFinishPassword}>
        <Form.Item 
          label="Mật khẩu hiện tại" 
          name="currentPassword" 
          rules={[{ required: true, message: 'Nhập mật khẩu cũ để xác nhận' }]}
        >
          <Input.Password size="large" style={{ borderRadius: 10 }} prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>

        <Form.Item 
          label="Mật khẩu mới" 
          name="newPassword" 
          rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
        >
          <Input.Password size="large" style={{ borderRadius: 10 }} prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>

        <Form.Item 
          label="Nhập lại mật khẩu mới" 
          name="confirmPassword" 
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Nhập lại mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password size="large" style={{ borderRadius: 10 }} prefix={<LockOutlined />} placeholder="••••••" />
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          size="large" 
          block 
          loading={loading}
          style={{ borderRadius: 12, marginTop: 15, background: '#ff4d4f', borderColor: '#ff4d4f', height: 45, fontWeight: 600 }}
        >
          Đổi mật khẩu
        </Button>
      </Form>
    </div>
  );

  // --- UI TAB 3: TÙY CHỈNH (Demo UI) ---
  const PreferenceSettings = () => (
    <div style={{ padding: '10px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>Thông báo Email</Text>
          <div style={{ color: '#888', marginTop: 4 }}>Nhận email nhắc nhở khi có công việc sắp đến hạn.</div>
        </div>
        <Switch defaultChecked style={{ background: THEME_COLOR }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>Âm thanh hoàn thành</Text>
          <div style={{ color: '#888', marginTop: 4 }}>Phát âm thanh "Ting" khi bạn tích hoàn thành một việc.</div>
        </div>
        <Switch defaultChecked style={{ background: '#52c41a' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>Chế độ tối (Dark Mode)</Text>
          <div style={{ color: '#888', marginTop: 4 }}>Chuyển sang giao diện tối để bảo vệ mắt.</div>
        </div>
        <Switch disabled checkedChildren="Sắp có" unCheckedChildren="Tắt" />
      </div>
    </div>
  );

  const items = [
    { key: '1', label: <span><UserOutlined /> Hồ sơ cá nhân</span>, children: <GeneralSettings /> },
    { key: '2', label: <span><LockOutlined /> Mật khẩu & Bảo mật</span>, children: <SecuritySettings /> },
    { key: '3', label: <span><BellOutlined /> Tùy chọn ứng dụng</span>, children: <PreferenceSettings /> },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: THEME_COLOR,
          borderRadius: 16,
          fontFamily: 'Nunito, Quicksand, sans-serif',
        },
      }}
    >
      <div style={{ padding: '24px 40px', background: '#f5f7fa', minHeight: '100vh' }}>
        
        {/* HEADER: Đồng bộ style TaskManager */}
        <Card variant="borderless" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: '0 8px 20px rgba(114, 46, 209, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: '50%', display: 'flex' }}>
               <SettingOutlined style={{ fontSize: 32, color: 'white' }} />
            </div>
            <div>
              <h1 style={{ color: 'white', margin: 0, fontSize: 24 }}>Cài đặt tài khoản</h1>
              <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15, margin: 0 }}>Quản lý thông tin cá nhân và bảo mật của bạn.</p>
            </div>
          </div>
        </Card>

        {/* MAIN CONTENT */}
        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', minHeight: 550 }}>
          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
          ) : (
            <Tabs 
              defaultActiveKey="1" 
              items={items} 
              tabPlacement="left"
              size="large"
              tabBarStyle={{ minWidth: 220, paddingRight: 20 }}
            />
          )}
        </Card>

      </div>
    </ConfigProvider>
  );
};

export default Settings;