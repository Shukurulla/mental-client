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
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaCog,
  FaEyeSlash,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const HideAndSeekGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, showing, hiding, searching, result
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState([]);
  const [hiddenNumbers, setHiddenNumbers] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [foundNumbers, setFoundNumbers] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showTime, setShowTime] = useState(3);
  const [startTime, setStartTime] = useState(null);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
    timeSpent: 0,
  });
  const [settings, setSettings] = useState({
    gridSize: 4,
    showDuration: 3000,
    hiddenCount: 6,
    difficulty: "medium",
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate game grid
  const generateGrid = useCallback(() => {
    const size = settings.gridSize;
    const totalCells = size * size;
    const numbersToHide = Math.min(
      settings.hiddenCount + level - 1,
      totalCells - 2
    );

    // Create grid with numbers
    const newGrid = Array.from({ length: totalCells }, (_, i) => ({
      id: i,
      number: i + 1,
      isHidden: false,
      isFound: false,
      position: {
        row: Math.floor(i / size),
        col: i % size,
      },
    }));

    // Randomly select numbers to hide
    const shuffled = [...newGrid].sort(() => Math.random() - 0.5);
    const toHide = shuffled.slice(0, numbersToHide);

    const hiddenNums = [];
    toHide.forEach((cell) => {
      cell.isHidden = true;
      hiddenNums.push(cell.number);
    });

    hiddenNums.sort((a, b) => a - b);
    setHiddenNumbers(hiddenNums);

    return newGrid;
  }, [level, settings.gridSize, settings.hiddenCount]);

  // Start new game
  const startGame = async () => {
    try {
      const newGrid = generateGrid();
      setGrid(newGrid);
      setGameState("showing");
      setCurrentTarget(1);
      setFoundNumbers([]);
      setScore(score);
      setShowTime(settings.showDuration / 1000);
      setStartTime(Date.now());
      setGameStats({
        correct: 0,
        total: 0,
        timeSpent: 0,
      });

      // Show numbers for a few seconds
      showNumbers(newGrid);
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Show numbers phase
  const showNumbers = (grid) => {
    let timeLeft = settings.showDuration / 1000;

    const timer = setInterval(() => {
      timeLeft -= 1;
      setShowTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        hideNumbers(grid);
      }
    }, 1000);
  };

  // Hide numbers phase
  const hideNumbers = (grid) => {
    setGameState("hiding");

    // Hide the numbers with animation
    setTimeout(() => {
      setGameState("searching");
      setCurrentTarget(hiddenNumbers[0]);
      toast.info(`${hiddenNumbers[0]} raqamini toping!`);
    }, 1000);
  };

  // Handle cell click
  const handleCellClick = (cell) => {
    if (gameState !== "searching") return;
    if (!cell.isHidden || cell.isFound) return;

    const targetIndex = hiddenNumbers.indexOf(currentTarget);

    if (cell.number === currentTarget) {
      // Correct number found
      const newFoundNumbers = [...foundNumbers, cell.number];
      setFoundNumbers(newFoundNumbers);

      const newGrid = grid.map((c) =>
        c.id === cell.id ? { ...c, isFound: true } : c
      );
      setGrid(newGrid);

      const points = 50 + level * 10;
      setScore((prev) => prev + points);

      const newStats = {
        ...gameStats,
        correct: gameStats.correct + 1,
        total: gameStats.total + 1,
      };
      setGameStats(newStats);

      toast.success(`To'g'ri! +${points} ball`);

      // Check if all numbers found
      if (newFoundNumbers.length === hiddenNumbers.length) {
        completeLevel();
      } else {
        // Move to next number
        const nextTarget = hiddenNumbers[targetIndex + 1];
        setCurrentTarget(nextTarget);
        toast.info(`Endi ${nextTarget} raqamini toping!`);
      }
    } else {
      // Wrong number
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          endGame();
          return 0;
        }
        toast.error(`Noto'g'ri! ${newLives} jon qoldi`);
        return newLives;
      });

      setGameStats((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
    }
  };

  // Complete current level
  const completeLevel = () => {
    setLevel((prev) => prev + 1);
    const bonusPoints = level * 100;
    setScore((prev) => prev + bonusPoints);

    toast.success(`Daraja ${level} tugallandi! +${bonusPoints} bonus ball`);

    // Start next level after delay
    setTimeout(() => {
      if (level < 10) {
        startGame();
      } else {
        endGame();
      }
    }, 2000);
  };

  // End game
  const endGame = async () => {
    setGameState("result");
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    try {
      await gamesAPI.submitResult("hideAndSeek", {
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
  };

  // Reset game
  const resetGame = () => {
    setGameState("idle");
    setLevel(1);
    setScore(0);
    setLives(3);
    setGrid([]);
    setHiddenNumbers([]);
    setCurrentTarget(1);
    setFoundNumbers([]);
    setShowTime(3);
    setStartTime(null);
    setGameStats({
      correct: 0,
      total: 0,
      timeSpent: 0,
    });
  };

  // Render grid cell
  const renderCell = (cell) => {
    const isVisible =
      gameState === "showing" ||
      (gameState === "searching" && !cell.isHidden) ||
      cell.isFound;

    const isTarget =
      cell.number === currentTarget && cell.isHidden && !cell.isFound;
    const isHiddenCell =
      cell.isHidden && gameState === "searching" && !cell.isFound;

    return (
      <motion.div
        key={cell.id}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: isHiddenCell ? 1.05 : 1 }}
        whileTap={{ scale: isHiddenCell ? 0.95 : 1 }}
        transition={{ delay: cell.id * 0.02 }}
        className={`
          aspect-square border-2 rounded-lg cursor-pointer transition-all duration-300
          flex items-center justify-center font-bold text-lg select-none
          ${
            isVisible
              ? "bg-white border-gray-300 text-gray-800"
              : "bg-gray-200 border-gray-400 text-transparent"
          }
          ${isTarget ? "animate-pulse ring-2 ring-yellow-400" : ""}
          ${cell.isFound ? "bg-green-100 border-green-500 text-green-700" : ""}
          ${isHiddenCell ? "hover:bg-blue-50 hover:border-blue-300" : ""}
        `}
        onClick={() => handleCellClick(cell)}
      >
        {isVisible && (
          <span className={cell.isFound ? "line-through" : ""}>
            {cell.number}
          </span>
        )}
        {isHiddenCell && <FaEyeSlash className="text-gray-400 text-sm" />}
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🔍 Berkinchoq
        </Title>
        <Text className="text-gray-600 text-lg">
          Yashiringan raqamlarning joyini eslab qoling va ularni tartib bilan
          toping
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
            title="Topildi"
            value={foundNumbers.length}
            suffix={`/${hiddenNumbers.length}`}
          />
        </Card>
      </div>

      {/* Current Target */}
      {gameState === "searching" && (
        <Card className="mb-6 text-center bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-center space-x-2">
            <FaEye className="text-yellow-600" />
            <Text className="text-lg font-medium">
              Qidirilayotgan raqam:{" "}
              <span className="text-2xl font-bold text-yellow-700">
                {currentTarget}
              </span>
            </Text>
          </div>
        </Card>
      )}

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
              <div className="text-6xl mb-4">🔍</div>
              <Title level={3}>Berkinchoq o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Raqamlar bir necha soniya ko'rsatiladi, keyin ba'zilari
                yashiriladi. Yashiringan raqamlarni tartib bo'yicha toping!
              </Text>

              {/* Game Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-lg">
                <Card className="bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👀</div>
                    <Text strong className="text-blue-700">
                      1. Kuzatish
                    </Text>
                    <Text className="text-xs text-blue-600 block">
                      Raqamlarni yodlab oling
                    </Text>
                  </div>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🙈</div>
                    <Text strong className="text-purple-700">
                      2. Yashirish
                    </Text>
                    <Text className="text-xs text-purple-600 block">
                      Ba'zi raqamlar yashiriladi
                    </Text>
                  </div>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔍</div>
                    <Text strong className="text-green-700">
                      3. Qidirish
                    </Text>
                    <Text className="text-xs text-green-600 block">
                      Tartib bo'yicha toping
                    </Text>
                  </div>
                </Card>
              </div>

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

          {/* Showing State */}
          {gameState === "showing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Raqamlarni eslab qoling!</Title>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {showTime}
              </div>

              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 70}px`,
                }}
              >
                {grid.map(renderCell)}
              </div>

              <Progress
                percent={
                  ((settings.showDuration / 1000 - showTime) /
                    (settings.showDuration / 1000)) *
                  100
                }
                strokeColor="#3b82f6"
                showInfo={false}
              />
            </motion.div>
          )}

          {/* Hiding State */}
          {gameState === "hiding" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Raqamlar yashirilmoqda...</Title>
              <div className="text-4xl">🙈</div>

              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 70}px`,
                }}
              >
                {grid.map(renderCell)}
              </div>
            </motion.div>
          )}

          {/* Searching State */}
          {gameState === "searching" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Yashiringan raqamlarni toping!</Title>

              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 70}px`,
                }}
              >
                {grid.map(renderCell)}
              </div>

              <div className="text-center">
                <Text className="text-gray-600">
                  Yashiringan raqamlar: {hiddenNumbers.join(", ")}
                </Text>
              </div>

              <Progress
                percent={(foundNumbers.length / hiddenNumbers.length) * 100}
                strokeColor="#22c55e"
                className="max-w-md mx-auto"
              />

              <div className="flex justify-center">
                <Button icon={<FaStop />} onClick={endGame} className="px-6">
                  To'xtatish
                </Button>
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
                {lives > 0 ? "Ajoyib o'yin!" : "O'yin tugadi!"}
              </Title>

              <div className="grid grid-cols-2 gap-4 my-6 max-w-md mx-auto">
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
        title="Berkinchoq o'yini sozlamalari"
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
            <Text strong>Jadval o'lchami:</Text>
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

          <div>
            <Text strong>Ko'rsatish vaqti (soniya):</Text>
            <div className="mt-2">
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={settings.showDuration / 1000}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    showDuration: Number(e.target.value) * 1000,
                  }))
                }
                className="w-full"
              />
              <Text className="text-sm text-gray-500">
                {settings.showDuration / 1000} soniya
              </Text>
            </div>
          </div>

          <div>
            <Text strong>Yashiringan raqamlar soni:</Text>
            <div className="mt-2">
              <input
                type="range"
                min="3"
                max={Math.floor(settings.gridSize * settings.gridSize * 0.7)}
                step="1"
                value={settings.hiddenCount}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    hiddenCount: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <Text className="text-sm text-gray-500">
                {settings.hiddenCount} ta
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

export default HideAndSeekGame;
