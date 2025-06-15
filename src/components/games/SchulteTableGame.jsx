import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Progress,
  Space,
  Typography,
  Statistic,
  Modal,
} from "antd";
import { FaPlay, FaStop, FaRedo, FaCog, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const SchulteTableGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, playing, finished
  const [level, setLevel] = useState(1);
  const [numbers, setNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    bestTime: 0,
    averageTime: 0,
  });
  const [settings, setSettings] = useState({
    gridSize: 5,
    showNumbers: true,
    timeLimit: 120, // seconds
  });
  const [showSettings, setShowSettings] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === "playing" && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  // Generate shuffled numbers
  const generateNumbers = useCallback(() => {
    const total = settings.gridSize * settings.gridSize;
    const nums = Array.from({ length: total }, (_, i) => i + 1);

    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    return nums;
  }, [settings.gridSize]);

  // Start new game
  const startGame = async () => {
    try {
      const newNumbers = generateNumbers();
      setNumbers(newNumbers);
      setGameState("playing");
      setCurrentNumber(1);
      setStartTime(Date.now());
      setEndTime(null);
      setElapsedTime(0);

      toast.success("O'yin boshlandi! 1-raqamni toping");
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Handle number click
  const handleNumberClick = (clickedNumber) => {
    if (gameState !== "playing") return;

    if (clickedNumber === currentNumber) {
      // Correct number clicked
      const total = settings.gridSize * settings.gridSize;

      if (currentNumber === total) {
        // Game completed
        finishGame();
      } else {
        setCurrentNumber((prev) => prev + 1);
        toast.success(`To'g'ri! ${currentNumber + 1}-raqamni toping`);
      }
    } else {
      // Wrong number clicked
      toast.error(`Noto'g'ri! ${currentNumber}-raqamni toping`);
    }
  };

  // Finish game
  const finishGame = async () => {
    const gameEndTime = Date.now();
    setEndTime(gameEndTime);
    setGameState("finished");

    const totalTime = Math.floor((gameEndTime - startTime) / 1000);
    const points = Math.max(1000 - totalTime * 10, 100); // More points for faster completion
    setScore(points);

    try {
      await gamesAPI.submitResult("schulteTable", {
        score: points,
        level,
        duration: totalTime,
        correctAnswers: settings.gridSize * settings.gridSize,
        totalQuestions: settings.gridSize * settings.gridSize,
        settings: {
          ...settings,
          completionTime: totalTime,
        },
      });

      updateUserStats({
        totalScore: points,
        gamesPlayed: 1,
      });

      // Update local stats
      setGameStats((prev) => ({
        totalGames: prev.totalGames + 1,
        bestTime:
          prev.bestTime === 0 ? totalTime : Math.min(prev.bestTime, totalTime),
        averageTime:
          (prev.averageTime * prev.totalGames + totalTime) /
          (prev.totalGames + 1),
      }));

      toast.success(`O'yin tugadi! Vaqt: ${totalTime}s, Ball: ${points}`);
    } catch (error) {
      toast.error("Natijani saqlashda xato");
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState("idle");
    setLevel(1);
    setScore(0);
    setNumbers([]);
    setCurrentNumber(1);
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render grid
  const renderGrid = () => {
    return numbers.map((number, index) => {
      const isNext = number === currentNumber;
      const isCompleted = number < currentNumber;

      return (
        <motion.div
          key={`${index}-${number}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
          className={`
            aspect-square border-2 rounded-lg cursor-pointer transition-all duration-200 
            flex items-center justify-center font-bold text-lg select-none
            ${
              isNext
                ? "bg-blue-500 border-blue-600 text-white shadow-lg ring-4 ring-blue-200"
                : ""
            }
            ${isCompleted ? "bg-green-100 border-green-500 text-green-700" : ""}
            ${
              !isNext && !isCompleted
                ? "bg-white border-gray-300 hover:bg-gray-50 text-gray-800"
                : ""
            }
          `}
          onClick={() => handleNumberClick(number)}
        >
          {settings.showNumbers ? number : ""}
          {isCompleted && "✓"}
        </motion.div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          📊 Schulte Jadvali
        </Title>
        <Text className="text-gray-600 text-lg">
          1 dan {settings.gridSize * settings.gridSize} gacha raqamlarni tartib
          bo'yicha toping
        </Text>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic
            title="Joriy raqam"
            value={currentNumber}
            suffix={`/ ${settings.gridSize * settings.gridSize}`}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Vaqt"
            value={formatTime(elapsedTime)}
            prefix={<FaClock />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Eng yaxshi vaqt"
            value={formatTime(gameStats.bestTime)}
          />
        </Card>
        <Card className="text-center">
          <Statistic title="O'yinlar soni" value={gameStats.totalGames} />
        </Card>
      </div>

      {/* Game Area */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-game min-h-[500px]">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">📊</div>
              <Title level={3}>Schulte jadvali o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Raqamlarni 1 dan boshlab tartib bo'yicha toping. Bu o'yin diqqat
                va periferik ko'rishni rivojlantiradi.
              </Text>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaPlay />}
                  onClick={startGame}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-2 h-auto"
                >
                  Boshlash
                </Button>
                <Button
                  icon={<FaCog />}
                  onClick={() => setShowSettings(true)}
                  size="large"
                  className="px-8 py-2 h-auto"
                >
                  Sozlamalar
                </Button>
              </Space>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="mb-0">
                  {currentNumber}-raqamni toping
                </Title>
                <div className="text-2xl font-mono">
                  {formatTime(elapsedTime)}
                </div>
              </div>

              <div
                className="grid gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${Math.min(settings.gridSize * 70, 400)}px`,
                }}
              >
                {renderGrid()}
              </div>

              <Progress
                percent={
                  ((currentNumber - 1) /
                    (settings.gridSize * settings.gridSize)) *
                  100
                }
                strokeColor="#22c55e"
                className="max-w-md mx-auto"
              />

              <div className="flex justify-center space-x-4">
                <Button icon={<FaStop />} onClick={resetGame} className="px-6">
                  To'xtatish
                </Button>
              </div>
            </motion.div>
          )}

          {/* Finished State */}
          {gameState === "finished" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">🎉</div>
              <Title level={3}>Tabriklaymiz!</Title>

              <div className="grid grid-cols-2 gap-4 my-6 max-w-md mx-auto">
                <Card>
                  <Statistic
                    title="Vaqt"
                    value={formatTime(Math.floor((endTime - startTime) / 1000))}
                  />
                </Card>
                <Card>
                  <Statistic title="Ball" value={score} />
                </Card>
                <Card>
                  <Statistic
                    title="Eng yaxshi vaqt"
                    value={formatTime(gameStats.bestTime)}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="O'rtacha vaqt"
                    value={formatTime(Math.floor(gameStats.averageTime))}
                  />
                </Card>
              </div>

              <Space size="large">
                <Button
                  type="primary"
                  icon={<FaRedo />}
                  onClick={resetGame}
                  size="large"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-2 h-auto"
                >
                  Qayta o'ynash
                </Button>
                <Button
                  icon={<FaPlay />}
                  onClick={startGame}
                  size="large"
                  className="px-8 py-2 h-auto"
                >
                  Yangi o'yin
                </Button>
              </Space>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="Schulte jadvali sozlamalari"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        className="settings-modal"
      >
        <div className="space-y-4">
          <div>
            <Text strong>Jadval o'lchami:</Text>
            <div className="mt-2 space-x-2">
              {[3, 4, 5, 6].map((size) => (
                <Button
                  key={size}
                  type={settings.gridSize === size ? "primary" : "default"}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, gridSize: size }))
                  }
                >
                  {size}x{size}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Text strong>Raqamlarni ko'rsatish:</Text>
            <div className="mt-2 space-x-2">
              <Button
                type={settings.showNumbers ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, showNumbers: true }))
                }
              >
                Ko'rsatish
              </Button>
              <Button
                type={!settings.showNumbers ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, showNumbers: false }))
                }
              >
                Yashirish
              </Button>
            </div>
          </div>

          <div>
            <Text strong>Vaqt chegarasi (soniya):</Text>
            <div className="mt-2">
              <input
                type="range"
                min="30"
                max="300"
                step="30"
                value={settings.timeLimit}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    timeLimit: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <Text className="text-sm text-gray-500">
                {settings.timeLimit} soniya
              </Text>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="primary" onClick={() => setShowSettings(false)}>
              Saqlash
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SchulteTableGame;
