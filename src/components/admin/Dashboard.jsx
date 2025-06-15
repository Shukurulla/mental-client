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
import LoadingSpinner from "../common/LoadingSpinner";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Colors for charts
const colors = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

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
            {trend && (
              <Tag color={trend > 0 ? "green" : "red"} className="text-xs">
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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedGame, setSelectedGame] = useState("all");
  const [userData, setUserData] = useState([]);
  const [gameData, setGameData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedGame]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Mock dashboard data
      const mockDashboardData = {
        totalUsers: 1248,
        activeGames: 856,
        dailyGames: 342,
        topScore: 9850,
      };

      // Mock users data
      const mockUsers = [
        {
          id: 1,
          name: "Ahmadjon Karimov",
          email: "ahmadjon@example.com",
          avatar: null,
          level: 12,
          totalScore: 15420,
          gamesPlayed: 247,
          lastLogin: "2 soat oldin",
          isActive: true,
        },
        {
          id: 2,
          name: "Malika Sultanova",
          email: "malika@example.com",
          avatar: null,
          level: 15,
          totalScore: 18950,
          gamesPlayed: 312,
          lastLogin: "1 soat oldin",
          isActive: true,
        },
        {
          id: 3,
          name: "Bobur Mahmudov",
          email: "bobur@example.com",
          avatar: null,
          level: 8,
          totalScore: 9650,
          gamesPlayed: 178,
          lastLogin: "1 kun oldin",
          isActive: false,
        },
        {
          id: 4,
          name: "Dilorom Karimova",
          email: "dilorom@example.com",
          avatar: null,
          level: 10,
          totalScore: 12340,
          gamesPlayed: 203,
          lastLogin: "3 soat oldin",
          isActive: true,
        },
        {
          id: 5,
          name: "Jasur Normatov",
          email: "jasur@example.com",
          avatar: null,
          level: 6,
          totalScore: 7890,
          gamesPlayed: 145,
          lastLogin: "2 kun oldin",
          isActive: true,
        },
      ];

      setDashboardData(mockDashboardData);
      setUserData(mockUsers);

      // Sample chart data
      setGameData([
        { name: "Raqam xotirasi", value: 45, color: "#0088FE" },
        { name: "Plitkalar", value: 30, color: "#00C49F" },
        { name: "Schulte jadvali", value: 25, color: "#FFBB28" },
        { name: "Matematik", value: 35, color: "#FF8042" },
        { name: "Foizlar", value: 20, color: "#8884D8" },
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
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
          <Avatar size="small">{text?.charAt(0)}</Avatar>
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
      render: (score) => score.toLocaleString(),
      sorter: (a, b) => a.totalScore - b.totalScore,
    },
    {
      title: "O'yinlar soni",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      sorter: (a, b) => a.gamesPlayed - b.gamesPlayed,
    },
    {
      title: "Oxirgi kirish",
      dataIndex: "lastLogin",
      key: "lastLogin",
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
          <Button icon={<FaEye />} size="small" type="link" />
          <Button icon={<FaEdit />} size="small" type="link" />
          <Button icon={<FaTrash />} size="small" type="link" danger />
        </Space>
      ),
    },
  ];

  // Chart data for user activity
  const userActivityData = [
    { date: "01.01", users: 120, newUsers: 15, activeGames: 85 },
    { date: "02.01", users: 132, newUsers: 22, activeGames: 92 },
    { date: "03.01", users: 145, newUsers: 18, activeGames: 103 },
    { date: "04.01", users: 156, newUsers: 25, activeGames: 110 },
    { date: "05.01", users: 168, newUsers: 20, activeGames: 125 },
    { date: "06.01", users: 175, newUsers: 16, activeGames: 130 },
    { date: "07.01", users: 188, newUsers: 28, activeGames: 142 },
  ];

  const gamePerformanceData = [
    { game: "Raqam xotirasi", avgScore: 85, totalPlays: 450 },
    { game: "Plitkalar", avgScore: 72, totalPlays: 320 },
    { game: "Schulte", avgScore: 68, totalPlays: 280 },
    { game: "Matematik", avgScore: 75, totalPlays: 380 },
    { game: "Foizlar", avgScore: 80, totalPlays: 220 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl p-4 mx-auto space-y-6">
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
          <Button icon={<FaDownload />} type="primary">
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
              value={dashboardData?.totalUsers || 1248}
              icon={FaUsers}
              color="blue"
              trend={12}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Faol o'yinlar"
              value={dashboardData?.activeGames || 856}
              icon={FaGamepad}
              color="green"
              trend={8}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Kunlik o'yinlar"
              value={dashboardData?.dailyGames || 342}
              icon={FaChartLine}
              color="orange"
              trend={-3}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <StatCard
              title="Eng yuqori ball"
              value={dashboardData?.topScore || 9850}
              icon={FaTrophy}
              color="gold"
              trend={5}
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
                <Col xs={24} lg={14}>
                  <Card title="Foydalanuvchi faolligi" className="h-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={userActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name="Jami foydalanuvchilar"
                        />
                        <Area
                          type="monotone"
                          dataKey="newUsers"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name="Yangi foydalanuvchilar"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Game Distribution */}
                <Col xs={24} lg={10}>
                  <Card title="O'yinlar taqsimoti" className="h-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={gameData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {gameData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Game Performance */}
                <Col xs={24}>
                  <Card title="O'yinlar samaradorligi">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={gamePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="game" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="avgScore"
                          fill="#8884d8"
                          name="O'rtacha ball"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="totalPlays"
                          fill="#82ca9d"
                          name="Jami o'yinlar"
                        />
                      </BarChart>
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
                      onChange={(value) => console.log("Filter:", value)}
                    >
                      <Option value="all">Barchasi</Option>
                      <Option value="active">Faol</Option>
                      <Option value="inactive">Nofaol</Option>
                      <Option value="new">Yangi</Option>
                    </Select>
                    <Select
                      defaultValue="all"
                      style={{ width: 150 }}
                      onChange={(value) => console.log("Role:", value)}
                    >
                      <Option value="all">Barcha rollar</Option>
                      <Option value="user">Foydalanuvchi</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Space>
                  <Button type="primary">Yangi foydalanuvchi</Button>
                </div>

                {/* Users Table */}
                <Table
                  columns={userColumns}
                  dataSource={userData}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
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
            <TabPane
              tab={
                <span>
                  <FaChartLine className="mr-2" />
                  Tahlil
                </span>
              }
              key="analytics"
            >
              <Row gutter={[24, 24]}>
                {/* Game Selection */}
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

                {/* Analytics Cards */}
                <Col xs={24} sm={8}>
                  <Card className="text-center">
                    <Statistic
                      title="O'rtacha ball"
                      value={75.8}
                      precision={1}
                      valueStyle={{ color: "#3f8600" }}
                      suffix="ball"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="text-center">
                    <Statistic
                      title="O'rtacha vaqt"
                      value={45.2}
                      precision={1}
                      valueStyle={{ color: "#cf1322" }}
                      suffix="soniya"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="text-center">
                    <Statistic
                      title="Aniqlik"
                      value={87.3}
                      precision={1}
                      valueStyle={{ color: "#1890ff" }}
                      suffix="%"
                    />
                  </Card>
                </Col>

                {/* Progress by Level */}
                <Col xs={24}>
                  <Card title="Daraja bo'yicha progress">
                    <Row gutter={[16, 16]}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={level}>
                          <div className="text-center p-4 border rounded-lg">
                            <Text strong>Daraja {level}</Text>
                            <Progress
                              percent={Math.floor(Math.random() * 100)}
                              size="small"
                              className="mt-2"
                            />
                            <Text className="text-xs text-gray-500 block mt-1">
                              {Math.floor(Math.random() * 50 + 10)}{" "}
                              foydalanuvchi
                            </Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
