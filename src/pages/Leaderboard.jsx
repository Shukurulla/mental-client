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
  Statistic,
  Input,
  Space,
  Tooltip,
  message,
} from "antd";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaFire,
  FaSearch,
  FaGamepad,
  FaBrain,
  FaUser,
  FaCrown,
  FaAward,
  FaRulerCombined,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Leaderboard = () => {
  const { user } = useAuthStore();
  const token = JSON.parse(localStorage.getItem("auth-storage")).state.token;
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({
    overall: [],
    gameSpecific: {},
  });
  const [selectedGame, setSelectedGame] = useState("overall");
  const [searchTerm, setSearchTerm] = useState("");
  const [userStats, setUserStats] = useState({
    rank: 0,
    totalScore: 0,
    level: 0,
    gamesPlayed: 0,
  });

  useEffect(() => {
    loadLeaderboardData();
    if (user) {
      loadUserStats();
    }
  }, [selectedGame]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);

      if (selectedGame === "overall") {
        // Load global leaderboard
        const response = await axios.get(
          `${API_BASE_URL}/results/leaderboard/global?limit=50`
        );

        if (response.data.success) {
          const globalData = response.data.data.map((user, index) => ({
            id: user._id,
            rank: index + 1,
            name: user.name,
            avatar: user.avatar,
            totalScore: user.totalScore || 0,
            level: user.level || 1,
            gamesPlayed: user.gamesPlayed || 0,
            winRate: Math.round(Math.random() * 30 + 70), // Temporary calculation
            avgScore: Math.round(
              (user.totalScore || 0) / Math.max(user.gamesPlayed || 1, 1)
            ),
            streak: Math.floor(Math.random() * 20 + 1), // Temporary
            isCurrentUser: user._id === user?.id,
          }));

          setLeaderboardData((prev) => ({
            ...prev,
            overall: globalData,
          }));
        }
      } else {
        // Load game-specific leaderboard
        const response = await axios.get(
          `${API_BASE_URL}/results/leaderboard/${selectedGame}`
        );

        if (response.data.success) {
          const gameData = response.data.data.map((item, index) => ({
            id: item.user?._id || item._id,
            rank: index + 1,
            name: item.user?.name || "Unknown",
            avatar: item.user?.avatar,
            totalScore: item.bestScore || 0,
            level: item.user?.level || 1,
            gamesPlayed: item.gamesPlayed || 0,
            winRate: Math.round(Math.random() * 30 + 70),
            avgScore: Math.round(item.bestScore || 0),
            streak: Math.floor(Math.random() * 20 + 1),
            isCurrentUser: item.user?._id === user?.id,
          }));

          setLeaderboardData((prev) => ({
            ...prev,
            gameSpecific: {
              ...prev.gameSpecific,
              [selectedGame]: gameData,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Reyting ma'lumotlarini yuklashda xato:", error);
      message.error("Reyting ma'lumotlarini yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };
  console.log();

  const loadUserStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const data = response.data.data;
        setUserStats({
          rank: data.userRank || 0,
          totalScore: data.user?.totalScore || 0,
          level: data.user?.level || 1,
          gamesPlayed: data.user?.gamesPlayed || 0,
        });
      }
    } catch (error) {
      console.error("User stats yuklashda xato:", error);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshLoading(true);
    await loadLeaderboardData();
    if (user) {
      await loadUserStats();
    }
    setRefreshLoading(false);
    message.success("Reyting yangilandi");
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

  const formatScore = (score) => {
    if (!score) return "0";
    return score.toLocaleString();
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
      render: (avg) => formatScore(avg),
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
      return leaderboardData.overall;
    }
    return leaderboardData.gameSpecific[selectedGame] || [];
  };

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
      {user && userStats && (
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
                      {getRankIcon(userStats.rank || 999)}
                    </div>
                    <Text className="text-gray-600">O'rin</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Umumiy ball"
                    value={userStats.totalScore}
                    formatter={(value) => formatScore(value)}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="O'yinlar"
                    value={userStats.gamesPlayed}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Daraja"
                    value={userStats.level}
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
            <Col xs={12} sm={6}>
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
                <Option value="tileMemory">
                  <FaGamepad className="mr-2" />
                  Plitkalar
                </Option>
                <Option value="schulteTable">
                  <FaMedal className="mr-2" />
                  Schulte
                </Option>
                <Option value="mathSystems">
                  <FaMedal className="mr-2" />
                  Matematik
                </Option>
                <Option value="percentages">
                  <FaMedal className="mr-2" />
                  Foizlar
                </Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Button
                icon={<FaRulerCombined />}
                onClick={refreshLeaderboard}
                loading={refreshLoading}
                style={{ width: "100%" }}
              >
                Yangilash
              </Button>
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
            loading={loading}
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
    </div>
  );
};

export default Leaderboard;
