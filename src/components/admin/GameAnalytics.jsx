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
  DatePicker,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { adminAPI } from "../../utils/api";
import { formatDate, formatScore } from "../../utils/helpers";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const GameAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState("numberMemory");
  const [dateRange, setDateRange] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    performanceMetrics: [],
    difficultyAnalysis: [],
    userProgress: [],
    topPerformers: [],
    timeAnalysis: [],
  });

  useEffect(() => {
    loadGameAnalytics();
  }, [selectedGame, dateRange]);

  const loadGameAnalytics = async () => {
    try {
      setLoading(true);

      // Simulate API call - replace with real API
      const mockData = {
        overview: {
          totalPlays: 1247,
          uniquePlayers: 389,
          avgScore: 76.3,
          avgDuration: 145,
          completionRate: 73.2,
          popularityRank: 2,
        },
        performanceMetrics: [
          { date: "2024-01-01", plays: 45, avgScore: 72, completions: 33 },
          { date: "2024-01-02", plays: 52, avgScore: 75, completions: 39 },
          { date: "2024-01-03", plays: 38, avgScore: 71, completions: 28 },
          { date: "2024-01-04", plays: 61, avgScore: 78, completions: 46 },
          { date: "2024-01-05", plays: 48, avgScore: 74, completions: 35 },
          { date: "2024-01-06", plays: 67, avgScore: 79, completions: 51 },
          { date: "2024-01-07", plays: 72, avgScore: 81, completions: 58 },
        ],
        difficultyAnalysis: [
          { level: "1-3", plays: 356, avgScore: 85.2, completionRate: 92 },
          { level: "4-6", plays: 289, avgScore: 78.1, completionRate: 85 },
          { level: "7-9", plays: 234, avgScore: 72.4, completionRate: 76 },
          { level: "10-12", plays: 189, avgScore: 68.7, completionRate: 68 },
          { level: "13-15", plays: 123, avgScore: 65.3, completionRate: 58 },
          { level: "16+", plays: 87, avgScore: 62.1, completionRate: 45 },
        ],
        userProgress: [
          { segment: "Yangi boshlovchilar", users: 156, retention: 68 },
          { segment: "Faol o'yinchilar", users: 234, retention: 85 },
          { segment: "Ekspert o'yinchilar", users: 89, retention: 92 },
        ],
        topPerformers: [
          { id: 1, name: "Ahmadjon A.", score: 2450, level: 18, games: 47 },
          { id: 2, name: "Malika S.", score: 2380, level: 17, games: 52 },
          { id: 3, name: "Bobur M.", score: 2310, level: 16, games: 43 },
          { id: 4, name: "Dilorom K.", score: 2280, level: 16, games: 48 },
          { id: 5, name: "Jasur N.", score: 2250, level: 15, games: 39 },
        ],
        timeAnalysis: [
          { hour: "6-9", plays: 45, avgPerformance: 72 },
          { hour: "9-12", plays: 89, avgPerformance: 78 },
          { hour: "12-15", plays: 134, avgPerformance: 75 },
          { hour: "15-18", plays: 156, avgPerformance: 79 },
          { hour: "18-21", plays: 189, avgPerformance: 81 },
          { hour: "21-24", plays: 98, avgPerformance: 73 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Game analytics yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  const gameOptions = [
    { value: "numberMemory", label: "🧠 Raqam xotirasi" },
    { value: "tileMemory", label: "🎯 Plitkalar" },
    { value: "schulteTable", label: "📊 Schulte jadvali" },
    { value: "mathSystems", label: "🧮 Matematik amallar" },
    { value: "percentages", label: "📈 Foizlar" },
    { value: "readingSpeed", label: "📖 O'qish tezligi" },
  ];

  const topPerformersColumns = [
    {
      title: "O'rin",
      dataIndex: "id",
      key: "rank",
      width: 60,
      render: (id) => (
        <div className="text-center">
          {id === 1 ? "🥇" : id === 2 ? "🥈" : id === 3 ? "🥉" : `${id}.`}
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
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD.MM.YYYY"
          />
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
                value={analyticsData.overview.totalPlays}
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
                value={analyticsData.overview.uniquePlayers}
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
                value={analyticsData.overview.avgScore}
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
                title="O'rtacha vaqt"
                value={analyticsData.overview.avgDuration}
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
            transition={{ delay: 0.5 }}
          >
            <Card className="text-center">
              <Statistic
                title="Tugatish darajasi"
                value={analyticsData.overview.completionRate}
                precision={1}
                suffix="%"
                prefix="✅"
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
                title="Mashhurlik reytingi"
                value={analyticsData.overview.popularityRank}
                prefix="🏆"
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
                <LineChart data={analyticsData.performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="plays"
                    stroke="#8884d8"
                    name="O'yinlar soni"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#82ca9d"
                    name="O'rtacha ball"
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
            <Card title="Vaqt bo'yicha faollik">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plays" fill="#8884d8" name="O'yinlar soni" />
                  <Bar
                    dataKey="avgPerformance"
                    fill="#82ca9d"
                    name="O'rtacha natija"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Difficulty Analysis */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card title="Qiyinlik darajasi bo'yicha tahlil">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.difficultyAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
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
                    dataKey="completionRate"
                    fill="#82ca9d"
                    name="Tugatish foizi"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card title="Foydalanuvchi segmentlari" className="h-full">
              <div className="space-y-4">
                {analyticsData.userProgress.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <Text strong>{segment.segment}</Text>
                      <Text>{segment.users} foydalanuvchi</Text>
                    </div>
                    <Progress
                      percent={segment.retention}
                      strokeColor={
                        segment.retention > 80
                          ? "#52c41a"
                          : segment.retention > 60
                          ? "#faad14"
                          : "#f5222d"
                      }
                      format={(percent) => `${percent}% retention`}
                    />
                  </div>
                ))}
              </div>
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
              <div className="text-2xl font-bold text-green-700">+12.4%</div>
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
                Eng tez o'yin
              </Title>
              <div className="text-2xl font-bold text-purple-700">45s</div>
              <Text className="text-purple-600">O'rtacha vaqt</Text>
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
                            percent={92}
                            size="small"
                            strokeColor="#52c41a"
                            showInfo={false}
                            className="w-20"
                          />
                          <Text className="text-green-600">92%</Text>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>O'rta daraja (4-9)</Text>
                        <div className="flex items-center space-x-2">
                          <Progress
                            percent={80}
                            size="small"
                            strokeColor="#faad14"
                            showInfo={false}
                            className="w-20"
                          />
                          <Text className="text-orange-600">80%</Text>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Qiyin daraja (10+)</Text>
                        <div className="flex items-center space-x-2">
                          <Progress
                            percent={56}
                            size="small"
                            strokeColor="#f5222d"
                            showInfo={false}
                            className="w-20"
                          />
                          <Text className="text-red-600">56%</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="space-y-4">
                    <Title level={5}>⏰ Vaqt bo'yicha trend</Title>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text>Ertalabki soatlar (6-12)</Text>
                        <Tag color="blue">Barqaror</Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Tushlik vaqti (12-15)</Text>
                        <Tag color="orange">O'rtacha</Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Kechki soatlar (18-21)</Text>
                        <Tag color="green">Eng yuqori</Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text>Kechki soatlar (21-24)</Text>
                        <Tag color="purple">Kamayuvchi</Tag>
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
                      Qiyin darajadagi o'yinlar uchun qo'shimcha yo'riqnoma
                      taqdim eting
                    </Text>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <Text className="text-blue-700">
                      Kechki soatlarda maxsus tadbirlar o'tkazing
                    </Text>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <Text className="text-blue-700">
                      Yangi o'yinchilar uchun adaptiv qiyinlik tizimini joriy
                      eting
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
