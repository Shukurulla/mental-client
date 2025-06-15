import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Button,
  Space,
  Input,
  Select,
} from "antd";
import {
  FaBrain,
  FaTh,
  FaFont,
  FaTable,
  FaCalculator,
  FaDivide,
  FaFistRaised,
  FaPercentage,
  FaBookOpen,
  FaEyeSlash,
  FaPlay,
  FaStar,
  FaSearch,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { gamesAPI, resultsAPI } from "../utils/api";
import { useAuthStore } from "../stores/authStore";
import LoadingSpinner from "../components/common/LoadingSpinner";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Game icons mapping
const gameIcons = {
  numberMemory: FaBrain,
  tileMemory: FaTh,
  alphaNumMemory: FaFont,
  schulteTable: FaTable,
  doubleSchulte: FaTable,
  mathSystems: FaCalculator,
  gcdLcm: FaDivide,
  fractions: FaFistRaised,
  percentages: FaPercentage,
  readingSpeed: FaBookOpen,
  hideAndSeek: FaEyeSlash,
};

// Game colors
const gameColors = {
  numberMemory: "blue",
  tileMemory: "green",
  alphaNumMemory: "purple",
  schulteTable: "orange",
  doubleSchulte: "red",
  mathSystems: "cyan",
  gcdLcm: "magenta",
  fractions: "gold",
  percentages: "lime",
  readingSpeed: "geekblue",
  hideAndSeek: "volcano",
};

const GameCard = ({ game, userStats, onPlay }) => {
  const IconComponent = gameIcons[game.id] || FaBrain;
  const stats = userStats?.gameStats?.[game.id];
  const bestScore = stats?.bestScore || 0;
  const gamesPlayed = stats?.gamesPlayed || 0;
  const averageScore = stats?.averageScore || 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="h-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="flex flex-col h-full">
          {/* Game Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${
                  gameColors[game.id]
                }-400 to-${
                  gameColors[game.id]
                }-600 flex items-center justify-center`}
              >
                <IconComponent className="text-white text-xl" />
              </div>
              <div>
                <Title level={4} className="mb-0 text-gray-800">
                  {game.name}
                </Title>
                <Tag color={gameColors[game.id]} className="mt-1">
                  Daraja {game.maxLevel}
                </Tag>
              </div>
            </div>
            {gamesPlayed > 0 && (
              <div className="text-right">
                <div className="flex items-center space-x-1 text-yellow-500">
                  <FaStar className="text-xs" />
                  <Text className="text-xs font-medium">{bestScore}</Text>
                </div>
                <Text className="text-xs text-gray-500">
                  {gamesPlayed} marta
                </Text>
              </div>
            )}
          </div>

          {/* Game Description */}
          <Text className="text-gray-600 mb-4 flex-1">{game.description}</Text>

          {/* Progress */}
          {gamesPlayed > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Text className="text-xs text-gray-500">Progress</Text>
                <Text className="text-xs text-gray-500">
                  O'rtacha: {averageScore.toFixed(1)}
                </Text>
              </div>
              <Progress
                percent={Math.min(
                  (averageScore / (game.maxLevel * game.scoreMultiplier)) * 100,
                  100
                )}
                strokeColor={{
                  "0%": gameColors[game.id],
                  "100%": "#52c41a",
                }}
                size="small"
                showInfo={false}
              />
            </div>
          )}

          {/* Play Button */}
          <Button
            type="primary"
            block
            icon={<FaPlay />}
            onClick={() => onPlay(game.id)}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none h-10 font-medium"
          >
            O'ynash
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const Games = () => {
  const { user } = useAuthStore();
  const [games, setGames] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesResponse, statsResponse] = await Promise.all([
        gamesAPI.getGames(),
        resultsAPI.getUserStats(),
      ]);

      setGames(gamesResponse.data.games);
      setUserStats(statsResponse.data.user);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (gameId) => {
    // Navigate to game
    window.location.href = `/games/${gameId}`;
  };

  // Filter and sort games
  const filteredGames = games
    .filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterBy === "all") return matchesSearch;
      if (filterBy === "played") {
        const stats = userStats?.gameStats?.[game.id];
        return matchesSearch && stats?.gamesPlayed > 0;
      }
      if (filterBy === "unplayed") {
        const stats = userStats?.gameStats?.[game.id];
        return matchesSearch && (!stats || stats.gamesPlayed === 0);
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "difficulty") return a.maxLevel - b.maxLevel;
      if (sortBy === "played") {
        const aStats = userStats?.gameStats?.[a.id]?.gamesPlayed || 0;
        const bStats = userStats?.gameStats?.[b.id]?.gamesPlayed || 0;
        return bStats - aStats;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={1} className="text-gray-800 mb-4">
            🎮 Mental Arifmetika O'yinlari
          </Title>
          <Text className="text-lg text-gray-600 max-w-2xl mx-auto block">
            Aqlingizni mashq qiling va matematik qobiliyatlaringizni
            rivojlantiring
          </Text>
        </motion.div>
      </div>

      {/* User Overview */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
            <Row gutter={24}>
              <Col xs={24} sm={8} className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {userStats.level}
                </div>
                <div className="text-gray-600">Daraja</div>
              </Col>
              <Col xs={24} sm={8} className="text-center">
                <div className="text-3xl font-bold text-secondary-600">
                  {userStats.totalScore}
                </div>
                <div className="text-gray-600">Umumiy ball</div>
              </Col>
              <Col xs={24} sm={8} className="text-center">
                <div className="text-3xl font-bold text-success-600">
                  {userStats.gamesPlayed}
                </div>
                <div className="text-gray-600">O'ynagan o'yinlar</div>
              </Col>
            </Row>
          </Card>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder="O'yinlarni qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<FaSearch className="text-gray-400" />}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: "100%" }}
                placeholder="Saralash"
              >
                <Option value="name">Nom bo'yicha</Option>
                <Option value="difficulty">Qiyinlik bo'yicha</Option>
                <Option value="played">O'ynalgan bo'yicha</Option>
              </Select>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Select
                value={filterBy}
                onChange={setFilterBy}
                style={{ width: "100%" }}
                placeholder="Filter"
              >
                <Option value="all">Barchasi</Option>
                <Option value="played">O'ynalgan</Option>
                <Option value="unplayed">O'ynalmagan</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Games Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Row gutter={[24, 24]}>
          {filteredGames.map((game, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={game.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GameCard
                  game={game}
                  userStats={userStats}
                  onPlay={handlePlay}
                />
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* No Results */}
      {filteredGames.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <Title level={3} className="text-gray-600">
            O'yinlar topilmadi
          </Title>
          <Text className="text-gray-500">
            Qidiruv shartlarini o'zgartiring yoki boshqa filtrlardan foydalaning
          </Text>
        </motion.div>
      )}
    </div>
  );
};

export default Games;
