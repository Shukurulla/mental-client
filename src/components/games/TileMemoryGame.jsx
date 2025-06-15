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
import { FaPlay, FaStop, FaRedo, FaCog } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const TileMemoryGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, showing, input, result
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [currentTile, setCurrentTile] = useState(-1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
    startTime: null,
    endTime: null,
  });
  const [settings, setSettings] = useState({
    difficulty: "medium",
    displayTime: 800,
    gridSize: 3,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate tile pattern
  const generatePattern = useCallback(
    (level) => {
      const patternSize = Math.min(2 + level, 9);
      const totalTiles = settings.gridSize * settings.gridSize;
      const pattern = [];

      while (pattern.length < patternSize) {
        const tile = Math.floor(Math.random() * totalTiles);
        if (!pattern.includes(tile)) {
          pattern.push(tile);
        }
      }

      return pattern;
    },
    [settings.gridSize]
  );

  // Start new game
  const startGame = async () => {
    try {
      const response = await gamesAPI.startGame("tileMemory", {
        level,
        settings,
      });
      const { pattern: newPattern } = response.data.gameContent;

      setPattern(newPattern);
      setGameState("showing");
      setCurrentTile(0);
      setUserPattern([]);
      setGameStats({
        correct: 0,
        total: 0,
        startTime: Date.now(),
        endTime: null,
      });

      // Show pattern
      showPattern(newPattern);
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Show pattern animation
  const showPattern = (pattern) => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentTile(pattern[index]);

      setTimeout(() => {
        setCurrentTile(-1);
      }, settings.displayTime / 2);

      index++;

      if (index >= pattern.length) {
        clearInterval(interval);
        setTimeout(() => {
          setGameState("input");
          setCurrentTile(-1);
        }, settings.displayTime);
      }
    }, settings.displayTime);
  };

  // Handle tile click
  const handleTileClick = (tileIndex) => {
    if (gameState !== "input") return;

    const newUserPattern = [...userPattern, tileIndex];
    setUserPattern(newUserPattern);

    // Check if current selection is correct
    const isCurrentCorrect = pattern[newUserPattern.length - 1] === tileIndex;

    if (!isCurrentCorrect) {
      // Wrong tile clicked
      handleWrongAnswer();
      return;
    }

    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      handleCorrectAnswer();
    }
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    const newStats = {
      ...gameStats,
      total: gameStats.total + 1,
      correct: gameStats.correct + 1,
      endTime: Date.now(),
    };

    setGameStats(newStats);

    const points = level * 15;
    setScore((prev) => prev + points);
    setLevel((prev) => prev + 1);
    toast.success(`To'g'ri! +${points} ball`);

    // Auto start next level
    setTimeout(() => {
      if (level < 15) {
        startGame();
      } else {
        endGame();
      }
    }, 1500);
  };

  // Handle wrong answer
  const handleWrongAnswer = () => {
    const newStats = {
      ...gameStats,
      total: gameStats.total + 1,
      endTime: Date.now(),
    };

    setGameStats(newStats);

    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        endGame();
        return 0;
      }
      toast.error(`Noto'g'ri! ${newLives} jon qoldi`);
      setGameState("result");
      return newLives;
    });
  };

  // End game and save result
  const endGame = async () => {
    const duration = gameStats.endTime
      ? (gameStats.endTime - gameStats.startTime) / 1000
      : 0;
    const accuracy =
      gameStats.total > 0 ? (gameStats.correct / gameStats.total) * 100 : 0;

    try {
      await gamesAPI.submitResult("tileMemory", {
        score,
        level,
        duration,
        correctAnswers: gameStats.correct,
        totalQuestions: gameStats.total,
        settings,
      });

      updateUserStats({
        totalScore: score,
        gamesPlayed: 1,
      });

      toast.success("Natija saqlandi!");
    } catch (error) {
      toast.error("Natijani saqlashda xato");
    }

    setGameState("result");
  };

  // Reset game
  const resetGame = () => {
    setGameState("idle");
    setLevel(1);
    setScore(0);
    setLives(3);
    setPattern([]);
    setUserPattern([]);
    setCurrentTile(-1);
    setGameStats({
      correct: 0,
      total: 0,
      startTime: null,
      endTime: null,
    });
  };

  // Render grid
  const renderGrid = () => {
    const totalTiles = settings.gridSize * settings.gridSize;
    const tiles = [];

    for (let i = 0; i < totalTiles; i++) {
      const isHighlighted = currentTile === i;
      const isSelected = userPattern.includes(i);
      const isInPattern = pattern.includes(i) && gameState === "result";

      tiles.push(
        <motion.div
          key={i}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            aspect-square border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center font-bold text-lg
            ${
              isHighlighted
                ? "bg-blue-500 border-blue-600 text-white shadow-lg"
                : ""
            }
            ${isSelected ? "bg-green-100 border-green-500" : ""}
            ${isInPattern ? "bg-yellow-100 border-yellow-500" : ""}
            ${
              !isHighlighted && !isSelected && !isInPattern
                ? "bg-gray-100 border-gray-300 hover:bg-gray-200"
                : ""
            }
          `}
          onClick={() => handleTileClick(i)}
        >
          {gameState === "result" && isInPattern ? "✓" : ""}
          {isSelected && gameState === "input"
            ? userPattern.indexOf(i) + 1
            : ""}
        </motion.div>
      );
    }

    return tiles;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🎯 Plitkalar
        </Title>
        <Text className="text-gray-600 text-lg">
          Yorqin bo'lgan plitkalarni eslab qoling va to'g'ri tartibda bosing
        </Text>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic title="Daraja" value={level} />
        </Card>
        <Card className="text-center">
          <Statistic title="Ball" value={score} />
        </Card>
        <Card className="text-center">
          <Statistic title="Jonlar" value={lives} prefix="❤️" />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Aniqlik"
            value={
              gameStats.total > 0
                ? (gameStats.correct / gameStats.total) * 100
                : 0
            }
            suffix="%"
            precision={1}
          />
        </Card>
      </div>

      {/* Game Area */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-game min-h-[400px]">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">🎯</div>
              <Title level={3}>Plitkalar o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6">
                Yorqin bo'lgan plitkalarni eslab qoling va keyin ularni to'g'ri
                tartibda bosing
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

          {/* Showing Pattern */}
          {gameState === "showing" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Diqqat bilan kuzating!</Title>
              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 80}px`,
                }}
              >
                {renderGrid()}
              </div>
              <Progress
                percent={
                  ((pattern.indexOf(currentTile) + 1) / pattern.length) * 100
                }
                showInfo={false}
                strokeColor="#3b82f6"
              />
              <Text className="text-gray-600">
                {pattern.indexOf(currentTile) + 1} / {pattern.length}
              </Text>
            </motion.div>
          )}

          {/* Input State */}
          {gameState === "input" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Plitkalarni bosing</Title>
              <Text className="text-gray-600 block">
                Ko'rgan plitkalarni to'g'ri tartibda bosing
              </Text>

              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 80}px`,
                }}
              >
                {renderGrid()}
              </div>

              <div className="flex justify-center items-center space-x-4">
                <Text className="text-gray-600">
                  {userPattern.length} / {pattern.length}
                </Text>
                <Progress
                  percent={(userPattern.length / pattern.length) * 100}
                  showInfo={false}
                  strokeColor="#22c55e"
                  style={{ width: "200px" }}
                />
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === "result" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">{lives > 0 ? "🎉" : "😢"}</div>
              <Title level={3}>
                {lives > 0 ? "O'yin tugadi!" : "Jonlar tugadi!"}
              </Title>

              <div className="grid grid-cols-2 gap-4 my-6">
                <Card>
                  <Statistic title="Yakuniy ball" value={score} />
                </Card>
                <Card>
                  <Statistic title="Erishgan daraja" value={level} />
                </Card>
                <Card>
                  <Statistic
                    title="To'g'ri javoblar"
                    value={gameStats.correct}
                  />
                </Card>
                <Card>
                  <Statistic
                    title="Aniqlik"
                    value={
                      gameStats.total > 0
                        ? (gameStats.correct / gameStats.total) * 100
                        : 0
                    }
                    suffix="%"
                    precision={1}
                  />
                </Card>
              </div>

              {/* Show correct pattern */}
              <div className="space-y-4">
                <Text className="text-gray-600">To'g'ri javob:</Text>
                <div
                  className="grid gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                    maxWidth: `${settings.gridSize * 60}px`,
                  }}
                >
                  {renderGrid()}
                </div>
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
                {lives > 0 && (
                  <Button
                    icon={<FaPlay />}
                    onClick={startGame}
                    size="large"
                    className="px-8 py-2 h-auto"
                  >
                    Davom etish
                  </Button>
                )}
              </Space>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="O'yin sozlamalari"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        className="settings-modal"
      >
        <div className="space-y-4">
          <div>
            <Text strong>Qiyinlik darajasi:</Text>
            <div className="mt-2 space-x-2">
              {["easy", "medium", "hard"].map((diff) => (
                <Button
                  key={diff}
                  type={settings.difficulty === diff ? "primary" : "default"}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, difficulty: diff }))
                  }
                >
                  {diff === "easy"
                    ? "Oson"
                    : diff === "medium"
                    ? "O'rta"
                    : "Qiyin"}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Text strong>Ko'rsatish vaqti (ms):</Text>
            <div className="mt-2">
              <input
                type="range"
                min="300"
                max="2000"
                step="100"
                value={settings.displayTime}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    displayTime: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <Text className="text-sm text-gray-500">
                {settings.displayTime}ms
              </Text>
            </div>
          </div>

          <div>
            <Text strong>Grid o'lchami:</Text>
            <div className="mt-2 space-x-2">
              {[3, 4, 5].map((size) => (
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

export default TileMemoryGame;
