import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Empty, Popconfirm, message, Tabs, 
  Tag, theme, Space, Input, DatePicker, Row, Col, Avatar, Typography 
} from 'antd';
import { 
  DeleteOutlined, RollbackOutlined, CheckCircleFilled, 
  SearchOutlined, HistoryOutlined, 
  FireFilled, CheckCircleOutlined, CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import todoApi from '../api/todo.api';

const { RangePicker } = DatePicker;

const HistoryLogs = () => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu gốc
  const [allData, setAllData] = useState({ completed: [], overdue: [] });
  // Dữ liệu hiển thị (sau khi lọc)
  const [displayData, setDisplayData] = useState({ completed: [], overdue: [] });

  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchText, dateRange, allData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await todoApi.getTodos({ limit: 1000 });
      const all = res.data?.data || [];
      const now = dayjs();

      const done = all.filter(t => t.status === 'completed');
      const late = all.filter(t => 
        t.status !== 'completed' && t.deadline && dayjs(t.deadline).isBefore(now)
      );

      // Sắp xếp: Mới nhất lên đầu
      done.sort((a, b) => dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf());
      late.sort((a, b) => dayjs(b.deadline).valueOf() - dayjs(a.deadline).valueOf());

      setAllData({ completed: done, overdue: late });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const lowerQ = searchText.toLowerCase();
    
    const filterFn = (item) => {
      const matchName = item.title.toLowerCase().includes(lowerQ);
      let matchDate = true;
      if (dateRange) {
        const targetDate = item.status === 'completed' ? item.updated_at : item.deadline;
        matchDate = dayjs(targetDate).isAfter(dateRange[0]) && dayjs(targetDate).isBefore(dateRange[1]);
      }
      return matchName && matchDate;
    };

    setDisplayData({
      completed: allData.completed.filter(filterFn),
      overdue: allData.overdue.filter(filterFn)
    });
  };

  // --- ACTIONS ---
  const handleDelete = async (id) => {
    try { await todoApi.deleteTodo(id); message.success('Đã xóa vĩnh viễn'); fetchData(); } catch (e) {}
  };

  // ✅ ĐÃ SỬA: Nhận vào record (toàn bộ object) thay vì chỉ id
  const handleRestore = async (record) => {
    try { 
      // Gửi full dữ liệu để Backend không báo lỗi thiếu Title
      const payload = {
        ...record,
        status: 'pending',
        deadline: record.deadline ? dayjs(record.deadline).toISOString() : null,
        category_id: record.category_id ? Number(record.category_id) : null,
        priority_id: record.priority_id ? Number(record.priority_id) : null
      };

      await todoApi.updateTodo(record.id, payload); 
      message.success('Đã khôi phục công việc về danh sách chờ'); 
      fetchData(); 
    } catch (e) {
      console.error(e);
      message.error("Không thể khôi phục");
    }
  };

  // ✅ ĐÃ SỬA: Tương tự cho nút Xong bù
  const handleQuickFinish = async (record) => {
    try { 
      const payload = {
        ...record,
        status: 'completed',
        deadline: record.deadline ? dayjs(record.deadline).toISOString() : null,
        category_id: record.category_id ? Number(record.category_id) : null,
        priority_id: record.priority_id ? Number(record.priority_id) : null
      };

      await todoApi.updateTodo(record.id, payload); 
      message.success('Đã hoàn thành!'); 
      fetchData(); 
    } catch (e) {
        message.error("Lỗi cập nhật");
    }
  };

  // --- COLUMNS ---
  const overdueColumns = [
    { 
      title: 'Công việc bị lỡ', 
      dataIndex: 'title', 
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            shape="square" 
            style={{ backgroundColor: token.colorErrorBg, color: token.colorError, borderRadius: 8 }}
          >
            <FireFilled />
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: token.colorError, fontSize: 15 }}>{text}</div>
            <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{record.description || 'Không có mô tả'}</div>
          </div>
        </div>
      )
    },
    { 
      title: 'Hạn chót cũ', 
      dataIndex: 'deadline', 
      width: 160,
      render: d => (
        <div style={{display:'flex', alignItems:'center', gap: 5, color: token.colorText}}>
            <CalendarOutlined style={{color: token.colorTextSecondary}}/> 
            {dayjs(d).format('DD/MM/YYYY HH:mm')}
        </div>
      )
    },
    {
      title: 'Trễ',
      key: 'late_time',
      width: 120,
      render: (_, r) => {
         const diff = dayjs().diff(dayjs(r.deadline), 'day');
         return <Tag color="red" bordered={false} style={{borderRadius: 12, fontWeight: 600}}>Trễ {diff} ngày</Tag>
      }
    },
    { 
      title: '', 
      align: 'right',
      render: (_, r) => (
        <Space>
            {/* 👇 Sửa: Truyền r (record) thay vì r.id */}
           <Button 
             type="primary" size="small" 
             style={{ background: token.colorSuccess, borderColor: token.colorSuccess }}
             icon={<CheckCircleFilled />} 
             onClick={() => handleQuickFinish(r)}
           >
             Xong bù
           </Button>
           <Popconfirm title="Xóa bỏ việc này?" onConfirm={() => handleDelete(r.id)}>
             <Button type="text" danger icon={<DeleteOutlined />} />
           </Popconfirm>
        </Space>
      ) 
    },
  ];

  const completedColumns = [
    { 
      title: 'Công việc', 
      dataIndex: 'title', 
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            shape="square" 
            style={{ backgroundColor: token.colorFillQuaternary, color: token.colorTextDisabled, borderRadius: 8 }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ 
                fontWeight: 600, fontSize: 15, 
                color: token.colorTextDisabled, textDecoration: 'line-through' 
            }}>
                {text}
            </div>
            {record.description && <div style={{ fontSize: 12, color: token.colorTextDisabled }}>{record.description}</div>}
          </div>
        </div>
      )
    },
    { 
      title: 'Ngày hoàn thành', 
      dataIndex: 'updated_at', 
      width: 180,
      render: d => (
        <div style={{display:'flex', alignItems:'center', gap: 5, color: token.colorTextSecondary}}>
            <CheckCircleOutlined /> 
            {dayjs(d).format('DD/MM/YYYY HH:mm')}
        </div>
      ) 
    },
    { 
      title: '', 
      align: 'right',
      render: (_, r) => (
        <Space>
           {/* 👇 Sửa: Truyền r (record) thay vì r.id */}
          <Button type="text" icon={<RollbackOutlined />} onClick={() => handleRestore(r)}>Khôi phục</Button>
          <Popconfirm title="Xóa vĩnh viễn?" onConfirm={() => handleDelete(r.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ) 
    },
  ];

  const items = [
    {
      key: '1',
      label: <span style={{ color: token.colorError }}><FireFilled /> Quá hạn ({displayData.overdue.length})</span>,
      children: <Table rowKey="id" dataSource={displayData.overdue} columns={overdueColumns} pagination={{ pageSize: 5 }} scroll={{ x: 600 }} locale={{ emptyText: <Empty description="Tuyệt vời! Không có việc trễ hạn" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }} />
    },
    {
      key: '2',
      label: <span style={{ color: token.colorSuccess }}><CheckCircleFilled /> Đã xong ({displayData.completed.length})</span>,
      children: <Table rowKey="id" dataSource={displayData.completed} columns={completedColumns} pagination={{ pageSize: 10 }} scroll={{ x: 600 }} locale={{ emptyText: <Empty description="Chưa có việc nào xong" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }} />
    },
  ];

  return (
    <>
      {/* HEADER CARD */}
      <Card 
        variant="borderless" 
        style={{ 
          marginBottom: 20, 
          background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', 
          color: 'white', 
          boxShadow: token.boxShadow 
        }}
      >
        <Row align="middle" justify="space-between">
            <Col>
                <h1 style={{ color: 'white', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HistoryOutlined /> Lưu trữ & Lịch sử
                </h1>
                <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15 }}>
                    Quản lý những việc đã hoàn thành hoặc bị bỏ lỡ.
                </p>
            </Col>
            <Col>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{allData.completed.length}</div>
                    <div style={{ fontSize: 12 }}>Việc đã xong</div>
                </div>
            </Col>
        </Row>
      </Card>
      {/* MAIN CONTENT */}
      <Card variant="borderless" style={{ borderRadius: 16, boxShadow: token.boxShadowTertiary }}>
        {/* TOOLBAR TÌM KIẾM */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={24} md={12}>
                <Input 
                    prefix={<SearchOutlined style={{color: token.colorTextPlaceholder}} />} 
                    placeholder="Tìm kiếm trong lịch sử..." 
                    size="large"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ borderRadius: 12 }}
                />
            </Col>
            <Col xs={24} md={12}>
                <RangePicker 
                    size="large" 
                    style={{ width: '100%', borderRadius: 12 }} 
                    placeholder={['Từ ngày', 'Đến ngày']}
                    onChange={(dates) => setDateRange(dates)}
                />
            </Col>
        </Row>

        {/* TABS & TABLE */}
        <Tabs 
            defaultActiveKey="1" 
            items={items} 
            type="card" 
            size="large"
            tabBarStyle={{ marginBottom: 16 }}
        />
      </Card>
    </>
  );
};

export default HistoryLogs;