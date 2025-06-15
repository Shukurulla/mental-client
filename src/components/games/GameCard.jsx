import { Link } from "react-router-dom";
import { Card, Typography, Tag, Progress, Button, Space, Tooltip } from "antd";
import {
  FaBrain,
  FaTh,
  FaFont,
  FaTable,
  FaCalculator,
  FaDivide,
  FaFractionSlash,
  FaPercentage,
  FaBookOpen,
  FaEyeSlash,
  FaPlay,
  FaStar,
  FaTrophy,
  FaClock,
  FaFire,
} from "react-icons/fa";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

// Game icons mapping
const gameIcons = {
  numberMemory: FaBrain,
  tileMemory: FaTh,
  alphaNumMemory: FaFont,
  schulteTable: FaTable,
  doubleSchulte: FaTable,
  mathSystems: FaCalculator,
  gcdLcm: FaDivide,
  fractions: FaFractionSlash,
  percentages: FaPercentage,
  readingSpeed: FaBookOpen,
  hideAndSeek: FaEyeSlash,
};

// Game colors
const gameColors = {
  numberMemory: { primary: "blue", gradient: "from-blue-400 to-blue-600" },
  tileMemory: { primary: "green", gradient: "from-green-400 to-green-600" },
  alphaNumMemory: {
    primary: "purple",
    gradient: "from-purple-400 to-purple-600",
  },
  schulteTable: {
    primary: "orange",
    gradient: "from-orange-400 to-orange-600",
  },
  doubleSchulte: { primary: "red", gradient: "from-red-400 to-red-600" },
  mathSystems: { primary: "cyan", gradient: "from-cyan-400 to-cyan-600" },
  gcdLcm: { primary: "pink", gradient: "from-pink-400 to-pink-600" },
  fractions: { primary: "yellow", gradient: "from-yellow-400 to-yellow-600" },
  percentages: { primary: "lime", gradient: "from-lime-400 to-lime-600" },
  readingSpeed: {
    primary: "indigo",
    gradient: "from-indigo-400 to-indigo-600",
  },
  hideAndSeek: { primary: "gray", gradient: "from-gray-400 to-gray-600" },
};

const GameCard = ({ game, userStats, onPlay, delay = 0 }) => {
  const IconComponent = gameIcons[game.id] || FaBrain;
  const colors = gameColors[game.id] || gameColors.numberMemory;
  const stats = userStats?.gameStats?.[game.id];

  const bestScore = stats?.bestScore || 0;
  const gamesPlayed = stats?.gamesPlayed || 0;
  const averageScore = stats?.averageScore || 0;
  const lastPlayed = stats?.lastPlayed;

  // Calculate progress percentage
  const maxPossibleScore = game.maxLevel * game.scoreMultiplier * 100;
  const progressPercent = Math.min(
    (averageScore / maxPossibleScore) * 100,
    100
  );

  // Determine difficulty level
  const getDifficultyLevel = () => {
    if (game.maxLevel <= 5) return { level: "Oson", color: "green" };
    if (game.maxLevel <= 15) return { level: "O'rta", color: "orange" };
    return { level: "Qiyin", color: "red" };
  };

  const difficulty = getDifficultyLevel();

  // Format last played date
  const formatLastPlayed = (date) => {
    if (!date) return null;
    const now = new Date();
    const played = new Date(date);
    const diffTime = Math.abs(now - played);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Bugun";
    if (diffDays === 2) return "Kecha";
    if (diffDays <= 7) return `${diffDays} kun oldin`;
    return played.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card
        className="h-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
        bodyStyle={{ padding: "24px" }}
        hoverable
      >
        <div className="flex flex-col h-full">
          {/* Game Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
              >
                <IconComponent className="text-white text-xl" />
              </div>
              <div>
                <Title level={4} className="mb-0 text-gray-800 line-clamp-1">
                  {game.name}
                </Title>
                <div className="flex items-center space-x-2 mt-1">
                  <Tag color={difficulty.color} size="small">
                    {difficulty.level}
                  </Tag>
                  <Tag color={colors.primary} size="small">
                    Daraja {game.maxLevel}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Best Score Badge */}
            {gamesPlayed > 0 && (
              <div className="text-right">
                <Tooltip title="Eng yaxshi natija">
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <FaTrophy className="text-xs" />
                    <Text className="text-xs font-bold">{bestScore}</Text>
                  </div>
                </Tooltip>
                <Text className="text-xs text-gray-500">
                  {gamesPlayed} marta
                </Text>
              </div>
            )}
          </div>

          {/* Game Description */}
          <Text className="text-gray-600 mb-4 flex-1 line-clamp-2">
            {game.description}
          </Text>

          {/* Stats Section */}
          {gamesPlayed > 0 ? (
            <div className="mb-4 space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-xs text-gray-500">Progress</Text>
                  <Text className="text-xs text-gray-500">
                    O'rtacha: {averageScore.toFixed(1)}
                  </Text>
                </div>
                <Progress
                  percent={progressPercent}
                  strokeColor={{
                    "0%":
                      colors.primary === "blue"
                        ? "#3b82f6"
                        : `var(--ant-${colors.primary}-6)`,
                    "100%": "#52c41a",
                  }}
                  size="small"
                  showInfo={false}
                  className="mb-2"
                />
              </div>

              {/* Additional Stats */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1 text-gray-500">
                  <FaClock className="text-xs" />
                  <Text className="text-xs text-gray-500">
                    {formatLastPlayed(lastPlayed) || "Hech qachon"}
                  </Text>
                </div>
                {averageScore > bestScore * 0.8 && (
                  <div className="flex items-center space-x-1 text-orange-500">
                    <FaFire className="text-xs" />
                    <Text className="text-xs text-orange-500">Hot</Text>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-sm text-gray-500 text-center">
                🎮 Hali o'ynalmagan
              </Text>
              <Text className="text-xs text-gray-400 text-center block mt-1">
                Birinchi o'yiningizni boshlang!
              </Text>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              type="primary"
              block
              icon={<FaPlay />}
              onClick={() => onPlay(game.id)}
              className={`bg-gradient-to-r ${colors.gradient} border-none h-10 font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
              size="large"
            >
              O'ynash
            </Button>

            {/* Secondary Actions */}
            {gamesPlayed > 0 && (
              <div className="flex space-x-2">
                <Link to={`/stats/${game.id}`} className="flex-1">
                  <Button size="small" block className="text-xs">
                    📊 Statistika
                  </Button>
                </Link>
                <Link to={`/leaderboard?game=${game.id}`} className="flex-1">
                  <Button size="small" block className="text-xs">
                    🏆 Reyting
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Game Highlights */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Max ball: {game.scoreMultiplier * game.maxLevel}</span>
              <span>Kategori: Aqli o'yin</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default GameCard;
