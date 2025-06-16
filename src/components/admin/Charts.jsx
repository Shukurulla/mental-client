import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Select, Spin, message } from "antd";
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
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Charts = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    userActivity: [],
    gameStats: [],
    performanceData: [],
    levelDistribution: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedGame, setSelectedGame] = useState("all");
  const [systemStats, setSystemStats] = useState({});

  // API headers with auth token
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    loadChartData();
    loadSystemStats();
  }, [selectedPeriod, selectedGame]);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Load dashboard data for charts
      const dashboardResponse = await axios.get(
        `${API_BASE_URL}/admin/dashboard`,
        getAuthHeaders()
      );

      if (dashboardResponse.data.success) {
        const data = dashboardResponse.data.data;

        // Transform user activity data
        const userActivity =
          data.userActivity?.map((item) => ({
            date: new Date(item.date).toLocaleDateString(),
            users: item.uniqueUsers || 0,
            newUsers: Math.floor((item.uniqueUsers || 0) * 0.2), // Estimate new users
            activeGames: item.gamesPlayed || 0,
          })) || [];

        // Transform popular games data for bar chart
        const gameStats =
          data.popularGames?.map((game) => ({
            game: game._id || "Unknown",
            plays: game.count || 0,
            avgScore: Math.round(game.avgScore || 0),
            difficulty: Math.round((game.avgScore || 50) / 10) / 10,
          })) || [];

        // Create performance data based on game analytics
        const performanceData = await loadPerformanceData();

        // Create level distribution from user data
        const levelDistribution = await loadLevelDistribution();

        setChartData({
          userActivity,
          gameStats,
          performanceData,
          levelDistribution,
        });
      }
    } catch (error) {
      console.error("Chart ma'lumotlarini yuklashda xato:", error);
      message.error("Chart ma'lumotlarini yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    try {
      // Load performance data for different levels
      const response = await axios.get(
        `${API_BASE_URL}/admin/users?limit=1000`,
        getAuthHeaders()
      );

      if (response.data.success) {
        const users = response.data.data.users;

        // Group users by level ranges
        const levelRanges = [
          { level: "1-3", min: 1, max: 3 },
          { level: "4-6", min: 4, max: 6 },
          { level: "7-9", min: 7, max: 9 },
          { level: "10-12", min: 10, max: 12 },
          { level: "13-15", min: 13, max: 15 },
          { level: "16+", min: 16, max: 999 },
        ];

        return levelRanges.map((range) => {
          const usersInRange = users.filter(
            (user) => user.level >= range.min && user.level <= range.max
          );

          const totalUsers = usersInRange.length;
          const avgTime =
            totalUsers > 0
              ? (usersInRange.reduce(
                  (sum, user) => sum + (user.gamesPlayed || 0),
                  0
                ) /
                  totalUsers) *
                30
              : 0;
          const completion = Math.min(100 - (range.min - 1) * 8, 95);

          return {
            level: range.level,
            users: totalUsers,
            avgTime: Math.round(avgTime),
            completion: Math.max(completion, 20),
          };
        });
      }
    } catch (error) {
      console.error("Performance data yuklashda xato:", error);
    }
    return [];
  };

  const loadLevelDistribution = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/users?limit=1000`,
        getAuthHeaders()
      );

      if (response.data.success) {
        const users = response.data.data.users;

        const distribution = [
          { name: "1-2 daraja", range: [1, 2], color: "#0088FE" },
          { name: "3-5 daraja", range: [3, 5], color: "#00C49F" },
          { name: "6-8 daraja", range: [6, 8], color: "#FFBB28" },
          { name: "9-12 daraja", range: [9, 12], color: "#FF8042" },
          { name: "13+ daraja", range: [13, 999], color: "#8884D8" },
        ];

        return distribution.map((item) => {
          const count = users.filter(
            (user) => user.level >= item.range[0] && user.level <= item.range[1]
          ).length;

          return {
            name: item.name,
            value: count,
            color: item.color,
          };
        });
      }
    } catch (error) {
      console.error("Level distribution yuklashda xato:", error);
    }
    return [];
  };

  const loadSystemStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/system`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setSystemStats(response.data.data);
      }
    } catch (error) {
      console.error("System stats yuklashda xato:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={3}>📊 Statistik Ma'lumotlar</Title>
        <div className="flex space-x-4">
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 120 }}
          >
            <Option value="day">Bugun</Option>
            <Option value="week">Bu hafta</Option>
            <Option value="month">Bu oy</Option>
            <Option value="year">Bu yil</Option>
          </Select>
          <Select
            value={selectedGame}
            onChange={setSelectedGame}
            style={{ width: 150 }}
          >
            <Option value="all">Barcha o'yinlar</Option>
            <Option value="numberMemory">Raqam xotirasi</Option>
            <Option value="tileMemory">Plitkalar</Option>
            <Option value="schulteTable">Schulte</Option>
            <Option value="mathSystems">Matematik</Option>
          </Select>
        </div>
      </div>

      {/* Charts Grid */}
      <Row gutter={[24, 24]}>
        {/* User Activity Chart */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card title="Foydalanuvchi faolligi" className="h-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.userActivity}>
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
                    name="Faol foydalanuvchilar"
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
          </motion.div>
        </Col>

        {/* Level Distribution */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card title="Daraja taqsimoti" className="h-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.levelDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {chartData.levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        {/* Game Statistics */}
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card title="O'yinlar statistikasi">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.gameStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="game" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="plays"
                    fill="#8884d8"
                    name="O'yinlar soni"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="avgScore"
                    fill="#82ca9d"
                    name="O'rtacha ball"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        {/* Performance by Level */}
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card title="Daraja bo'yicha ishlash ko'rsatkichlari">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    name="Foydalanuvchilar soni"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completion"
                    stroke="#82ca9d"
                    name="Tugatish foizi (%)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#ffc658"
                    name="O'rtacha vaqt (s)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-3xl text-blue-600 mb-2">📈</div>
              <Title level={4} className="text-blue-800">
                O'sish sur'ati
              </Title>
              <div className="text-2xl font-bold text-blue-700">
                +{systemStats.growth?.newUsers || 0}
              </div>
              <Text className="text-blue-600">
                Yangi foydalanuvchilar (haftalik)
              </Text>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-3xl text-green-600 mb-2">🎯</div>
              <Title level={4} className="text-green-800">
                Faollik darajasi
              </Title>
              <div className="text-2xl font-bold text-green-700">
                {systemStats.database?.activeUsers &&
                systemStats.database?.users
                  ? Math.round(
                      (systemStats.database.activeUsers /
                        systemStats.database.users) *
                        100
                    )
                  : 0}
                %
              </div>
              <Text className="text-green-600">
                Kunlik faol foydalanuvchilar
              </Text>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-3xl text-purple-600 mb-2">⭐</div>
              <Title level={4} className="text-purple-800">
                O'rtacha ball
              </Title>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(systemStats.performance?.avgScore || 0)}
              </div>
              <Text className="text-purple-600">Tizim bo'yicha o'rtacha</Text>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Charts;
