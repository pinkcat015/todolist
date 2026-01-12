import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Tag, Typography, 
  message, Space, Empty, Tooltip, Popconfirm, theme, Avatar 
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, HistoryOutlined, 
  ClockCircleOutlined, AppstoreAddOutlined, 
  DeleteOutlined, EditOutlined, CheckCircleOutlined, 
  ThunderboltFilled, CloseOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import todoApi from '../api/todo.api';

const { Text } = Typography;

const TodoLogs = () => {
  // 1. Lấy Token màu sắc
  const { token } = theme.useToken();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await todoApi.getLogs();
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await todoApi.deleteLog(id);
      message.success('Đã xóa dòng nhật ký');
      setLogs(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      message.error('Lỗi khi xóa');
    }
  };

  const handleClearLogs = async () => {
    try {
      await todoApi.clearLogs();
      message.success('Đã dọn dẹp lịch sử!');
      fetchLogs();
    } catch (error) {
      message.error('Lỗi khi xóa');
    }
  };

  // --- HELPER: Cấu hình hiển thị ---
  // Sử dụng tên màu chuẩn của Antd (blue, red...) để tự động tương thích Dark Mode
  const getActionConfig = (action) => {
    const act = action ? action.toLowerCase() : '';
    
    if (act.includes('creat')) return { color: 'blue', icon: <AppstoreAddOutlined />, text: 'Tạo mới' };
    if (act.includes('delet')) return { color: 'red', icon: <DeleteOutlined />, text: 'Đã xóa' };
    if (act.includes('complet')) return { color: 'green', icon: <CheckCircleOutlined />, text: 'Hoàn thành' };
    if (act.includes('priority')) return { color: 'gold', icon: <ThunderboltFilled />, text: 'Đổi ưu tiên' };
    if (act.includes('updat')) return { color: 'orange', icon: <EditOutlined />, text: 'Cập nhật' };
    
    return { color: 'default', icon: <HistoryOutlined />, text: 'Hoạt động' };
  };

  // --- CẤU HÌNH CỘT TABLE ---
  const columns = [
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const config = getActionConfig(record.action);
        return (
          <Tag 
            icon={config.icon} 
            color={config.color} 
            // Dùng variant="filled" (Antd 5.x) cho màu nền nhẹ nhàng, tự động đẹp cả sáng lẫn tối
            variant="filled"
            style={{ 
              padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none'
            }}
          >
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Chi tiết',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ color: token.colorText, fontSize: 14 }}>
            {text || <span style={{color: token.colorTextQuaternary, fontStyle: 'italic'}}>Công việc không xác định</span>}
          </Text>
          <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
             Mã công việc: <span style={{fontFamily: 'monospace', color: token.colorTextDescription}}>#{record.todo_id}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'log_time',
      key: 'log_time',
      width: 180,
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <ClockCircleOutlined style={{ color: token.colorTextQuaternary }} />
           <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
             <span style={{ fontWeight: 600, color: token.colorText }}>{dayjs(date).format('HH:mm')}</span>
             <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{dayjs(date).format('DD/MM/YYYY')}</span>
           </div>
        </div>
      )
    },
    {
      title: '',
      key: 'ops',
      width: 50,
      align: 'right',
      render: (_, record) => (
        <Popconfirm 
          title="Xóa dòng này?" 
          onConfirm={() => handleDeleteSingle(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          placement="left"
        >
          <Tooltip title="Xóa bản ghi này">
            <Button 
              type="text" danger icon={<CloseOutlined />} size="small" 
              style={{ opacity: 0.5 }} 
            />
          </Tooltip>
        </Popconfirm>
      )
    }
  ];

  const filteredData = logs.filter(item => {
    const q = searchText.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.action && item.action.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* HEADER CARD */}
      <Card variant="borderless" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: token.boxShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <HistoryOutlined /> Lịch sử hoạt động
            </h1>
            <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15 }}>Theo dõi tất cả thay đổi trong hệ thống của bạn.</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
             <div style={{opacity: 0.9, fontSize: 13, marginBottom: 5}}>Tổng số bản ghi</div>
             <div style={{ 
               background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: 20, 
               fontWeight: 'bold', fontSize: 20, backdropFilter: 'blur(5px)', display: 'inline-block'
             }}>
               {filteredData.length}
             </div>
          </div>
        </div>
      </Card>

      {/* MAIN CONTENT CARD */}
      <Card variant="borderless" style={{ borderRadius: 16, boxShadow: token.boxShadowTertiary }}>
        
        {/* TOOLBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <Input 
            prefix={<SearchOutlined style={{color: token.colorTextPlaceholder}} />} 
            placeholder=" Tìm kiếm lịch sử..." 
            size="large"
            style={{ width: 350, borderRadius: 20 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          
          <Space>
            <Tooltip title="Tải lại dữ liệu">
              <Button icon={<ReloadOutlined />} onClick={fetchLogs} size="large" shape="circle" />
            </Tooltip>
            
            {logs.length > 0 && (
              <Popconfirm 
                title="Xóa toàn bộ lịch sử?" 
                description="Hành động này không thể hoàn tác!"
                onConfirm={handleClearLogs}
                okText="Xóa sạch"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button 
                  danger size="large" icon={<DeleteOutlined />} style={{ borderRadius: 20 }}
                >
                  Xóa tất cả
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        {/* TABLE */}
        <Table
          rowKey={(r) => r.id || Math.random()}
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false, placement: ['bottomRight'] }}
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={<span style={{color: token.colorTextDescription}}>Chưa có hoạt động nào 🍃</span>} 
              />
            ) 
          }}
        />
      </Card>
    </>
  );
};

export default TodoLogs;