import React, { useState, useEffect } from 'react';
import { 
  Calendar, Badge, Card, message, theme, Spin, Row, Col, 
  Progress, Typography, Drawer, List, Avatar, Tag, Empty 
} from 'antd';
import { 
  CalendarOutlined, CheckCircleOutlined, SyncOutlined, 
  ClockCircleOutlined, FireFilled, RightOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt
import todoApi from '../api/todo.api';

// Kích hoạt locale tiếng Việt
dayjs.locale('vi');

const { Text, Title } = Typography;

const TodoCalendar = () => {
  const { token } = theme.useToken();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonthData, setCurrentMonthData] = useState({ total: 0, completed: 0 });

  // State cho Drawer chi tiết
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAllTodos = async () => {
      setLoading(true);
      try {
        const res = await todoApi.getTodos({ page: 1, limit: 2000 });
        if (res.data?.data) {
          setTodos(res.data.data);
          calculateMonthStats(dayjs(), res.data.data);
        }
      } catch (error) {
        message.error("Lỗi tải lịch làm việc 😢");
      } finally {
        setLoading(false);
      }
    };
    fetchAllTodos();
  }, []);

  // --- HELPER FUNCTIONS ---
  const calculateMonthStats = (dateValue, list = todos) => {
    const currentMonthTasks = list.filter(t => 
      t.deadline && dayjs(t.deadline).isSame(dateValue, 'month')
    );
    setCurrentMonthData({
      total: currentMonthTasks.length,
      completed: currentMonthTasks.filter(t => t.status === 'completed').length
    });
  };

  const getTasksByDate = (dateValue) => {
    return todos.filter(todo => {
      if (!todo.deadline) return false;
      return dayjs(todo.deadline).isSame(dateValue, 'day');
    });
  };

  // --- HANDLERS ---
  const onPanelChange = (value) => calculateMonthStats(value);

  const onDateSelect = (value, info) => {
    if (info.source === 'date') {
        const tasks = getTasksByDate(value);
        setSelectedDate(value);
        setTasksForSelectedDate(tasks);
        setDrawerVisible(true);
    }
  };

  // --- RENDERERS ---
  const dateCellRender = (value) => {
    const listData = getTasksByDate(value);
    if (listData.length === 0) return null;

    const displayList = listData.slice(0, 3);
    const moreCount = listData.length - 3;

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0 0', textAlign: 'center' }}>
        {displayList.map((item) => {
          let status = 'warning'; 
          if (item.status === 'completed') status = 'success';
          else if (item.status === 'in_progress') status = 'processing';
          if (dayjs(item.deadline).isBefore(dayjs()) && item.status !== 'completed') status = 'error';
          
          return (
            <li key={item.id} style={{ display: 'inline-block', margin: '0 2px' }}>
              <Badge status={status} style={{ transform: 'scale(0.8)' }} />
            </li>
          );
        })}
        {moreCount > 0 && (
            <li style={{ display: 'inline-block', margin: '0 2px' }}>
                <Text type="secondary" style={{fontSize: 10}}>+{moreCount}</Text>
            </li>
        )}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  const progressPercent = currentMonthData.total > 0 
    ? Math.round((currentMonthData.completed / currentMonthData.total) * 100) : 0;

  // CSS tùy chỉnh
  const calendarCustomStyle = `
    .ant-picker-calendar.custom-calendar .ant-picker-cell { border-bottom: none !important; }
    .ant-picker-calendar.custom-calendar .ant-picker-cell-inner { border-radius: 12px; margin: 4px; height: 70px !important; }
    .ant-picker-calendar.custom-calendar .ant-picker-cell-selected .ant-picker-cell-inner { background: ${token.colorPrimaryBg} !important; border: 2px solid ${token.colorPrimary}; }
    .ant-picker-calendar.custom-calendar .ant-picker-cell-today .ant-picker-cell-inner::before { border: 2px solid ${token.colorPrimary} !important; border-radius: 12px; }
    .ant-picker-calendar.custom-calendar .ant-picker-content th { color: ${token.colorTextTertiary}; }
  `;

  return (
    <>
      <style>{calendarCustomStyle}</style>

      {/* HEADER CARD */}
      <Card variant="borderless" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #722ed1 0%, #a661ff 100%)', color: 'white', boxShadow: token.boxShadow, borderRadius: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <h1 style={{ color: 'white', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CalendarOutlined style={{color: '#ffe58f'}} /> Lịch Trình Công Việc
            </h1>
            <p style={{ opacity: 0.9, marginTop: 5, fontSize: 15 }}>
              Tháng này bạn có <strong>{currentMonthData.total}</strong> công việc, đã hoàn thành <strong>{currentMonthData.completed}</strong> công việc.
            </p>
          </Col>
          
          {/* 👇 ĐÃ SỬA LẠI: Dùng thanh ngang (Linear) giống TaskManager */}
          <Col xs={0} sm={8} md={6}>
            <div style={{ textAlign: 'right' }}>
              <span style={{opacity: 0.8, fontSize: 13}}>Tiến độ tháng này</span>
              <Progress 
                percent={progressPercent} 
                strokeColor="#b7eb8f" 
                railColor="rgba(255,255,255,0.2)" 
                format={p => <span style={{color:'white'}}>{p}%</span>} 
              />
            </div>
          </Col>
          {/* 👆 KẾT THÚC SỬA */}

        </Row>
      </Card>

      {/* CALENDAR MAIN */}
      <Card variant="borderless" style={{ borderRadius: 24, boxShadow: token.boxShadowSecondary, padding: '10px 0' }}>
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 20, justifyContent: 'center' }}>
            <Badge status="success" text="Đã xong" />
            <Badge status="processing" text="Đang làm" />
            <Badge status="warning" text="Sắp tới" />
            <Badge status="error" text="Quá hạn" />
        </div>

        <Spin spinning={loading}>
          <Calendar 
            className="custom-calendar"
            cellRender={cellRender} 
            onPanelChange={onPanelChange}
            onSelect={onDateSelect}
            fullscreen={true}
          />
        </Spin>
      </Card>

      {/* DRAWER CHI TIẾT */}
      <Drawer
        title={
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <Avatar style={{backgroundColor: token.colorPrimaryLight, color: token.colorPrimary}} icon={<CalendarOutlined />} />
                <div>
                    <Title level={5} style={{margin: 0, textTransform: 'capitalize'}}>{dayjs(selectedDate).format('dddd, DD MMMM YYYY')}</Title>
                    <Text type="secondary" style={{fontSize: 12}}>{tasksForSelectedDate.length} công việc</Text>
                </div>
            </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={450}
        styles={{body: {padding: 0, background: token.colorBgLayout}}}
      >
        {tasksForSelectedDate.length > 0 ? (
            <List
                dataSource={tasksForSelectedDate}
                renderItem={item => {
                    let statusColor = token.orange1; let iconColor = token.orange6;
                    let priorityTag = <Tag color="green">Bình thường</Tag>;
                    if(item.priority_id >= 3) priorityTag = <Tag icon={<FireFilled />} color="red" bordered={false}>Cao</Tag>;
                    else if(item.priority_id === 2) priorityTag = <Tag color="gold" bordered={false}>Trung bình</Tag>;

                    if (item.status === 'completed') { statusColor = token.colorFill; iconColor = token.colorTextDisabled; }
                    else if (dayjs(item.deadline).isBefore(dayjs())) { statusColor = token.colorErrorBg; iconColor = token.colorError; }

                    return (
                    <Card bordered={false} style={{margin: '12px 16px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.02)'}} hoverable>
                        <List.Item actions={[<RightOutlined style={{fontSize: 12, color: token.colorTextQuaternary}} />]} style={{padding: 0}}>
                        <List.Item.Meta
                            avatar={
                                <Avatar shape="square" style={{ backgroundColor: statusColor, color: iconColor, borderRadius: 8 }}>
                                    {item.status === 'completed' ? <CheckCircleOutlined /> : item.title.charAt(0).toUpperCase()}
                                </Avatar>
                            }
                            title={
                                <span style={{ textDecoration: item.status === 'completed' ? 'line-through' : 'none', opacity: item.status === 'completed' ? 0.6 : 1, fontWeight: 600 }}>
                                {item.title}
                                </span>
                            }
                            description={
                                <div style={{marginTop: 8}}>
                                    <div style={{marginBottom: 4}}>{priorityTag} <Tag>{item.category_name || 'Chung'}</Tag></div>
                                    {item.deadline && <div style={{fontSize: 12, color: dayjs(item.deadline).isBefore(dayjs()) && item.status!=='completed' ? token.colorError : token.colorTextSecondary}}><ClockCircleOutlined /> {dayjs(item.deadline).format('HH:mm DD/MM')}</div>}
                                </div>
                            }
                        />
                        </List.Item>
                    </Card>
                )}}
            />
        ) : (
            <Empty description="Không có công việc nào hôm nay" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{marginTop: 50}} />
        )}
      </Drawer>
    </>
  );
};

export default TodoCalendar;