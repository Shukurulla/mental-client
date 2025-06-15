import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Progress,
  Input,
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

const AlphaNumMemoryGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, showing, input, result
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
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
    displayTime: 1200,
    maxLevel: 20,
    includeNumbers: true,
    includeLetters: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate mixed alphanumeric sequence
  const generateSequence = useCallback(
    (level) => {
      const length = Math.min(3 + level, 15);
      const sequence = [];

      const characters = [];
      if (settings.includeNumbers) {
        characters.push(..."0123456789".split(""));
      }
      if (settings.includeLetters) {
        characters.push(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
      }

      for (let i = 0; i < length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        sequence.push(char);
      }

      return sequence;
    },
    [settings.includeNumbers, settings.includeLetters]
  );

  // Start new game
  const startGame = async () => {
    try {
      const newSequence = generateSequence(level);
      setSequence(newSequence);
      setGameState("showing");
      setCurrentIndex(0);
      setUserInput("");
      setGameStats({
        correct: 0,
        total: 0,
        startTime: Date.now(),
        endTime: null,
      });

      // Show sequence
      showSequence(newSequence);
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Show sequence animation
  const showSequence = (seq) => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentIndex(index);
      index++;

      if (index >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setGameState("input");
          setCurrentIndex(-1);
        }, settings.displayTime);
      }
    }, settings.displayTime);
  };

  // Handle user input
  const handleSubmit = async () => {
    const userSequence = userInput.toUpperCase().split("");
    const correctSequence = sequence.map((s) => s.toString().toUpperCase());
    const isCorrect =
      JSON.stringify(userSequence) === JSON.stringify(correctSequence);

    const newStats = {
      ...gameStats,
      total: gameStats.total + 1,
      correct: gameStats.correct + (isCorrect ? 1 : 0),
      endTime: Date.now(),
    };

    setGameStats(newStats);

    if (isCorrect) {
      // Correct answer
      const points = level * 12;
      setScore((prev) => prev + points);
      setLevel((prev) => prev + 1);
      toast.success(`To'g'ri! +${points} ball`);

      // Auto start next level
      setTimeout(() => {
        if (level < settings.maxLevel) {
          startGame();
        } else {
          endGame();
        }
      }, 1500);
    } else {
      // Wrong answer
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          endGame();
          return 0;
        }
        toast.error(`Noto'g'ri! ${newLives} jon qoldi`);
        return newLives;
      });
      setGameState("result");
    }
  };

  // End game and save result
  const endGame = async () => {
    const duration = gameStats.endTime
      ? (gameStats.endTime - gameStats.startTime) / 1000
      : 0;

    try {
      await gamesAPI.submitResult("alphaNumMemory", {
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
    setSequence([]);
    setUserInput("");
    setCurrentIndex(0);
    setGameStats({
      correct: 0,
      total: 0,
      startTime: null,
      endTime: null,
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, sequence.length);
    setUserInput(value);
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && userInput.length === sequence.length) {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🔤 Raqam va Harflar
        </Title>
        <Text className="text-gray-600 text-lg">
          Ko'rsatiladigan raqam va harflar ketma-ketligini eslab qoling
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
              <div className="text-6xl mb-4">🔤</div>
              <Title level={3}>Aralash xotira o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6">
                Raqam va harflar aralash ketma-ketligi ko'rsatiladi. Ularni
                to'g'ri tartibda eslab qoling!
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

          {/* Showing Sequence */}
          {gameState === "showing" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Diqqat bilan kuzating!</Title>
              <div className="flex justify-center space-x-2 mb-6">
                {sequence.map((char, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: index === currentIndex ? [1, 1.2, 1] : 1,
                      backgroundColor:
                        index === currentIndex ? "#3b82f6" : "#f3f4f6",
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 flex items-center justify-center rounded-lg text-2xl font-bold ${
                      index === currentIndex ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {index <= currentIndex ? char : "?"}
                  </motion.div>
                ))}
              </div>
              <Progress
                percent={((currentIndex + 1) / sequence.length) * 100}
                showInfo={false}
                strokeColor="#3b82f6"
              />
            </motion.div>
          )}

          {/* Input State */}
          {gameState === "input" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 w-full max-w-md"
            >
              <Title level={3}>Ketma-ketlikni kiriting</Title>
              <Text className="text-gray-600 block">
                Ko'rgan raqam va harflarni ketma-ket yozing
              </Text>

              <div className="space-y-4">
                <Input
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Masalan: A1B2C3"
                  className="text-center text-2xl py-3"
                  maxLength={sequence.length}
                  autoFocus
                />

                <div className="flex justify-center space-x-2">
                  {Array.from({ length: sequence.length }, (_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold ${
                        i < userInput.length
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      {userInput[i] || ""}
                    </div>
                  ))}
                </div>

                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={userInput.length !== sequence.length}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-2 h-auto"
                >
                  Tekshirish
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
              <Input
                type="number"
                value={settings.displayTime}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    displayTime: Number(e.target.value),
                  }))
                }
                min={500}
                max={3000}
                step={100}
              />
            </div>
          </div>

          <div>
            <Text strong>Maksimal daraja:</Text>
            <div className="mt-2">
              <Input
                type="number"
                value={settings.maxLevel}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxLevel: Number(e.target.value),
                  }))
                }
                min={5}
                max={50}
              />
            </div>
          </div>

          <div>
            <Text strong>Ketma-ketlik turlari:</Text>
            <div className="mt-2 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.includeNumbers}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      includeNumbers: e.target.checked,
                    }))
                  }
                />
                <Text>Raqamlar (0-9)</Text>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.includeLetters}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      includeLetters: e.target.checked,
                    }))
                  }
                />
                <Text>Harflar (A-Z)</Text>
              </label>
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

export default AlphaNumMemoryGame;
