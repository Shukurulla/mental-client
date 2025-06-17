// pages/Leaderboard.jsx
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
  Modal,
  Alert,
  Spin,
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
  FaInfoCircle,
  FaQuestionCircle,
  FaBug,
  FaUsers,
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
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const token = authStorage?.state?.token;

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
    rankingScore: 0,
    averageScore: 0,
    streak: 0,
  });
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await loadDebugInfo(); // Load debug info first
      await loadLeaderboardData(); // Then load leaderboard data
      if (user && token) {
        await loadUserStats();
      }
    };
    fetchData();
  }, [selectedGame, user, token]);

  const loadDebugInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/debug-users`);
      setDebugInfo(response.data.debug);
      console.log("Debug info:", response.data.debug);
    } catch (error) {
      console.error("Debug info yuklashda xato:", error);
    }
  };

  const createSampleUsers = async () => {
    try {
      setRefreshLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/results/create-sample-users`
      );

      if (response.data.success) {
        message.success("Sample userlar yaratildi!");
        await loadDebugInfo();
        await loadLeaderboardData();
      } else {
        message.info(response.data.message);
      }
    } catch (error) {
      console.error("Sample userlar yaratishda xato:", error);
      message.error("Sample userlar yaratishda xato yuz berdi");
    } finally {
      setRefreshLoading(false);
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      console.log("Leaderboard ma'lumotlarini yuklash boshlandi...");

      if (selectedGame === "overall") {
        console.log("Global leaderboard so'rayapti...");
        const response = await axios.get(
          `${API_BASE_URL}/results/leaderboard/global?limit=100`
        );

        console.log("API response:", response.data);

        let processedData = [];
        if (response.data.success && response.data.data?.length > 0) {
          processedData = response.data.data.map((userData) => ({
            id: userData._id,
            rank: 0, // Temporary rank, will be reassigned
            name: userData.name || "Noma'lum",
            avatar: userData.avatar,
            totalScore: userData.totalScore || 0,
            level: userData.level || 1,
            gamesPlayed: userData.gamesPlayed || 0,
            rankingScore: userData.rankingScore || 0,
            averageScore: userData.averageScore || 0,
            streak: userData.streak || 0,
            winRate: Math.min(
              Math.round(
                (userData.totalScore || 0) /
                  Math.max(userData.gamesPlayed || 1, 1) /
                  15
              ),
              100
            ),
            isCurrentUser: userData._id === user?.id,
          }));
        } else if (debugInfo?.sampleUsers?.length > 0) {
          // Use debugInfo.sampleUsers if API response is empty
          console.log(
            "Using sampleUsers from debugInfo:",
            debugInfo.sampleUsers
          );
          processedData = debugInfo.sampleUsers.map((userData) => ({
            id: userData._id,
            rank: 0, // Temporary rank
            name: userData.name || "Noma'lum",
            avatar: userData.avatar,
            totalScore: userData.totalScore || 0,
            level: userData.level || 1,
            gamesPlayed: userData.gamesPlayed || 0,
            rankingScore: userData.totalScore || 0, // Use totalScore as rankingScore
            averageScore: userData.gamesPlayed
              ? Math.round(userData.totalScore / userData.gamesPlayed)
              : 0,
            streak: userData.streak || 0,
            winRate: Math.min(
              Math.round(
                (userData.totalScore || 0) /
                  Math.max(userData.gamesPlayed || 1, 1) /
                  15
              ),
              100
            ),
            isCurrentUser: userData._id === user?.id,
          }));
        }

        // Sort by rankingScore first, then totalScore
        processedData.sort((a, b) => {
          if (b.rankingScore !== a.rankingScore) {
            return b.rankingScore - a.rankingScore;
          }
          return b.totalScore - a.totalScore;
        });

        // Assign ranks based on sorted order
        processedData = processedData.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

        console.log("Processed data:", processedData);
        setLeaderboardData((prev) => ({ ...prev, overall: processedData }));
      } else {
        const response = await axios.get(
          `${API_BASE_URL}/results/leaderboard/${selectedGame}?limit=100`
        );

        if (response.data.success) {
          let gameData = response.data.data.map((item) => ({
            id: item.userId || item._id,
            rank: 0, // Temporary rank
            name: item.user?.name || "Unknown",
            avatar: item.user?.avatar,
            totalScore: item.bestScore || 0,
            level: item.user?.level || 1,
            gamesPlayed: item.totalGames || 0,
            rankingScore: item.gameRankingScore || 0,
            winRate: Math.min(
              Math.round(
                (item.bestScore || 0) / Math.max(item.totalGames || 1, 1) / 10
              ),
              100
            ),
            avgScore: Math.round(item.avgScore || 0),
            streak: Math.floor(Math.random() * 20 + 1),
            isCurrentUser:
              item.userId === user?.id || item.user?._id === user?.id,
            bestLevel: item.bestLevel || 1,
          }));

          // Sort game-specific data by rankingScore first, then totalScore
          gameData.sort((a, b) => {
            if (b.rankingScore !== a.rankingScore) {
              return b.rankingScore - a.rankingScore;
            }
            return b.totalScore - a.totalScore;
          });

          // Assign ranks based on sorted order
          gameData = gameData.map((user, index) => ({
            ...user,
            rank: index + 1,
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
      console.error("Leaderboard yuklashda xato:", error);
      let errorMessage = "Ma'lumot yuklashda xato";
      if (error.response) {
        errorMessage = `Server xatosi: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Serverga ulanib bo'lmadi";
      }

      message.error(errorMessage);

      // Fallback to debugInfo.sampleUsers on error
      if (debugInfo?.sampleUsers?.length > 0) {
        console.log(
          "Using sampleUsers from debugInfo on error:",
          debugInfo.sampleUsers
        );
        let processedData = debugInfo.sampleUsers.map((userData) => ({
          id: userData._id,
          rank: 0, // Temporary rank
          name: userData.name || "Noma'lum",
          avatar: userData.avatar,
          totalScore: userData.totalScore || 0,
          level: userData.level || 1,
          gamesPlayed: userData.gamesPlayed || 0,
          rankingScore: userData.totalScore || 0,
          averageScore: userData.gamesPlayed
            ? Math.round(userData.totalScore / userData.gamesPlayed)
            : 0,
          streak: userData.streak || 0,
          winRate: Math.min(
            Math.round(
              (userData.totalScore || 0) /
                Math.max(userData.gamesPlayed || 1, 1) /
                15
            ),
            100
          ),
          isCurrentUser: userData._id === user?.id,
        }));

        // Sort by rankingScore first, then totalScore
        processedData.sort((a, b) => {
          if (b.rankingScore !== a.rankingScore) {
            return b.rankingScore - a.rankingScore;
          }
          return b.totalScore - a.totalScore;
        });

        // Assign ranks based on sorted order
        processedData = processedData.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

        setLeaderboardData((prev) => ({ ...prev, overall: processedData }));
      } else {
        setLeaderboardData((prev) => ({ ...prev, overall: [] }));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      if (!token) {
        console.log("Token mavjud emas");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/results/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const data = response.data.data;
        const currentData = getCurrentData();
        const userRank = currentData.findIndex((u) => u.isCurrentUser) + 1;

        setUserStats({
          rank: userRank || data.userRank || 0,
          totalScore: data.user?.totalScore || 0,
          level: data.user?.level || 1,
          gamesPlayed: data.user?.gamesPlayed || 0,
          rankingScore: data.user?.rankingScore || 0,
          averageScore: data.user?.averageScore || 0,
          streak: data.user?.streak || 0,
        });
      }
    } catch (error) {
      console.error("User stats yuklashda xato:", error);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshLoading(true);
    await loadDebugInfo();
    await loadLeaderboardData();
    if (user && token) {
      await loadUserStats();
    }
    setRefreshLoading(false);
    message.success("Ma'lumotlar yangilandi");
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

  const getCurrentData = () => {
    if (selectedGame === "overall") {
      return leaderboardData.overall;
    }
    return leaderboardData.gameSpecific[selectedGame] || [];
  };

  const filteredData = getCurrentData().filter((user) =>
    searchTerm
      ? user.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

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
    },
    {
      title: "O'yinlar",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      width: 100,
    },
    {
      title: "Reyting bali",
      dataIndex: "rankingScore",
      key: "rankingScore",
      width: 140,
      render: (score) => (
        <span className="font-mono text-sm text-blue-600">
          {Math.round(score || 0).toLocaleString()}
        </span>
      ),
    },
  ];

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

      {/* Debug Info */}
      {debugInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <Text strong>
                  <FaUsers className="mr-2" />
                  Database ma'lumotlari
                </Text>
                <div className="text-sm text-gray-600 mt-1">
                  Jami: {debugInfo.totalUsers} | Faol: {debugInfo.activeUsers}
                </div>
              </div>
              <Space>
                {debugInfo.activeUsers === 0 && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={createSampleUsers}
                    loading={refreshLoading}
                  >
                    Test ma'lumotlari yaratish
                  </Button>
                )}
                <Button
                  size="small"
                  icon={<FaBug />}
                  onClick={() => setShowDebug(!showDebug)}
                >
                  Debug
                </Button>
              </Space>
            </div>

            {showDebug && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && getCurrentData().length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <Title level={3} className="text-gray-600 mb-4">
              Hali reyting ma'lumotlari yo'q
            </Title>
            <Text className="text-gray-500 mb-6 block">
              Reyting ko'rish uchun o'yinchilar o'yin o'ynashlari kerak
            </Text>
            {debugInfo?.activeUsers === 0 && (
              <Button
                type="primary"
                size="large"
                onClick={createSampleUsers}
                loading={refreshLoading}
              >
                Test ma'lumotlari yaratish
              </Button>
            )}
          </Card>
        </motion.div>
      )}

      {/* Top 3 va Table - faqat ma'lumot bo'lsa ko'rsatish */}
      {getCurrentData().length > 0 && (
        <>
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
                  .map((userData, index) => (
                    <Col xs={24} sm={8} key={userData.id}>
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
                          src={userData.avatar}
                          icon={<FaUser />}
                          className="mb-3 border-4 border-white"
                        />
                        <Title level={5} className="mb-2">
                          {userData.name}
                        </Title>
                        <div className="space-y-1">
                          <div className="font-bold text-lg">
                            {formatScore(userData.totalScore)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Daraja {userData.level} • {userData.gamesPlayed}{" "}
                            o'yin
                          </div>
                          <div className="text-xs text-blue-600">
                            Reyting:{" "}
                            {Math.round(
                              userData.rankingScore || 0
                            ).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  ))}
              </Row>
            </Card>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12}>
                  <Search
                    placeholder="O'yinchi qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex justify-end">
                    <Button
                      icon={<FaRulerCombined />}
                      onClick={refreshLeaderboard}
                      loading={refreshLoading}
                    >
                      Yangilash
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
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
        </>
      )}
    </div>
  );
};

export default Leaderboard;
