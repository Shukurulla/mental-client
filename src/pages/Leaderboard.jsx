import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Avatar,
  Tag,
  Select,
  Button,
  Tabs,
  Statistic,
  Progress,
  Input,
  DatePicker,
  Space,
  Tooltip,
} from "antd";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaFire,
  FaSearch,
  FaCalendar,
  FaGamepad,
  FaBrain,
  FaUser,
  FaCrown,
  FaAward,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { resultsAPI } from "../utils/api";
import { formatScore, formatDate } from "../utils/helpers";
import LoadingSpinner from "../components/common/LoadingSpinner";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState({
    overall: [],
    weekly: [],
    monthly: [],
    gameSpecific: {},
  });
  const [selectedGame, setSelectedGame] = useState("overall");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedGame, selectedPeriod]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);

      // Mock leaderboard data
      const mockOverallData = [
        {
          id: 1,
          rank: 1,
          name: "Ahmadjon Karimov",
          avatar: null,
          totalScore: 25840,
          level: 18,
          gamesPlayed: 324,
          winRate: 89,
          avgScore: 79.8,
          streak: 12,
          isCurrentUser: false,
        },
        {
          id: 2,
          rank: 2,
          name: "Malika Sultanova",
          avatar: null,
          totalScore: 24310,
          level: 17,
          gamesPlayed: 298,
          winRate: 91,
          avgScore: 81.6,
          streak: 25,
          isCurrentUser: false,
        },
        {
          id: 3,
          rank: 3,
          name: "Bobur Mahmudov",
          avatar: null,
          totalScore: 22650,
          level: 16,
          gamesPlayed: 267,
          winRate: 84,
          avgScore: 84.8,
          streak: 8,
          isCurrentUser: false,
        },
        {
          id: 4,
          rank: 4,
          name: user?.name || "Siz",
          avatar: user?.avatar,
          totalScore: user?.totalScore || 18950,
          level: user?.level || 15,
          gamesPlayed: user?.gamesPlayed || 234,
          winRate: 87,
          avgScore: 81.0,
          streak: 15,
          isCurrentUser: true,
        },
        {
          id: 5,
          rank: 5,
          name: "Dilorom Karimova",
          avatar: null,
          totalScore: 18240,
          level: 14,
          gamesPlayed: 212,
          winRate: 86,
          avgScore: 86.1,
          streak: 6,
          isCurrentUser: false,
        },
        // Add more mock users...
        ...Array.from({ length: 15 }, (_, i) => ({
          id: i + 6,
          rank: i + 6,
          name: `Foydalanuvchi ${i + 6}`,
          avatar: null,
          totalScore: 18000 - i * 800,
          level: 14 - Math.floor(i / 3),
          gamesPlayed: 200 - i * 10,
          winRate: 85 - i * 2,
          avgScore: 80 - i * 1.5,
          streak: Math.max(1, 10 - i),
          isCurrentUser: false,
        })),
      ];

      const mockGameData = {
        numberMemory: mockOverallData.map((user) => ({
          ...user,
          totalScore: user.totalScore * 0.3,
          gamesPlayed: Math.floor(user.gamesPlayed * 0.4),
        })),
        schulteTable: mockOverallData.map((user) => ({
          ...user,
          totalScore: user.totalScore * 0.25,
          gamesPlayed: Math.floor(user.gamesPlayed * 0.3),
        })),
        mathSystems: mockOverallData.map((user) => ({
          ...user,
          totalScore: user.totalScore * 0.2,
          gamesPlayed: Math.floor(user.gamesPlayed * 0.2),
        })),
      };

      setLeaderboardData({
        overall: mockOverallData,
        weekly: mockOverallData.slice(0, 10),
        monthly: mockOverallData.slice(0, 15),
        gameSpecific: mockGameData,
      });
    } catch (error) {
      console.error("Reyting ma'lumotlarini yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "gold";
    if (rank === 2) return "default";
    if (rank === 3) return "orange";
    if (rank <= 10) return "blue";
    return "default";
  };

  const columns = [
    {
      title: "O'rin",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank) => <div className="text-center">{getRankIcon(rank)}</div>,
    },
    {
      title: "Foydalanuvchi",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={record.avatar}
            icon={<FaUser />}
            className={record.isCurrentUser ? "border-2 border-blue-500" : ""}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`font-medium ${
                  record.isCurrentUser ? "text-blue-600" : ""
                }`}
              >
                {name}
              </span>
              {record.isCurrentUser && (
                <Tag color="blue" size="small">
                  Siz
                </Tag>
              )}
              {record.rank === 1 && <FaCrown className="text-yellow-500" />}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Daraja {record.level}</span>
              {record.streak > 7 && (
                <span className="flex items-center">
                  <FaFire className="text-orange-500 mr-1" />
                  {record.streak}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Umumiy ball",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => (
        <span className="font-mono font-bold">{formatScore(score)}</span>
      ),
      sorter: (a, b) => a.totalScore - b.totalScore,
    },
    {
      title: "O'yinlar",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      width: 100,
    },
    {
      title: "G'alaba %",
      dataIndex: "winRate",
      key: "winRate",
      width: 100,
      render: (rate) => (
        <span
          className={
            rate >= 80
              ? "text-green-600"
              : rate >= 60
              ? "text-orange-600"
              : "text-red-600"
          }
        >
          {rate}%
        </span>
      ),
    },
    {
      title: "O'rtacha",
      dataIndex: "avgScore",
      key: "avgScore",
      width: 100,
      render: (avg) => avg.toFixed(1),
    },
  ];

  const filteredData = (data) => {
    if (!searchTerm) return data;
    return data.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getCurrentData = () => {
    if (selectedGame === "overall") {
      return selectedPeriod === "weekly"
        ? leaderboardData.weekly
        : selectedPeriod === "monthly"
        ? leaderboardData.monthly
        : leaderboardData.overall;
    }
    return leaderboardData.gameSpecific[selectedGame] || [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const currentUserRank = getCurrentData().find((u) => u.isCurrentUser);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Title level={1} className="text-gray-800 mb-2">
          🏆 Reyting
        </Title>
        <Text className="text-lg text-gray-600">
          Eng yaxshi o'yinchilar va sizning o'rningiz
        </Text>
      </motion.div>

      {/* Current User Stats */}
      {currentUserRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <Title level={4} className="mb-4">
                Sizning o'rningiz
              </Title>
              <Row gutter={[24, 24]} justify="center">
                <Col xs={12} sm={6}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {getRankIcon(currentUserRank.rank)}
                    </div>
                    <Text className="text-gray-600">O'rin</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Umumiy ball"
                    value={currentUserRank.totalScore}
                    formatter={(value) => formatScore(value)}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="O'yinlar"
                    value={currentUserRank.gamesPlayed}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="G'alaba %"
                    value={currentUserRank.winRate}
                    suffix="%"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <Title level={4} className="text-center mb-6">
            🏆 TOP 3 O'yinchilar
          </Title>
          <Row gutter={[24, 24]} justify="center">
            {getCurrentData()
              .slice(0, 3)
              .map((user, index) => (
                <Col xs={24} sm={8} key={user.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`text-center p-6 rounded-lg ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-100 to-yellow-200"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-100 to-gray-200"
                        : "bg-gradient-to-br from-orange-100 to-orange-200"
                    }`}
                  >
                    <div className="text-4xl mb-3">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </div>
                    <Avatar
                      size={64}
                      src={user.avatar}
                      icon={<FaUser />}
                      className="mb-3 border-4 border-white"
                    />
                    <Title level={5} className="mb-2">
                      {user.name}
                    </Title>
                    <div className="space-y-1">
                      <div className="font-bold text-lg">
                        {formatScore(user.totalScore)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Daraja {user.level} • {user.gamesPlayed} o'yin
                      </div>
                      {user.streak > 5 && (
                        <Tag color="orange" size="small">
                          <FaFire className="mr-1" />
                          {user.streak} kun
                        </Tag>
                      )}
                    </div>
                  </motion.div>
                </Col>
              ))}
          </Row>
        </Card>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="O'yinchi qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={selectedGame}
                onChange={setSelectedGame}
                style={{ width: "100%" }}
              >
                <Option value="overall">
                  <FaTrophy className="mr-2" />
                  Umumiy
                </Option>
                <Option value="numberMemory">
                  <FaBrain className="mr-2" />
                  Raqam xotirasi
                </Option>
                <Option value="schulteTable">
                  <FaGamepad className="mr-2" />
                  Schulte
                </Option>
                <Option value="mathSystems">
                  <FaMedal className="mr-2" />
                  Matematik
                </Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: "100%" }}
              >
                <Option value="all">Barcha vaqt</Option>
                <Option value="monthly">Bu oy</Option>
                <Option value="weekly">Bu hafta</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex justify-end">
                <Space>
                  <Tooltip title="Ma'lumotlarni yangilash">
                    <Button
                      icon={<FaSearch />}
                      onClick={loadLeaderboardData}
                      loading={loading}
                    >
                      Yangilash
                    </Button>
                  </Tooltip>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData(getCurrentData())}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} o'yinchi`,
            }}
            rowClassName={(record) =>
              record.isCurrentUser ? "bg-blue-50" : ""
            }
            scroll={{ x: 800 }}
          />
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Jami o'yinchilar"
                value={getCurrentData().length}
                prefix={<FaUser className="text-green-600" />}
                valueStyle={{ color: "#16a34a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="Eng yuqori ball"
                value={getCurrentData()[0]?.totalScore || 0}
                formatter={(value) => formatScore(value)}
                prefix={<FaTrophy className="text-blue-600" />}
                valueStyle={{ color: "#2563eb" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
              <Statistic
                title="O'rtacha ball"
                value={
                  getCurrentData().length > 0
                    ? Math.round(
                        getCurrentData().reduce(
                          (sum, user) => sum + user.totalScore,
                          0
                        ) / getCurrentData().length
                      )
                    : 0
                }
                formatter={(value) => formatScore(value)}
                prefix={<FaStar className="text-purple-600" />}
                valueStyle={{ color: "#9333ea" }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Weekly Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <Title level={4} className="mb-4">
            <FaAward className="mr-2 text-orange-500" />
            Haftalik Challenge-lar
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <Title level={5}>Olovli Seriya</Title>
                  <Text className="text-gray-600 block mb-3">
                    7 kun ketma-ket o'ynang
                  </Text>
                  <Progress
                    percent={user ? Math.min((15 / 7) * 100, 100) : 0}
                    strokeColor="#f97316"
                  />
                  <Text className="text-xs text-gray-500">
                    {user ? "15/7 kun" : "0/7 kun"}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <Title level={5}>Aniq Nishon</Title>
                  <Text className="text-gray-600 block mb-3">
                    90% aniqlik bilan 10 ta o'yin
                  </Text>
                  <Progress
                    percent={user ? Math.min((7 / 10) * 100, 100) : 0}
                    strokeColor="#0ea5e9"
                  />
                  <Text className="text-xs text-gray-500">
                    {user ? "7/10 o'yin" : "0/10 o'yin"}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <Title level={5}>Tezkor Fikr</Title>
                  <Text className="text-gray-600 block mb-3">
                    5 ta o'yinni 60 soniyada tugating
                  </Text>
                  <Progress
                    percent={user ? Math.min((3 / 5) * 100, 100) : 0}
                    strokeColor="#a855f7"
                  />
                  <Text className="text-xs text-gray-500">
                    {user ? "3/5 o'yin" : "0/5 o'yin"}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
