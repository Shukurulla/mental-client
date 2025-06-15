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

const DoubleSchulteGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, playing, finished
  const [level, setLevel] = useState(1);
  const [redNumbers, setRedNumbers] = useState([]);
  const [blueNumbers, setBlueNumbers] = useState([]);
  const [currentRedNumber, setCurrentRedNumber] = useState(1);
  const [currentBlueNumber, setCurrentBlueNumber] = useState(1);
  const [currentTask, setCurrentTask] = useState("red"); // red, blue
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
    timeLimit: 180, // seconds
    switchPattern: "alternate", // alternate, random
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

  // Generate shuffled numbers for both colors
  const generateNumbers = useCallback(() => {
    const total = settings.gridSize * settings.gridSize;
    const redNums = Array.from({ length: total }, (_, i) => i + 1);
    const blueNums = Array.from({ length: total }, (_, i) => i + 1);

    // Fisher-Yates shuffle
    for (let i = redNums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [redNums[i], redNums[j]] = [redNums[j], redNums[i]];
    }

    for (let i = blueNums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blueNums[i], blueNums[j]] = [blueNums[j], blueNums[i]];
    }

    return { red: redNums, blue: blueNums };
  }, [settings.gridSize]);

  // Start new game
  const startGame = async () => {
    try {
      const { red, blue } = generateNumbers();
      setRedNumbers(red);
      setBlueNumbers(blue);
      setGameState("playing");
      setCurrentRedNumber(1);
      setCurrentBlueNumber(1);
      setCurrentTask("red");
      setStartTime(Date.now());
      setEndTime(null);
      setElapsedTime(0);

      toast.success("O'yin boshlandi! Qizil 1-raqamni toping");
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Handle number click
  const handleNumberClick = (color, clickedNumber) => {
    if (gameState !== "playing") return;

    const total = settings.gridSize * settings.gridSize;

    if (color === "red" && currentTask === "red") {
      if (clickedNumber === currentRedNumber) {
        // Correct red number
        if (currentRedNumber === total) {
          // All red numbers completed
          finishGame();
        } else {
          setCurrentRedNumber((prev) => prev + 1);
          // Switch to blue task
          setCurrentTask("blue");
          toast.success(
            `To'g'ri! Endi ko'k ${currentBlueNumber}-raqamni toping`
          );
        }
      } else {
        toast.error(`Noto'g'ri! Qizil ${currentRedNumber}-raqamni toping`);
      }
    } else if (color === "blue" && currentTask === "blue") {
      if (clickedNumber === currentBlueNumber) {
        // Correct blue number
        if (currentBlueNumber === total) {
          // All blue numbers completed
          finishGame();
        } else {
          setCurrentBlueNumber((prev) => prev + 1);
          // Switch to red task
          setCurrentTask("red");
          toast.success(
            `To'g'ri! Endi qizil ${currentRedNumber}-raqamni toping`
          );
        }
      } else {
        toast.error(`Noto'g'ri! Ko'k ${currentBlueNumber}-raqamni toping`);
      }
    } else {
      // Wrong color
      const expectedColor = currentTask === "red" ? "qizil" : "ko'k";
      const expectedNumber =
        currentTask === "red" ? currentRedNumber : currentBlueNumber;
      toast.error(`${expectedColor} ${expectedNumber}-raqamni toping!`);
    }
  };

  // Finish game
  const finishGame = async () => {
    const gameEndTime = Date.now();
    setEndTime(gameEndTime);
    setGameState("finished");

    const totalTime = Math.floor((gameEndTime - startTime) / 1000);
    const points = Math.max(2000 - totalTime * 5, 200); // More points for faster completion
    setScore(points);

    try {
      await gamesAPI.submitResult("doubleSchulte", {
        score: points,
        level,
        duration: totalTime,
        correctAnswers: settings.gridSize * settings.gridSize * 2,
        totalQuestions: settings.gridSize * settings.gridSize * 2,
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
    setRedNumbers([]);
    setBlueNumbers([]);
    setCurrentRedNumber(1);
    setCurrentBlueNumber(1);
    setCurrentTask("red");
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
    return redNumbers.map((redNum, index) => {
      const blueNum = blueNumbers[index];
      const isRedNext = redNum === currentRedNumber && currentTask === "red";
      const isBlueNext =
        blueNum === currentBlueNumber && currentTask === "blue";
      const isRedCompleted = redNum < currentRedNumber;
      const isBlueCompleted = blueNum < currentBlueNumber;

      return (
        <motion.div
          key={`${index}-${redNum}-${blueNum}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
          className={`
            aspect-square border-2 rounded-lg cursor-pointer transition-all duration-200 
            flex flex-col items-center justify-center font-bold text-sm select-none relative
            ${
              isRedNext || isBlueNext
                ? "border-yellow-500 bg-yellow-100 shadow-lg ring-2 ring-yellow-200"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }
          `}
        >
          {/* Red number (top) */}
          <div
            className={`
              absolute top-1 left-1 w-6 h-6 rounded flex items-center justify-center text-xs
              ${
                isRedCompleted
                  ? "bg-green-500 text-white"
                  : isRedNext
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-red-200 text-red-800"
              }
            `}
            onClick={() => handleNumberClick("red", redNum)}
          >
            {redNum}
          </div>

          {/* Blue number (bottom) */}
          <div
            className={`
              absolute bottom-1 right-1 w-6 h-6 rounded flex items-center justify-center text-xs
              ${
                isBlueCompleted
                  ? "bg-green-500 text-white"
                  : isBlueNext
                  ? "bg-blue-500 text-white animate-pulse"
                  : "bg-blue-200 text-blue-800"
              }
            `}
            onClick={() => handleNumberClick("blue", blueNum)}
          >
            {blueNum}
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🔴🔵 Ikkilangan Schulte
        </Title>
        <Text className="text-gray-600 text-lg">
          Qizil va ko'k raqamlarni navbatma-navbat tartib bo'yicha toping
        </Text>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic
            title="Qizil raqam"
            value={currentRedNumber}
            suffix={`/ ${settings.gridSize * settings.gridSize}`}
            valueStyle={{ color: "#dc2626" }}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Ko'k raqam"
            value={currentBlueNumber}
            suffix={`/ ${settings.gridSize * settings.gridSize}`}
            valueStyle={{ color: "#2563eb" }}
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
      </div>

      {/* Current Task Indicator */}
      {gameState === "playing" && (
        <Card className="mb-6 text-center">
          <div className="flex items-center justify-center space-x-4">
            <Text className="text-lg">Hozir:</Text>
            <div
              className={`px-4 py-2 rounded-lg font-bold text-white ${
                currentTask === "red" ? "bg-red-500" : "bg-blue-500"
              }`}
            >
              {currentTask === "red" ? "Qizil" : "Ko'k"}{" "}
              {currentTask === "red" ? currentRedNumber : currentBlueNumber}
            </div>
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
              <div className="text-6xl mb-4">🔴🔵</div>
              <Title level={3}>Ikkilangan Schulte o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Qizil va ko'k raqamlarni navbatma-navbat tartib bo'yicha toping.
                Bu o'yin diqqatni bo'lish va multitasking qobiliyatini
                rivojlantiradi.
              </Text>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-md">
                <Card className="bg-red-50 border-red-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔴</div>
                    <Text strong className="text-red-700">
                      Qizil raqamlar
                    </Text>
                    <Text className="text-xs text-red-600 block">
                      1, 2, 3... tartibda
                    </Text>
                  </div>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔵</div>
                    <Text strong className="text-blue-700">
                      Ko'k raqamlar
                    </Text>
                    <Text className="text-xs text-blue-600 block">
                      1, 2, 3... tartibda
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

          {/* Playing State */}
          {gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="mb-0">
                  {currentTask === "red" ? "🔴" : "🔵"}{" "}
                  {currentTask === "red" ? currentRedNumber : currentBlueNumber}
                  -raqamni toping
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

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <Progress
                    percent={
                      ((currentRedNumber - 1) /
                        (settings.gridSize * settings.gridSize)) *
                      100
                    }
                    strokeColor="#dc2626"
                    size="small"
                  />
                  <Text className="text-red-600 text-sm">Qizil progress</Text>
                </div>
                <div className="text-center">
                  <Progress
                    percent={
                      ((currentBlueNumber - 1) /
                        (settings.gridSize * settings.gridSize)) *
                      100
                    }
                    strokeColor="#2563eb"
                    size="small"
                  />
                  <Text className="text-blue-600 text-sm">Ko'k progress</Text>
                </div>
              </div>

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
              <div className="text-6xl mb-4">🏆</div>
              <Title level={3}>Ajoyib!</Title>

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

              {/* Performance Analysis */}
              <Card className="bg-blue-50 border-blue-200 max-w-md mx-auto">
                <Text className="text-blue-800 text-sm">
                  {Math.floor((endTime - startTime) / 1000) < 120
                    ? "🌟 Ajoyib tezlik! Diqqatingiz mukammal."
                    : Math.floor((endTime - startTime) / 1000) < 180
                    ? "✨ Yaxshi natija! Yana mashq qiling."
                    : "💪 Diqqatni bo'lish qobiliyatingizni rivojlantiring."}
                </Text>
              </Card>

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
        title="Ikkilangan Schulte sozlamalari"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        className="settings-modal"
      >
        <div className="space-y-4">
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
            <Text strong>Vaqt chegarasi (soniya):</Text>
            <div className="mt-2">
              <input
                type="range"
                min="60"
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

          <div>
            <Text strong>O'tish usuli:</Text>
            <div className="mt-2 space-x-2">
              <Button
                type={
                  settings.switchPattern === "alternate" ? "primary" : "default"
                }
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    switchPattern: "alternate",
                  }))
                }
              >
                Navbatma-navbat
              </Button>
              <Button
                type={
                  settings.switchPattern === "random" ? "primary" : "default"
                }
                onClick={() =>
                  setSettings((prev) => ({ ...prev, switchPattern: "random" }))
                }
              >
                Tasodifiy
              </Button>
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

export default DoubleSchulteGame;
