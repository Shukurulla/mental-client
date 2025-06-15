import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Select, DatePicker, Spin } from "antd";
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
import { adminAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Charts = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    userActivity: [],
    gameStats: [],
    performanceData: [],
    levelDistribution: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedGame, setSelectedGame] = useState("all");

  useEffect(() => {
    loadChartData();
  }, [selectedPeriod, selectedGame]);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Simulate API calls - replace with real API
      const userActivityData = [
        { date: "1-kun", users: 45, newUsers: 12, activeGames: 156 },
        { date: "2-kun", users: 52, newUsers: 8, activeGames: 178 },
        { date: "3-kun", users: 48, newUsers: 15, activeGames: 165 },
        { date: "4-kun", users: 61, newUsers: 23, activeGames: 203 },
        { date: "5-kun", users: 58, newUsers: 11, activeGames: 189 },
        { date: "6-kun", users: 67, newUsers: 19, activeGames: 234 },
        { date: "7-kun", users: 72, newUsers: 16, activeGames: 267 },
      ];

      const gameStatsData = [
        { game: "Raqam xotirasi", plays: 234, avgScore: 85, difficulty: 7.2 },
        { game: "Plitkalar", plays: 189, avgScore: 72, difficulty: 6.8 },
        { game: "Schulte", plays: 156, avgScore: 68, difficulty: 8.1 },
        { game: "Matematik", plays: 203, avgScore: 75, difficulty: 7.9 },
        { game: "Foizlar", plays: 145, avgScore: 80, difficulty: 6.5 },
        { game: "O'qish", plays: 167, avgScore: 77, difficulty: 6.9 },
      ];

      const performanceData = [
        { level: "1-3", users: 145, avgTime: 120, completion: 92 },
        { level: "4-6", users: 89, avgTime: 145, completion: 78 },
        { level: "7-9", users: 67, avgTime: 180, completion: 65 },
        { level: "10-12", users: 34, avgTime: 220, completion: 52 },
        { level: "13-15", users: 23, avgTime: 280, completion: 41 },
        { level: "16+", users: 12, avgTime: 350, completion: 28 },
      ];

      const levelDistributionData = [
        { name: "1-2 daraja", value: 35, color: "#0088FE" },
        { name: "3-5 daraja", value: 28, color: "#00C49F" },
        { name: "6-8 daraja", value: 20, color: "#FFBB28" },
        { name: "9-12 daraja", value: 12, color: "#FF8042" },
        { name: "13+ daraja", value: 5, color: "#8884D8" },
      ];

      setChartData({
        userActivity: userActivityData,
        gameStats: gameStatsData,
        performanceData: performanceData,
        levelDistribution: levelDistributionData,
      });
    } catch (error) {
      console.error("Chart ma'lumotlarini yuklashda xato:", error);
    } finally {
      setLoading(false);
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
              <div className="text-2xl font-bold text-blue-700">+15.4%</div>
              <Text className="text-blue-600">Bu haftada</Text>
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
              <div className="text-2xl font-bold text-green-700">78.3%</div>
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
                O'rtacha reyting
              </Title>
              <div className="text-2xl font-bold text-purple-700">4.7/5.0</div>
              <Text className="text-purple-600">Foydalanuvchi baholash</Text>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Charts;
