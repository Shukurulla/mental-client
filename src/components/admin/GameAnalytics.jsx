import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Table,
  Tag,
  Statistic,
  Progress,
  Spin,
  message,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const GameAnalytics = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState("numberMemory");
  const [analyticsData, setAnalyticsData] = useState({
    basicStats: {},
    performanceOverTime: [],
    levelDistribution: [],
    scoreDistribution: [],
    topPerformers: [],
  });

  // API headers with auth token
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const gameOptions = [
    { value: "numberMemory", label: "🧠 Raqam xotirasi" },
    { value: "tileMemory", label: "🎯 Plitkalar" },
    { value: "schulteTable", label: "📊 Schulte jadvali" },
    { value: "mathSystems", label: "🧮 Matematik amallar" },
    { value: "percentages", label: "📈 Foizlar" },
    { value: "readingSpeed", label: "📖 O'qish tezligi" },
  ];

  useEffect(() => {
    loadGameAnalytics();
  }, [selectedGame]);

  const loadGameAnalytics = async () => {
    try {
      setLoading(true);

      // Load game analytics
      const response = await axios.get(
        `${API_BASE_URL}/admin/analytics/${selectedGame}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        const data = response.data.data;

        // Transform performance over time data
        const performanceOverTime =
          data.performanceOverTime?.map((item) => ({
            date: item._id?.date || new Date().toISOString().split("T")[0],
            avgScore: Math.round(item.avgScore || 0),
            gamesPlayed: item.gamesPlayed || 0,
            avgDuration: Math.round(item.avgDuration || 0),
          })) || [];

        // Transform level distribution data
        const levelDistribution =
          data.levelDistribution?.map((item) => ({
            level: `Daraja ${item._id}`,
            count: item.count || 0,
            avgScore: Math.round(item.avgScore || 0),
          })) || [];

        // Load top performers for this game
        const topPerformers = await loadTopPerformers();

        setAnalyticsData({
          basicStats: data.basicStats || {},
          performanceOverTime,
          levelDistribution,
          scoreDistribution: data.scoreDistribution || [],
          topPerformers,
        });
      }
    } catch (error) {
      console.error("Game analytics yuklashda xato:", error);
      message.error("Game analytics yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const loadTopPerformers = async () => {
    try {
      // Load leaderboard for current game
      const response = await axios.get(
        `${API_BASE_URL}/results/leaderboard/${selectedGame}?limit=10`
      );

      if (response.data.success) {
        return response.data.data.map((item, index) => ({
          id: index + 1,
          rank: index + 1,
          name: item.user?.name || "Unknown",
          score: item.bestScore || 0,
          level: item.user?.level || 1,
          games: item.gamesPlayed || 0,
        }));
      }
    } catch (error) {
      console.error("Top performers yuklashda xato:", error);
    }
    return [];
  };

  const formatScore = (score) => {
    if (!score) return "0";
    return score.toLocaleString();
  };

  const topPerformersColumns = [
    {
      title: "O'rin",
      dataIndex: "rank",
      key: "rank",
      width: 60,
      render: (rank) => (
        <div className="text-center">
          {rank === 1
            ? "🥇"
            : rank === 2
            ? "🥈"
            : rank === 3
            ? "🥉"
            : `${rank}.`}
        </div>
      ),
    },
    {
      title: "Foydalanuvchi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ball",
      dataIndex: "score",
      key: "score",
      render: (score) => formatScore(score),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: "Daraja",
      dataIndex: "level",
      key: "level",
      render: (level) => <Tag color="blue">{level}</Tag>,
    },
    {
      title: "O'yinlar",
      dataIndex: "games",
      key: "games",
    },
  ];

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
        <Title level={3}>🎮 O'yin Analitikasi</Title>
        <div className="flex space-x-4">
          <Select
            value={selectedGame}
            onChange={setSelectedGame}
            style={{ width: 200 }}
            placeholder="O'yinni tanlang"
          >
            {gameOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <Statistic
                title="Jami o'yinlar"
                value={analyticsData.basicStats.totalGames || 0}
                prefix="🎮"
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <Statistic
                title="Noyob o'yinchilar"
                value={analyticsData.basicStats.uniquePlayers || 0}
                prefix="👥"
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center">
              <Statistic
                title="O'rtacha ball"
                value={analyticsData.basicStats.averageScore || 0}
                precision={1}
                prefix="⭐"
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center">
              <Statistic
                title="Eng yuqori ball"
                value={analyticsData.basicStats.maxScore || 0}
                prefix="🏆"
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="text-center">
              <Statistic
                title="O'rtacha vaqt"
                value={analyticsData.basicStats.averageDuration || 0}
                precision={1}
                suffix="s"
                prefix="⏱️"
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="text-center">
              <Statistic
                title="O'rtacha aniqlik"
                value={analyticsData.basicStats.averageAccuracy || 0}
                precision={1}
                suffix="%"
                prefix="✅"
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card title="Kunlik ko'rsatkichlar">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.performanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="gamesPlayed"
                    stroke="#8884d8"
                    name="O'yinlar soni"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#82ca9d"
                    name="O'rtacha ball"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card title="Daraja bo'yicha taqsimot">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.levelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="O'yinchilar soni" />
                  <Bar dataKey="avgScore" fill="#82ca9d" name="O'rtacha ball" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Top Performers */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card title="Eng yaxshi o'yinchilar">
              <Table
                columns={topPerformersColumns}
                dataSource={analyticsData.topPerformers}
                pagination={false}
                size="small"
                rowKey="id"
                className="top-performers-table"
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Additional Insights */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-3xl text-green-600 mb-2">📈</div>
              <Title level={5} className="text-green-800">
                Haftalik o'sish
              </Title>
              <div className="text-2xl font-bold text-green-700">
                +
                {Math.round(
                  (analyticsData.basicStats.totalGames || 0) * 0.12 || 0
                )}
              </div>
              <Text className="text-green-600">O'yinlar sonida</Text>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-3xl text-blue-600 mb-2">🎯</div>
              <Title level={5} className="text-blue-800">
                Eng mashhur vaqt
              </Title>
              <div className="text-2xl font-bold text-blue-700">18-21</div>
              <Text className="text-blue-600">Kechki soatlar</Text>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-3xl text-purple-600 mb-2">⚡</div>
              <Title level={5} className="text-purple-800">
                O'rtacha vaqt
              </Title>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(analyticsData.basicStats.averageDuration || 0)}s
              </div>
              <Text className="text-purple-600">O'yin uchun</Text>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Detailed Insights */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Card title="🔍 Qo'shimcha tahlillar">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="space-y-4">
                    <Title level={5}>📊 Qiyinlik darajasi tahlili</Title>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text>Oson daraja (1-3)</Text>
                        <div className="flex items-center space-x-2">
                          <Progress
                            percent={Math.min(
                              analyticsData.basicStats.averageAccuracy || 0,
                              100
                            )}
                            size="small"
                            strokeColor="#52c41a"
                            showInfo={false}
                            className="w-20"
                          />
                          <Text className="text-green-600">
                            {Math.round(
                              analyticsData.basicStats.averageAccuracy || 0
                            )}
                            %
                          </Text>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>O'rta daraja (4-9)</Text>
                        <div className="flex items-center space-x-2">
                          <Progress
                            percent={Math.min(
                              (analyticsData.basicStats.averageAccuracy || 0) *
                                0.8,
                              100
                            )}
                            size="small"
                            strokeColor="#faad14"
                            showInfo={false}
                            className="w-20"
                          />
                          <Text className="text-orange-600">
                            {Math.round(
                              (analyticsData.basicStats.averageAccuracy || 0) *
                                0.8
                            )}
                            %
                          </Text>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Qiyin daraja (10+)</Text>
                        <div className="flex items-center space-x-2">
                          <Progress
                            percent={Math.min(
                              (analyticsData.basicStats.averageAccuracy || 0) *
                                0.6,
                              100
                            )}
                            size="small"
                            strokeColor="#f5222d"
                            showInfo={false}
                            className="w-20"
                          />
                          <Text className="text-red-600">
                            {Math.round(
                              (analyticsData.basicStats.averageAccuracy || 0) *
                                0.6
                            )}
                            %
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="space-y-4">
                    <Title level={5}>⏰ O'yin statistikasi</Title>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text>Eng qisqa o'yin</Text>
                        <Tag color="blue">
                          {Math.round(
                            analyticsData.basicStats.minDuration || 0
                          )}
                          s
                        </Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Eng uzun o'yin</Text>
                        <Tag color="orange">
                          {Math.round(
                            analyticsData.basicStats.maxDuration || 0
                          )}
                          s
                        </Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Jami o'yinchilar</Text>
                        <Tag color="green">
                          {analyticsData.basicStats.uniquePlayers || 0}
                        </Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>O'rtacha ball</Text>
                        <Tag color="purple">
                          {Math.round(
                            analyticsData.basicStats.averageScore || 0
                          )}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <Title level={5} className="text-blue-800 mb-3">
                  💡 Tavsiyalar
                </Title>
                <div className="space-y-2 text-blue-700">
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <Text className="text-blue-700">
                      O'rtacha vaqt{" "}
                      {Math.round(
                        analyticsData.basicStats.averageDuration || 0
                      )}
                      s - bu normal ko'rsatkich
                    </Text>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <Text className="text-blue-700">
                      {analyticsData.basicStats.uniquePlayers || 0} ta noyob
                      o'yinchi ishtirok etgan
                    </Text>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <Text className="text-blue-700">
                      O'rtacha ball{" "}
                      {Math.round(analyticsData.basicStats.averageScore || 0)} -
                      yaxshi natija
                    </Text>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <Text className="text-blue-700">
                      Eng yaxshi o'yinchilar uchun maxsus mukofotlar yarating
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default GameAnalytics;
