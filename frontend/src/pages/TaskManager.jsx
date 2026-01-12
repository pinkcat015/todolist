import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  DatePicker, Tag, Space, message, Popconfirm, Card, Row, Col, Tooltip, 
  Progress, Avatar, Empty, theme, Typography 
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, CheckCircleFilled, FireFilled, 
  ThunderboltFilled, CoffeeOutlined, StarFilled,
  ClockCircleOutlined, SyncOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import todoApi from '../api/todo.api';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// --- Cấu hình màu sắc & Style ---
const THEME_COLOR = '#722ed1'; 

const TaskManager = () => {
  // 1. Lấy Token màu sắc
  const { token } = theme.useToken();

  // --- STATE ---
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  
  // Filter & Pagination
  const [filters, setFilters] = useState({ page: 1, limit: 10, q: '', status: null, category: null, priority: null });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // --- LOGIC LỜI CHÀO ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Chào buổi sáng tốt lành ☀️";
    if (hour >= 11 && hour < 14) return "Chào buổi trưa, nhớ nghỉ ngơi nhé 🍚";
    if (hour >= 14 && hour < 18) return "Chào buổi chiều tràn đầy năng lượng ⚡";
    return "Chào buổi tối, thư giãn thôi 🌙";
  };

  // --- API CALLS ---
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, prioRes] = await Promise.all([todoApi.getCategories(), todoApi.getPriorities()]);
        setCategories(catRes.data || []);
        setPriorities(prioRes.data || []);
      } catch (e) { console.error(e); }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [filters]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await todoApi.getTodos(filters);
      if (res.data?.data) {
        setTodos(res.data.data);
        setPagination({
          current: filters.page,
          pageSize: filters.limit,
          total: res.data.meta?.total || 0,
        });
      }
    } catch (e) {
      message.error("Không tải được dữ liệu 😢");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const handleTableChange = (newPagination) => setFilters(prev => ({ ...prev, page: newPagination.current, limit: newPagination.pageSize }));
  
  const handleDelete = async (id) => {
    try { await todoApi.deleteTodo(id); message.success("Đã xóa nha! 🗑️"); fetchTodos(); } catch (e) {}
  };

  const handleStatusNext = async (record) => {
    let newStatus = record.status === 'pending' ? 'in_progress' : 'completed';
    try { await todoApi.updateTodo(record.id, { status: newStatus }); message.success("Cập nhật trạng thái thành công! 🚀"); fetchTodos(); } catch (e) {}
  };

  const openModal = (record = null) => {
    setIsModalOpen(true);
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        category_id: record.category_id || undefined,
        priority_id: record.priority_id || undefined,
        deadline: record.deadline ? dayjs(record.deadline) : null, 
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const payload = { ...values, deadline: values.deadline ? values.deadline.toISOString() : null };
      if (editingId) {
        await todoApi.updateTodo(editingId, payload);
        message.success("Đã lưu thay đổi! ✨");
      } else {
        await todoApi.createTodo(payload);
        message.success("Đã tạo việc mới! 💪");
        setFilters(prev => ({ ...prev, page: 1 }));
      }
      setIsModalOpen(false);
      fetchTodos();
    } catch (error) { message.error("Có lỗi xảy ra 😵"); }
  };

  // --- CẤU HÌNH CỘT TABLE ---
  const columns = [
    { 
      title: 'Công việc', 
      dataIndex: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar: Màu nền động theo theme */}
          <Avatar 
            shape="square" 
            style={{ 
              backgroundColor: record.status === 'completed' ? token.colorFill : token.orange1, 
              color: token.orange6, 
              borderRadius: 8 
            }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ 
              fontWeight: 700, fontSize: 15, 
              // Màu chữ động
              color: token.colorText,
              textDecoration: record.status === 'completed' ? 'line-through' : 'none',
              opacity: record.status === 'completed' ? 0.6 : 1
            }}>
              {text}
            </div>
            {record.description && <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{record.description}</div>}
          </div>
        </div>
      )
    },
    { 
      title: 'Danh mục', 
      dataIndex: 'category_id',
      width: 150,
      render: (_, r) => {
        const name = r.category_name || categories.find(c=>c.id===r.category_id)?.name || 'Chung';
        const colors = ['cyan', 'blue', 'geekblue', 'purple', 'magenta'];
        const color = colors[(r.category_id || 0) % colors.length];
        return <Tag color={color} variant="filled" style={{ borderRadius: 8, fontWeight: 600 }}>#{name}</Tag>
      }
    },
    { 
      title: 'Độ ưu tiên', 
      dataIndex: 'priority_id',
      width: 150,
      render: (pid, r) => {
        const name = r.priority_name || priorities.find(p=>p.id===pid)?.name || 'Bình thường';
        
        // --- SỬA ĐOẠN NÀY ---
        // 1. Dùng tên màu chuẩn (preset) thay vì mã Hex cứng
        let color = 'green'; 
        let icon = <CoffeeOutlined />;
        
        if(pid >= 3) { 
          color = 'red'; // Thay vì #ff4d4f -> dùng 'red' (Antd tự chỉnh độ dịu)
          icon = <FireFilled />; 
        } 
        else if(pid === 2) { 
          color = 'gold'; // Thay vì #faad14 -> dùng 'gold'
          icon = <ThunderboltFilled />; 
        } 
        
        return (
          <Tag 
            color={color} 
            // 2. QUAN TRỌNG: Đổi 'filled' thành 'bordered={false}'
            // Nó giúp nền Tag trở nên mờ ảo, không bị chói trong nền đen
            bordered={false} 
            style={{ 
              borderRadius: 15, 
              padding: '4px 10px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 5,
              fontWeight: 600 // Thêm độ đậm chữ cho rõ
            }}
          >
            {icon} <span>{name}</span>
          </Tag>
        );
      }
    },
    { 
      title: 'Hạn chót', 
      dataIndex: 'deadline',
      render: (d) => d ? (
        <span style={{ 
          // Nếu quá hạn thì màu đỏ (token.colorError), còn không thì màu text phụ
          color: dayjs(d).isBefore(dayjs()) ? token.colorError : token.colorTextSecondary, 
          fontWeight: 500 
        }}>
          📅 {dayjs(d).format('DD/MM HH:mm')}
        </span>
      ) : <span style={{color: token.colorTextQuaternary}}>—</span>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      width: 140,
      render: (status) => {
        const config = {
          pending: { color: 'orange', text: 'Chưa làm', icon: <ClockCircleOutlined /> },
          in_progress: { color: 'blue', text: 'Đang làm', icon: <SyncOutlined spin /> },
          completed: { color: 'green', text: 'Xong', icon: <CheckCircleOutlined /> },
        };
        const cur = config[status] || config.pending;

        return (
          <Tag 
            icon={cur.icon} color={cur.color} variant="filled"
            style={{ 
              padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 4
            }}
          >
            {cur.text}
          </Tag>
        );
      }
    },
    {
      title: '',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.status !== 'completed' && (
             <Tooltip title="Chuyển trạng thái kế tiếp">
               <Button 
                 type="primary" shape="circle" icon={<CheckCircleFilled />} 
                 onClick={() => handleStatusNext(record)}
                 style={{ backgroundColor: token.colorSuccess, borderColor: token.colorSuccess }}
               />
             </Tooltip>
          )}
          <Button type="text" icon={<EditOutlined style={{color: THEME_COLOR}} />} onClick={() => openModal(record)} />
          <Popconfirm title="Xóa công việc này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const completedCount = todos.filter(t => t.status === 'completed').length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    // Xóa ConfigProvider và Div Wrapper cũ
    <> 
      {/* HEADER CARD */}
      <Card variant="borderless" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: token.boxShadow }}>
        <Row align="middle" justify="space-between">
          <Col>
            <h1 style={{ color: 'white', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <StarFilled style={{color: '#ffe58f'}} /> {getGreeting()}
            </h1>
            <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15 }}>Bạn có <strong>{todos.length - completedCount}</strong> công việc đang chờ xử lý.</p>
          </Col>
          <Col xs={0} sm={8} md={6}>
            <div style={{ textAlign: 'right' }}>
              <span style={{opacity: 0.8, fontSize: 13}}>Tiến độ hoàn thành</span>
              <Progress percent={progressPercent} strokeColor="#b7eb8f" railColor="rgba(255,255,255,0.2)" format={p => <span style={{color:'white'}}>{p}%</span>} />
            </div>
          </Col>
        </Row>
      </Card>

      {/* TOOLBAR & TABLE CARD */}
      <Card variant="borderless" style={{ borderRadius: 16, boxShadow: token.boxShadowTertiary }}>
        
        {/* FILTER BAR */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col flex="auto">
            <Input 
              prefix={<SearchOutlined style={{color: token.colorTextPlaceholder}} />} 
              placeholder="Tìm kiếm công việc..." 
              size="large"
              value={filters.q}
              onChange={e => handleFilterChange('q', e.target.value)} 
              style={{ borderRadius: 20, maxWidth: 300 }}
            />
          </Col>
          <Col>
             <Select placeholder="Lọc Trạng thái" size="large" allowClear style={{ minWidth: 150 }} onChange={v => handleFilterChange('status', v)}>
               <Option value="pending">⏳ Chưa bắt đầu</Option>
               <Option value="in_progress">🔄 Đang làm</Option>
               <Option value="completed">✅ Đã hoàn thành</Option>
             </Select>
          </Col>
          <Col>
             <Select placeholder="Lọc Danh mục" size="large" allowClear style={{ minWidth: 150 }} onChange={v => handleFilterChange('category', v)}>
               {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
             </Select>
          </Col>
          <Col>
             <Select placeholder="Lọc Ưu tiên" size="large" allowClear style={{ minWidth: 150 }} onChange={v => handleFilterChange('priority', v)}>
               {priorities.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
             </Select>
          </Col>
          <Col>
            <Button 
              type="primary" size="large" icon={<PlusOutlined />} 
              onClick={() => openModal()}
              style={{ borderRadius: 20, padding: '0 25px' }}
            >
              Thêm mới
            </Button>
          </Col>
        </Row>

        {/* TABLE DATA */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={todos}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          locale={{ emptyText: <Empty description="Chưa có công việc nào, nghỉ ngơi thôi! 🍃" /> }}
          // Kích hoạt scroll ngang cho mobile
          scroll={{ x: 800 }} 
        />
      </Card>

      {/* MODAL */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: THEME_COLOR }}>
            {editingId ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingId ? "Chỉnh sửa công việc" : "Thêm việc mới"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={form.submit}
        centered width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 20 }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề đi bạn ơi!' }]}>
            <Input size="large" placeholder="Ví dụ: Đi siêu thị, Code React..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="category_id" label="Danh mục">
                <Select placeholder="-- Chọn --" allowClear>
                  {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority_id" label="Độ ưu tiên">
                <Select placeholder="-- Chọn --" allowClear>
                  {priorities.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="deadline" label="Deadline">
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} placeholder="Chọn giờ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default TaskManager;