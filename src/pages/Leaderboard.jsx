import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Table,
  Avatar,
  Tag,
  Select,
  Button,
  message,
  Alert,
} from "antd";
import { FaTrophy, FaUser, FaCrown, FaRebel } from "react-icons/fa";
import { useAuthStore } from "../stores/authStore";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedGame, setSelectedGame] = useState("overall");
  const [dataCheck, setDataCheck] = useState(null);

  const gameOptions = [{ value: "overall", label: "🏆 Umumiy reyting" }];

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (dataCheck) {
      processLeaderboardData();
    }
  }, [selectedGame, dataCheck]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log("Loading all data...");

      // Faqat check-data API dan ma'lumot olamiz
      const response = await axios.get(`${API_BASE_URL}/results/check-data`);
      console.log("Data response:", response.data);

      if (response.data.success) {
        setDataCheck(response.data.data);
        console.log("Data loaded successfully:", response.data.data);
      } else {
        message.error("Ma'lumotlarni yuklashda xato");
      }
    } catch (error) {
      console.error("Load error:", error);
      message.error("Ma'lumotlarni yuklashda xato: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processLeaderboardData = () => {
    if (!dataCheck) return;

    console.log(`Processing data for ${selectedGame}...`);

    if (selectedGame === "overall") {
      // Global reyting uchun topUsers dan foydalanish
      const globalData = dataCheck.topUsers.map((userData, index) => ({
        key: userData._id,
        _id: userData._id,
        id: userData._id,
        rank: index + 1,
        name: userData.name || `User-${index + 1}`,
        avatar: null,
        level: 1, // Default level
        totalScore: userData.totalScore || 0,
        gamesPlayed: userData.gamesPlayed || 0,
        averageScore:
          userData.gamesPlayed > 0
            ? Math.round(userData.totalScore / userData.gamesPlayed)
            : 0,
        isCurrentUser: userData._id === user?.id,
      }));

      console.log(`Global leaderboard: ${globalData.length} users`);
      setLeaderboardData(globalData);
    } else {
      // Game-specific leaderboard uchun API chaqirish
      loadGameSpecificData();
    }
  };

  const loadGameSpecificData = async () => {
    try {
      console.log(`Loading ${selectedGame} specific data...`);

      const endpoint = `${API_BASE_URL}/results/leaderboard/${selectedGame}`;
      const response = await axios.get(endpoint);

      if (response.data.success) {
        const gameData = response.data.data || [];
        const processedGameData = gameData.map((userData) => ({
          ...userData,
          isCurrentUser: userData._id === user?.id || userData.id === user?.id,
        }));

        console.log(`Game ${selectedGame}: ${processedGameData.length} users`);
        setLeaderboardData(processedGameData);
      } else {
        console.log(`No data for ${selectedGame}`);
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error(`Error loading ${selectedGame}:`, error);
      setLeaderboardData([]);
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
                className={
                  record.isCurrentUser ? "text-blue-600 font-bold" : ""
                }
              >
                {name}
              </span>
              {record.isCurrentUser && <Tag color="blue">Siz</Tag>}
              {record.rank === 1 && <FaCrown className="text-yellow-500" />}
            </div>
            <div className="text-xs text-gray-500">Daraja {record.level}</div>
          </div>
        </div>
      ),
    },
    {
      title: selectedGame === "overall" ? "Umumiy ball" : "Eng yaxshi ball",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => (
        <span className="font-mono font-bold">
          {score?.toLocaleString() || 0}
        </span>
      ),
      sorter: (a, b) => (a.totalScore || 0) - (b.totalScore || 0),
    },
    {
      title: "O'yinlar",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      width: 100,
      render: (count) => count || 0,
    },
  ];

  if (selectedGame !== "overall") {
    columns.push({
      title: "O'rtacha",
      dataIndex: "averageScore",
      key: "averageScore",
      width: 100,
      render: (score) => Math.round(score || 0),
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <Title level={1} className="text-gray-800 mb-2">
          🏆 Reyting
        </Title>
        <Text className="text-lg text-gray-600">
          Eng yaxshi o'yinchilar reytingi
        </Text>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex justify-between items-center">
          <Select
            value={selectedGame}
            onChange={setSelectedGame}
            style={{ width: 300 }}
          >
            {gameOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Button icon={<FaRebel />} onClick={loadAllData} loading={loading}>
            Yangilash
          </Button>
        </div>
      </Card>

      {/* Top 3 Users - faqat global uchun */}
      {selectedGame === "overall" && leaderboardData.length >= 3 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <Title level={4} className="text-center mb-6">
            🏆 TOP 3 O'yinchilar
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboardData.slice(0, 3).map((userData, index) => (
              <div
                key={userData.id}
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
                  icon={<FaUser />}
                  className="mb-3 border-4 border-white"
                />
                <Title level={5} className="mb-2">
                  {userData.name}
                </Title>
                <div className="space-y-1">
                  <div className="font-bold text-lg">
                    {userData.totalScore?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {userData.gamesPlayed || 0} o'yin o'ynagan
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <Title level={4} className="mb-4">
          {selectedGame === "overall"
            ? "Umumiy Reyting"
            : `${selectedGame} Reytingi`}
          {leaderboardData.length > 0 &&
            ` (${leaderboardData.length} o'yinchi)`}
        </Title>

        {loading ? (
          <div className="text-center py-8">
            <Text>Yuklanmoqda...</Text>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <Title level={3} className="text-gray-600 mb-4">
              Ma'lumotlar yo'q
            </Title>
            <Text className="text-gray-500 mb-6">
              {selectedGame === "overall"
                ? "Hali hech kim o'ynagan emas"
                : `${selectedGame} uchun natijalar yo'q`}
            </Text>
            <Button type="primary" onClick={loadAllData}>
              Qayta yuklash
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={leaderboardData}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Jami ${total} o'yinchi`,
            }}
            rowClassName={(record) =>
              record.isCurrentUser ? "bg-blue-50" : ""
            }
          />
        )}
      </Card>
    </div>
  );
};

export default Leaderboard;
