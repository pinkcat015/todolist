import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from '@ant-design/plots';
import { 
  Card, Row, Col, Avatar, Tag, 
  Button, ConfigProvider, Empty, Typography, Progress, Table 
} from 'antd';
import { 
  CheckCircleFilled, ClockCircleFilled, SyncOutlined, 
  DatabaseFilled, CalendarOutlined, StarFilled, RightOutlined, 
  FireFilled 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import todoApi from '../api/todo.api';

const { Text } = Typography;
const THEME_COLOR = '#722ed1'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [nearDeadline, setNearDeadline] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Chào buổi sáng tốt lành ☀️';
    if (hour >= 11 && hour < 14) return 'Trưa rồi, nhớ nghỉ ngơi nhé 🍚';
    if (hour >= 14 && hour < 18) return 'Chiều nay làm việc hiệu quả ⚡';
    return 'Tối rồi, thư giãn thôi 🌙';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await todoApi.getTodos({ limit: 1000 });
        if (res.data?.data) {
          const all = res.data.data;
          setStats({
            total: res.data.meta?.total || all.length,
            completed: all.filter(t => t.status === 'completed').length,
            pending: all.filter(t => t.status === 'pending').length,
            inProgress: all.filter(t => t.status === 'in_progress').length
          });

          setRecentTasks(all.slice(0, 5));

          const today = dayjs().startOf('day');
          const nextWeek = today.add(7, 'day');
          setNearDeadline(all.filter(t => {
            if (!t.deadline || t.status === 'completed') return false;
            const d = dayjs(t.deadline);
            return d.isAfter(today) && d.isBefore(nextWeek);
          }).sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf()));
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // --- CẤU HÌNH BIỂU ĐỒ (BẢN MỚI) ---
  const pieConfig = {
    data: [
      { type: 'Chưa làm', value: stats.pending },
      { type: 'Đang làm', value: stats.inProgress },
      { type: 'Hoàn thành', value: stats.completed }
    ].filter(item => item.value > 0),
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    color: ({ type }) => {
      if(type === 'Chưa làm') return '#ff9c6e';
      if(type === 'Đang làm') return '#b37feb';
      if(type === 'Hoàn thành') return '#95de64';
      return '#ccc';
    },
    label: false,
    legend: { color: { title: false, position: 'bottom', rowPadding: 5 } },
    annotations: [
      {
        type: 'text',
        style: {
          text: `${stats.total}`,
          x: '50%', y: '50%', textAlign: 'center', fontSize: 30, fontWeight: 'bold', fill: THEME_COLOR,
        },
      },
    ],
  };

  const columns = [
    { 
      title: 'Công việc', 
      dataIndex: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar shape="square" style={{ backgroundColor: record.status === 'completed' ? '#d9d9d9' : '#fde3cf', color: '#f56a00', borderRadius: 8 }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#333', textDecoration: record.status === 'completed' ? 'line-through' : 'none', opacity: record.status === 'completed' ? 0.6 : 1 }}>
              {text}
            </div>
          </div>
        </div>
      )
    },
    { 
      title: 'Danh mục', 
      dataIndex: 'category_id',
      width: 120,
      render: (_, r) => {
        const name = r.category_name || (r.category_id ? `Mục ${r.category_id}` : 'Chung');
        const colors = ['cyan', 'blue', 'geekblue', 'purple', 'magenta'];
        const color = colors[(r.category_id || 0) % colors.length];
        // SỬA: bordered={false} -> variant="filled"
        return <Tag color={color} variant="filled" style={{ borderRadius: 6, fontWeight: 600 }}>#{name}</Tag>
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      align: 'right',
      render: (status) => {
        const config = {
          pending: { color: 'default', text: 'Chưa làm' },
          in_progress: { color: 'processing', text: 'Đang làm' },
          completed: { color: 'success', text: 'Xong' },
        };
        const cur = config[status] || config.pending;
        // SỬA: bordered={false} -> variant="filled"
        return <Tag color={cur.color} variant="filled" style={{borderRadius: 6}}>{cur.text}</Tag>
      }
    }
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
      <div style={{ padding: '20px 40px', background: '#f5f7fa', minHeight: '100vh' }}>
        
        {/* HEADER: SỬA bordered -> variant="borderless" */}
        <Card variant="borderless" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: '0 8px 20px rgba(114, 46, 209, 0.2)' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <h1 style={{ color: 'white', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                 <StarFilled style={{color: '#ffe58f'}} /> {getGreeting()}
              </h1>
              <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15 }}>Hệ thống quản lý công việc cá nhân của bạn.</p>
            </Col>
            <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
               <div style={{opacity: 0.9, fontSize: 13, marginBottom: 5}}>Tiến độ tổng thể</div>
               {/* SỬA: trailColor -> railColor */}
               <Progress percent={completionRate} strokeColor="#b7eb8f" railColor="rgba(255,255,255,0.2)" format={p => <span style={{color:'white', fontWeight: 'bold'}}>{p}%</span>} />
            </Col>
          </Row>
        </Card>

        {/* STATS ROW */}
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {[
            { title: 'Tổng số', value: stats.total, color: '#1890ff', icon: <DatabaseFilled />, bg: '#e6f7ff' },
            { title: 'Chưa làm', value: stats.pending, color: '#fa8c16', icon: <ClockCircleFilled />, bg: '#fff7e6' },
            { title: 'Đang chạy', value: stats.inProgress, color: '#722ed1', icon: <SyncOutlined spin />, bg: '#f9f0ff' },
            { title: 'Hoàn thành', value: stats.completed, color: '#52c41a', icon: <CheckCircleFilled />, bg: '#f6ffed' },
          ].map((item, index) => (
            <Col xs={12} sm={6} key={index}>
              {/* SỬA: bodyStyle -> styles={{ body: ... }} */}
              <Card variant="borderless" hoverable styles={{ body: { padding: 20 } }} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{item.value}</div>
                      <div style={{ color: '#888', fontSize: 13 }}>{item.title}</div>
                    </div>
                 </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* MIDDLE SECTION */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card title="📊 Phân bổ trạng thái" variant="borderless" style={{ height: '100%', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              {stats.total > 0 ? (
                <div style={{ height: 260 }}><Pie {...pieConfig} /></div>
              ) : (
                <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 50 }} />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            {/* SỬA: bodyStyle -> styles={{ body: ... }} */}
            <Card 
              title={<span style={{color: '#eb2f96'}}>🔥 Sắp hết hạn (7 ngày tới)</span>} 
              variant="borderless" 
              style={{ height: '100%', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
              styles={{ body: { padding: '12px 24px', overflowY: 'auto', maxHeight: 330 } }}
            >
              {/* SỬA: Thay List bằng div map để tránh warning deprecated */}
              {nearDeadline.length === 0 ? (
                 <div style={{textAlign: 'center', color: '#ccc', padding: 40}}>Không có việc gấp 🎉</div> 
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {nearDeadline.map((item) => (
                    <div key={item.id} style={{ padding: '12px 16px', borderRadius: 12, background: '#fff0f6', border: '1px solid #ffadd2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#c41d7f' }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#eb2f96', marginTop: 2 }}>
                          <CalendarOutlined /> {dayjs(item.deadline).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                      <FireFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* BOTTOM SECTION */}
        <Card 
          title="Công việc vừa cập nhật" 
          variant="borderless" 
          style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          extra={<Button type="link" onClick={() => navigate('/tasks')}>Xem tất cả <RightOutlined /></Button>}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={recentTasks}
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        </Card>

      </div>
    </ConfigProvider>
  );
};

export default Dashboard;