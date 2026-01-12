import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import Pie từ thư viện plots
import { Pie } from '@ant-design/plots';
import { 
  Card, Row, Col, Avatar, Tag, 
  Button, Empty, Typography, Progress, Table, theme, Spin 
} from 'antd';
import { 
  CheckCircleFilled, ClockCircleFilled, SyncOutlined, 
  DatabaseFilled, CalendarOutlined, StarFilled, RightOutlined, 
  FireFilled 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import todoApi from '../api/todo.api';

const { Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken(); // Lấy màu Sáng/Tối
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [nearDeadline, setNearDeadline] = useState([]);

  // Hàm chào hỏi
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Chào buổi sáng tốt lành ☀️';
    if (hour >= 11 && hour < 14) return 'Trưa rồi, nhớ nghỉ ngơi nhé 🍚';
    if (hour >= 14 && hour < 18) return 'Chiều nay làm việc hiệu quả ⚡';
    return 'Tối rồi, thư giãn thôi 🌙';
  };

  // Load dữ liệu
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
          
          // Logic lọc deadline
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

  // --- CẤU HÌNH BIỂU ĐỒ (Đã fix lỗi hiển thị) ---
  const pieData = [
    { type: 'Chưa làm', value: stats.pending },
    { type: 'Đang làm', value: stats.inProgress },
    { type: 'Hoàn thành', value: stats.completed }
  ].filter(item => item.value > 0);

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6, // Tạo biểu đồ hình nhẫn (Donut)
    // Tắt label chỉ vào từng miếng bánh để đỡ rối
    label: false, 
    // Màu sắc cho từng phần
    color: ({ type }) => {
      if(type === 'Chưa làm') return token.colorWarning; 
      if(type === 'Đang làm') return token.colorPrimary;
      if(type === 'Hoàn thành') return token.colorSuccess;
      return '#ccc';
    },
    // Legend (Chú thích)
    legend: {
      color: {
        title: false,
        position: 'bottom',
        rowPadding: 5,
        // Chỉnh màu chữ legend để không bị chìm trong nền đen
        itemLabel: { style: { fill: token.colorText, fontSize: 13, fontWeight: 500 } }
      }
    },
    // Thống kê ở giữa vòng tròn (Thay thế cho annotations cũ hay gây lỗi)
    statistic: {
      title: {
        offsetY: -4,
        style: { fontSize: '14px', color: token.colorTextSecondary },
        content: 'Tổng việc',
      },
      content: {
        style: { fontSize: '28px', fontWeight: 'bold', color: token.colorText },
        content: `${stats.total}`,
      },
    },
    // Tương tác: Tắt bớt hiệu ứng mặc định nếu gây lag
    interactions: [{ type: 'element-active' }],
  };

  // Cấu hình cột Table
  const columns = [
    { 
      title: 'Công việc', dataIndex: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar shape="square" style={{ backgroundColor: record.status === 'completed' ? token.colorFill : token.orange1, color: token.orange6, borderRadius: 8 }}>
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ fontWeight: 700, fontSize: 14, color: token.colorText, textDecoration: record.status === 'completed' ? 'line-through' : 'none', opacity: record.status === 'completed' ? 0.6 : 1 }}>
            {text}
          </div>
        </div>
      )
    },
    { 
      title: 'Trạng thái', dataIndex: 'status', align: 'right',
      render: (status) => {
        const config = {
          pending: { color: 'default', text: 'Chưa làm' },
          in_progress: { color: 'processing', text: 'Đang làm' },
          completed: { color: 'success', text: 'Xong' },
        };
        const cur = config[status] || config.pending;
        return <Tag color={cur.color} variant="filled" style={{borderRadius: 6}}>{cur.text}</Tag>
      }
    }
  ];

  const statItems = [
    { title: 'Tổng số', value: stats.total, color: token.blue6, icon: <DatabaseFilled />, bg: token.blue1 },
    { title: 'Chưa làm', value: stats.pending, color: token.orange6, icon: <ClockCircleFilled />, bg: token.orange1 },
    { title: 'Đang chạy', value: stats.inProgress, color: token.purple6, icon: <SyncOutlined spin />, bg: token.purple1 },
    { title: 'Hoàn thành', value: stats.completed, color: token.green6, icon: <CheckCircleFilled />, bg: token.green1 },
  ];

  return (
    // Bỏ thẻ div wrapper thừa, tận dụng Layout cha
    <>
      {/* HEADER */}
      <Card variant="borderless" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: token.boxShadow }}>
        <Row align="middle" justify="space-between">
          <Col>
            <h1 style={{ color: 'white', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <StarFilled style={{color: '#ffe58f'}} /> {getGreeting()}
            </h1>
            <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15 }}>Hệ thống quản lý công việc cá nhân.</p>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
              <div style={{opacity: 0.9, fontSize: 13, marginBottom: 5}}>Tiến độ tổng thể</div>
              <Progress percent={completionRate} strokeColor="#b7eb8f" railColor="rgba(255,255,255,0.2)" format={p => <span style={{color:'white', fontWeight: 'bold'}}>{p}%</span>} />
          </Col>
        </Row>
      </Card>

      {/* STATS ROW */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {statItems.map((item, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card variant="borderless" hoverable styles={{ body: { padding: 20 } }} style={{ borderRadius: 16, boxShadow: token.boxShadowTertiary }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: token.colorText }}>{item.value}</div>
                    <div style={{ color: token.colorTextSecondary, fontSize: 13 }}>{item.title}</div>
                  </div>
                </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHART SECTION */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="📊 Phân bổ trạng thái" variant="borderless" style={{ height: '100%', borderRadius: 16, boxShadow: token.boxShadowTertiary, minHeight: 350 }}>
            {loading ? <Spin /> : stats.total > 0 ? (
              // QUAN TRỌNG: Div bao ngoài phải có height cụ thể thì Chart mới hiện
              <div style={{ height: 280, marginTop: 20 }}>
                 <Pie {...pieConfig} />
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 50 }} />
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title={<span style={{color: token.colorError}}>🔥 Sắp hết hạn (7 ngày tới)</span>} 
            variant="borderless" 
            style={{ height: '100%', borderRadius: 16, boxShadow: token.boxShadowTertiary, minHeight: 350 }}
            styles={{ body: { padding: '12px 24px', overflowY: 'auto', maxHeight: 330 } }}
          >
            {nearDeadline.length === 0 ? (
                <div style={{textAlign: 'center', color: token.colorTextQuaternary, padding: 40}}>Không có việc gấp 🎉</div> 
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {nearDeadline.map((item) => (
                  <div key={item.id} style={{ 
                      padding: '12px 16px', borderRadius: 12, 
                      background: token.colorErrorBg, border: `1px solid ${token.colorErrorBorder}`, 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, color: token.colorErrorText }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: token.colorError, marginTop: 2 }}>
                        <CalendarOutlined /> {dayjs(item.deadline).format('DD/MM/YYYY HH:mm')}
                      </div>
                    </div>
                    <FireFilled style={{ color: token.colorError, fontSize: 18 }} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* BOTTOM TABLE */}
      <Card 
        title="Công việc vừa cập nhật" variant="borderless" 
        style={{ borderRadius: 16, boxShadow: token.boxShadowTertiary }}
        extra={<Button type="link" onClick={() => navigate('/tasks')}>Xem tất cả <RightOutlined /></Button>}
        styles={{ body: { padding: 0 } }}
      >
        <Table rowKey="id" columns={columns} dataSource={recentTasks} pagination={false} size="middle" locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }} />
      </Card>
    </>
  );
};

export default Dashboard;