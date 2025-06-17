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
  Tooltip,
  message,
} from "antd";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaFire,
  FaUser,
  FaCrown,
  FaAward,
  FaRulerCombined,
  FaInfoCircle,
  FaRebel,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import RankingExplanation from "../components/common/RankingExplanation";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Leaderboard = () => {
  const { user, token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
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
  const [showRankingExplanation, setShowRankingExplanation] = useState(false);

  const gameOptions = [
    { value: "overall", label: "🏆 Umumiy reyting" },
    { value: "numberMemory", label: "🧠 Raqam xotirasi" },
    { value: "tileMemory", label: "🎯 Plitkalar" },
    { value: "schulteTable", label: "📊 Schulte jadvali" },
    { value: "mathSystems", label: "🧮 Matematik amallar" },
    { value: "flashAnzan", label: "⚡ Flash Anzan" },
    { value: "flashCards", label: "🃏 Flash Cards" },
  ];

  useEffect(() => {
    loadLeaderboardData();
    if (user && token) {
      loadUserStats();
    }
  }, [selectedGame, user, token]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      console.log(`Loading leaderboard for ${selectedGame}...`);

      let endpoint;
      if (selectedGame === "overall") {
        endpoint = `${API_BASE_URL}/results/leaderboard/global?limit=100`;
      } else {
        endpoint = `${API_BASE_URL}/results/leaderboard/${selectedGame}?limit=100`;
      }

      const response = await axios.get(endpoint);

      if (response.data.success) {
        const processedData = response.data.data.map((userData, index) => ({
          id: userData._id || userData.id,
          rank: index + 1,
          name: userData.name || userData.user?.name || "Noma'lum",
          avatar: userData.avatar || userData.user?.avatar,
          totalScore: userData.totalScore || userData.bestScore || 0,
          level: userData.level || userData.user?.level || 1,
          gamesPlayed: userData.gamesPlayed || 0,
          rankingScore: userData.rankingScore || userData.gameRankingScore || 0,
          averageScore: userData.averageScore || userData.avgScore || 0,
          streak: userData.streak || 0,
          winRate: userData.winRate || 0,
          isCurrentUser: (userData._id || userData.id) === user?.id,
          bestLevel: userData.bestLevel || userData.level || 1,
        }));

        console.log(`Loaded ${processedData.length} users for ${selectedGame}`);
        setLeaderboardData(processedData);
      } else {
        console.error("Leaderboard response not successful:", response.data);
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Leaderboard loading error:", error);
      message.error("Leaderboard ma'lumotlarini yuklashda xato");
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/results/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const data = response.data.data;
        const userRank = data.userRank || 0;

        setUserStats({
          rank: userRank,
          totalScore: data.user?.totalScore || 0,
          level: data.user?.level || 1,
          gamesPlayed: data.user?.gamesPlayed || 0,
          rankingScore: data.user?.rankingScore || 0,
          averageScore: data.user?.averageScore || 0,
          streak: data.user?.streak || 0,
        });
      }
    } catch (error) {
      console.error("User stats loading error:", error);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshLoading(true);
    await loadLeaderboardData();
    if (user && token) {
      await loadUserStats();
    }
    setRefreshLoading(false);
    message.success("Ma'lumotlar yangilandi");
  };

  const updateRankingScores = async () => {
    try {
      setRefreshLoading(true);
      await axios.post(
        `${API_BASE_URL}/results/update-ranking-scores`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Reyting ballari yangilandi");
      await refreshLeaderboard();
    } catch (error) {
      console.error("Update ranking scores error:", error);
      message.error("Reyting ballarini yangilashda xato");
    } finally {
      setRefreshLoading(false);
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

  const formatScore = (score) => {
    if (!score) return "0";
    return score.toLocaleString();
  };

  const filteredData = leaderboardData.filter((userData) =>
    searchTerm
      ? userData.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      title: selectedGame === "overall" ? "Umumiy ball" : "Eng yaxshi ball",
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
      sorter: (a, b) => a.gamesPlayed - b.gamesPlayed,
    },
    {
      title: (
        <div className="flex items-center space-x-1">
          <span>Reyting bali</span>
          <Tooltip title="Reyting formulasi haqida ma'lumot">
            <Button
              type="link"
              size="small"
              icon={<FaInfoCircle />}
              onClick={() => setShowRankingExplanation(true)}
            />
          </Tooltip>
        </div>
      ),
      dataIndex: "rankingScore",
      key: "rankingScore",
      width: 140,
      render: (score) => (
        <span className="font-mono text-sm text-blue-600">
          {Math.round(score || 0).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.rankingScore - b.rankingScore,
    },
  ];

  if (selectedGame !== "overall") {
    columns.push({
      title: "O'rtacha ball",
      dataIndex: "averageScore",
      key: "averageScore",
      width: 120,
      render: (score) => <span>{Math.round(score || 0)}</span>,
      sorter: (a, b) => a.averageScore - b.averageScore,
    });
  }

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

      {/* User Stats */}
      {user && userStats.gamesPlayed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <Title level={4} className="text-center mb-4">
              📊 Sizning statistikangiz
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="O'riningiz"
                  value={userStats.rank}
                  prefix={<FaTrophy className="text-yellow-500" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Umumiy ball"
                  value={userStats.totalScore}
                  prefix={<FaStar className="text-yellow-500" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Daraja"
                  value={userStats.level}
                  prefix={<FaAward className="text-orange-500" />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Reyting bali"
                  value={Math.round(userStats.rankingScore)}
                  prefix={<FaMedal className="text-purple-500" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {filteredData.length >= 3 && (
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
              {filteredData.slice(0, 3).map((userData, index) => (
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
                        Daraja {userData.level} • {userData.gamesPlayed} o'yin
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
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Select
                value={selectedGame}
                onChange={setSelectedGame}
                style={{ width: "100%" }}
                placeholder="O'yinni tanlang"
              >
                {gameOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Search
                placeholder="O'yinchi qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <div className="flex justify-end space-x-2">
                <Button
                  icon={<FaRebel />}
                  onClick={refreshLeaderboard}
                  loading={refreshLoading}
                >
                  Yangilash
                </Button>
                {user?.role === "admin" && (
                  <Button
                    icon={<FaRulerCombined />}
                    onClick={updateRankingScores}
                    loading={refreshLoading}
                    type="dashed"
                  >
                    Reytingni qayta hisoblash
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <Title level={3} className="text-gray-600 mb-4">
              Reyting ma'lumotlari topilmadi
            </Title>
            <Text className="text-gray-500 mb-6 block">
              {searchTerm
                ? "Qidiruv bo'yicha natija topilmadi"
                : "Bu o'yin uchun hali reyting ma'lumotlari yo'q"}
            </Text>
            <Button type="primary" onClick={refreshLeaderboard}>
              Qayta yuklash
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      {filteredData.length > 0 && (
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
      )}

      {/* Ranking Explanation Modal */}
      {showRankingExplanation && (
        <RankingExplanation
          gameType={selectedGame}
          userStats={userStats}
          onClose={() => setShowRankingExplanation(false)}
        />
      )}
    </div>
  );
};

export default Leaderboard;
