import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Tabs,
  Select,
  Space,
  Tag,
  Avatar,
  Progress,
  Button,
  message,
} from "antd";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUsers,
  FaGamepad,
  FaChartLine,
  FaTrophy,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
} from "react-icons/fa";
import { MdDashboard, MdAnalytics } from "react-icons/md";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StatCard = ({
  title,
  value,
  prefix,
  suffix,
  color = "blue",
  icon: Icon,
  trend,
}) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
    <Card className="h-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-gray-600 text-sm">{title}</Text>
          <div className="flex items-center space-x-2">
            <Statistic
              value={value}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{
                color: `#1890ff`,
                fontSize: "1.75rem",
                fontWeight: "bold",
              }}
            />
            {trend !== undefined && (
              <Tag
                color={trend > 0 ? "green" : trend < 0 ? "red" : "default"}
                className="text-xs"
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </Tag>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </Card>
  </motion.div>
);

const AdminDashboard = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, newThisMonth: 0 },
    games: { total: 0, thisWeek: 0, thisMonth: 0 },
    scores: { highest: 0, average: 0 },
    popularGames: [],
    userActivity: [],
  });
  const [selectedGame, setSelectedGame] = useState("all");
  const [userData, setUserData] = useState([]);
  const [userPagination, setUserPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [analyticsData, setAnalyticsData] = useState({
    gameAnalytics: [],
    userAnalytics: [],
  });

  // API headers with auth token
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    loadDashboardData();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedGame !== "all") {
      loadGameAnalytics(selectedGame);
    }
  }, [selectedGame]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/dashboard`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Dashboard ma'lumotlarini yuklashda xato:", error);
      message.error("Dashboard ma'lumotlarini yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...filters,
      });

      const response = await axios.get(
        `${API_BASE_URL}/admin/users?${params}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setUserData(response.data.data.users);
        setUserPagination({
          current: response.data.data.currentPage,
          pageSize: pageSize,
          total: response.data.data.total,
        });
      }
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xato:", error);
      message.error("Foydalanuvchilarni yuklashda xato yuz berdi");
    }
  };

  const loadGameAnalytics = async (gameType) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/analytics/${gameType}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setAnalyticsData((prev) => ({
          ...prev,
          gameAnalytics: response.data.data,
        }));
      }
    } catch (error) {
      console.error("O'yin analitikasini yuklashda xato:", error);
      message.error("O'yin analitikasini yuklashda xato yuz berdi");
    }
  };

  const handleUserAction = async (action, userId) => {
    try {
      switch (action) {
        case "view":
          const response = await axios.get(
            `${API_BASE_URL}/admin/users/${userId}`,
            getAuthHeaders()
          );
          if (response.data.success) {
            // Modal ochish yoki boshqa sahifaga yo'naltirish
            console.log("User details:", response.data.data);
          }
          break;
        case "delete":
          await axios.delete(
            `${API_BASE_URL}/admin/users/${userId}`,
            getAuthHeaders()
          );
          message.success("Foydalanuvchi muvaffaqiyatli o'chirildi");
          loadUsers(userPagination.current, userPagination.pageSize);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Foydalanuvchi amalini bajarishda xato:", error);
      message.error("Amalni bajarishda xato yuz berdi");
    }
  };

  const exportData = async (type) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/export/${type}`,
        getAuthHeaders()
      );

      // Faylni yuklab olish
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}_export_${Date.now()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      message.success("Ma'lumotlar muvaffaqiyatli eksport qilindi");
    } catch (error) {
      console.error("Eksport qilishda xato:", error);
      message.error("Eksport qilishda xato yuz berdi");
    }
  };

  // User table columns
  const userColumns = [
    {
      title: "Foydalanuvchi",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.avatar} size="small">
            {text?.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Daraja",
      dataIndex: "level",
      key: "level",
      render: (level) => <Tag color="gold">{level}</Tag>,
    },
    {
      title: "Umumiy ball",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => score?.toLocaleString() || 0,
      sorter: true,
    },
    {
      title: "O'yinlar soni",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      sorter: true,
    },
    {
      title: "Oxirgi kirish",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "Hech qachon",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Faol" : "Nofaol"}
        </Tag>
      ),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<FaEye />}
            size="small"
            type="link"
            onClick={() => handleUserAction("view", record._id)}
          />
          <Button
            icon={<FaEdit />}
            size="small"
            type="link"
            onClick={() => handleUserAction("edit", record._id)}
          />
          {record.role !== "admin" && (
            <Button
              icon={<FaTrash />}
              size="small"
              type="link"
              danger
              onClick={() => handleUserAction("delete", record._id)}
            />
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <Title level={2} className="mb-0">
            <MdDashboard className="inline mr-2" />
            Admin Dashboard
          </Title>
          <Text className="text-gray-600">
            Tizim statistikasi va boshqaruv paneli
          </Text>
        </div>
        <Space>
          <Button
            icon={<FaDownload />}
            type="primary"
            onClick={() => exportData("analytics")}
          >
            Export
          </Button>
        </Space>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Umumiy foydalanuvchilar"
              value={dashboardData.users?.total || 0}
              icon={FaUsers}
              color="blue"
              trend={dashboardData.users?.growth}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Faol foydalanuvchilar"
              value={dashboardData.users?.active || 0}
              icon={FaGamepad}
              color="green"
              trend={dashboardData.users?.activeGrowth}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Bu oydagi o'yinlar"
              value={dashboardData.games?.thisMonth || 0}
              icon={FaChartLine}
              color="orange"
              trend={dashboardData.games?.growth}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Eng yuqori ball"
              value={dashboardData.scores?.highest || 0}
              icon={FaTrophy}
              color="gold"
              trend={dashboardData.scores?.growth}
            />
          </Col>
        </Row>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Tabs defaultActiveKey="overview" size="large">
            {/* Overview Tab */}
            <TabPane
              tab={
                <span>
                  <MdAnalytics className="mr-2" />
                  Ko'rinish
                </span>
              }
              key="overview"
            >
              <Row gutter={[24, 24]}>
                {/* User Activity Chart */}
                <Col xs={24} lg={16}>
                  <Card title="Foydalanuvchi faolligi" className="h-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dashboardData.userActivity || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="gamesPlayed"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name="O'yinlar soni"
                        />
                        <Area
                          type="monotone"
                          dataKey="uniqueUsers"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name="Noyob foydalanuvchilar"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Popular Games */}
                <Col xs={24} lg={8}>
                  <Card title="Mashhur o'yinlar" className="h-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardData.popularGames || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ _id, count, percent }) =>
                            `${_id}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {(dashboardData.popularGames || []).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`hsl(${index * 45}, 70%, 60%)`}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Users Tab */}
            <TabPane
              tab={
                <span>
                  <FaUsers className="mr-2" />
                  Foydalanuvchilar
                </span>
              }
              key="users"
            >
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex justify-between items-center">
                  <Space>
                    <Select
                      defaultValue="all"
                      style={{ width: 120 }}
                      onChange={(value) =>
                        loadUsers(1, userPagination.pageSize, { status: value })
                      }
                    >
                      <Option value="all">Barchasi</Option>
                      <Option value="active">Faol</Option>
                      <Option value="inactive">Nofaol</Option>
                    </Select>
                    <Select
                      defaultValue="all"
                      style={{ width: 150 }}
                      onChange={(value) =>
                        loadUsers(1, userPagination.pageSize, { role: value })
                      }
                    >
                      <Option value="all">Barcha rollar</Option>
                      <Option value="user">Foydalanuvchi</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Space>
                  <Button type="primary" onClick={() => exportData("users")}>
                    Foydalanuvchilarni eksport qilish
                  </Button>
                </div>

                {/* Users Table */}
                <Table
                  columns={userColumns}
                  dataSource={userData}
                  rowKey="_id"
                  pagination={{
                    ...userPagination,
                    onChange: (page, pageSize) => {
                      loadUsers(page, pageSize);
                    },
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} / ${total} ta`,
                  }}
                  scroll={{ x: 800 }}
                />
              </div>
            </TabPane>

            {/* Analytics Tab */}
            {/* <TabPane
              tab={
                <span>
                  <FaChartLine className="mr-2" />
                  Tahlil
                </span>
              }
              key="analytics"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24}>
                  <Card>
                    <Space size="large">
                      <div>
                        <Text strong>O'yin tanlang:</Text>
                        <Select
                          value={selectedGame}
                          onChange={setSelectedGame}
                          style={{ width: 200, marginLeft: 8 }}
                        >
                          <Option value="all">Barcha o'yinlar</Option>
                          <Option value="numberMemory">Raqam xotirasi</Option>
                          <Option value="tileMemory">Plitkalar</Option>
                          <Option value="schulteTable">Schulte jadvali</Option>
                          <Option value="mathSystems">Matematik</Option>
                          <Option value="percentages">Foizlar</Option>
                        </Select>
                      </div>
                    </Space>
                  </Card>
                </Col>

                {analyticsData.gameAnalytics.basicStats && (
                  <>
                    <Col xs={24} sm={8}>
                      <Card className="text-center">
                        <Statistic
                          title="O'rtacha ball"
                          value={
                            analyticsData.gameAnalytics.basicStats
                              .averageScore || 0
                          }
                          precision={1}
                          valueStyle={{ color: "#3f8600" }}
                          suffix="ball"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className="text-center">
                        <Statistic
                          title="Jami o'yinlar"
                          value={
                            analyticsData.gameAnalytics.basicStats.totalGames ||
                            0
                          }
                          valueStyle={{ color: "#cf1322" }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card className="text-center">
                        <Statistic
                          title="Noyob o'yinchilar"
                          value={
                            analyticsData.gameAnalytics.basicStats
                              .uniquePlayers || 0
                          }
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Card>
                    </Col>
                  </>
                )}

                {analyticsData.gameAnalytics.performanceOverTime && (
                  <Col xs={24}>
                    <Card title="Vaqt bo'yicha ko'rsatkichlar">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={analyticsData.gameAnalytics.performanceOverTime}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id.date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="avgScore"
                            stroke="#8884d8"
                            name="O'rtacha ball"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="gamesPlayed"
                            stroke="#82ca9d"
                            name="O'yinlar soni"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                )}
              </Row>
            </TabPane> */}
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
