import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Input,
  Space,
  Progress,
  message,
  Modal,
} from "antd";
import { FaPlay, FaPause, FaStop, FaRedo, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const { Title, Text } = Typography;

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FlashAnzanGame = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  // Game settings
  const [settings, setSettings] = useState({
    digitCount: 1,
    sequenceLength: 5,
    displayTime: 1000, // milliseconds
    operation: "add", // add, subtract, mixed
    gameMode: "single", // single, audience
  });

  // Game state
  const [gameState, setGameState] = useState("setup"); // setup, playing, input, result
  const [sequence, setSequence] = useState([]);
  const [operations, setOperations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [currentOperation, setCurrentOperation] = useState("+");
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Generate random number based on digit count
  const generateNumber = useCallback(() => {
    const digits = settings.digitCount;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [settings.digitCount]);

  // Generate operation
  const generateOperation = useCallback(() => {
    if (settings.operation === "add") return "+";
    if (settings.operation === "subtract") return "-";
    // mixed
    return Math.random() > 0.5 ? "+" : "-";
  }, [settings.operation]);

  // Generate sequence
  const generateSequence = useCallback(() => {
    const newSequence = [];
    const newOperations = [];

    for (let i = 0; i < settings.sequenceLength; i++) {
      newSequence.push(generateNumber());
      newOperations.push(i === 0 ? "+" : generateOperation());
    }

    // Calculate correct answer
    let answer = newSequence[0];
    for (let i = 1; i < newSequence.length; i++) {
      if (newOperations[i] === "+") {
        answer += newSequence[i];
      } else {
        answer -= newSequence[i];
      }
    }

    setSequence(newSequence);
    setOperations(newOperations);
    setCorrectAnswer(answer);
    setCurrentIndex(0);
  }, [settings, generateNumber, generateOperation]);

  // Start game
  const startGame = () => {
    generateSequence();
    setGameState("playing");
    setGameStartTime(Date.now());
    setScore(0);
    setCurrentIndex(0);
  };

  // Display sequence
  useEffect(() => {
    if (gameState !== "playing" || currentIndex >= sequence.length) return;

    setCurrentNumber(sequence[currentIndex]);
    setCurrentOperation(operations[currentIndex]);

    timerRef.current = setTimeout(() => {
      setCurrentNumber(null);
      setCurrentOperation("");

      const pauseTimer = setTimeout(() => {
        if (currentIndex + 1 < sequence.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setGameState("input");
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 200);

      return () => clearTimeout(pauseTimer);
    }, settings.displayTime);

    return () => clearTimeout(timerRef.current);
  }, [gameState, currentIndex, sequence, operations, settings.displayTime]);

  // Submit answer
  const submitAnswer = async () => {
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);

    let newScore = score;
    if (isCorrect) {
      newScore =
        score + settings.digitCount * 100 + settings.sequenceLength * 50;
      setScore(newScore);
    }

    // Save result to backend
    try {
      await axios.post(
        `${API_BASE_URL}/games/flashAnzan/submit`,
        {
          score: newScore,
          level: level,
          duration: duration,
          correctAnswers: isCorrect ? 1 : 0,
          totalQuestions: 1,
          settings: settings,
          gameData: {
            sequence: sequence,
            operations: operations,
            userAnswer: parseInt(userAnswer),
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error saving game result:", error);
    }

    setGameState("result");
    setShowResult(true);

    if (isCorrect) {
      message.success("To'g'ri javob!");
    } else {
      message.error("Noto'g'ri javob!");
    }
  };

  // Next round
  const nextRound = () => {
    if (parseInt(userAnswer) === correctAnswer && level < 20) {
      setLevel((prev) => prev + 1);
      // Increase difficulty
      if (level % 3 === 0 && settings.digitCount < 3) {
        setSettings((prev) => ({ ...prev, digitCount: prev.digitCount + 1 }));
      }
      if (level % 5 === 0 && settings.sequenceLength < 10) {
        setSettings((prev) => ({
          ...prev,
          sequenceLength: prev.sequenceLength + 1,
        }));
      }
    }

    setUserAnswer("");
    setShowResult(false);
    generateSequence();
    setGameState("playing");
    setGameStartTime(Date.now());
    setCurrentIndex(0);
  };

  // Settings panel
  const SettingsPanel = () => (
    <Card className="w-full max-w-md">
      <Title level={3} className="text-center mb-6">
        Flash Anzan
      </Title>

      <Space direction="vertical" className="w-full" size="large">
        <div>
          <Text strong>Raqamlar soni:</Text>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3].map((count) => (
              <Button
                key={count}
                type={settings.digitCount === count ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, digitCount: count }))
                }
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Text strong>Ketma-ketlik uzunligi:</Text>
          <div className="flex gap-2 mt-2">
            {[3, 5, 7, 10].map((length) => (
              <Button
                key={length}
                type={
                  settings.sequenceLength === length ? "primary" : "default"
                }
                onClick={() =>
                  setSettings((prev) => ({ ...prev, sequenceLength: length }))
                }
              >
                {length}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Text strong>Ko'rsatish vaqti (ms):</Text>
          <div className="flex gap-2 mt-2">
            {[500, 1000, 1500, 2000].map((time) => (
              <Button
                key={time}
                type={settings.displayTime === time ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, displayTime: time }))
                }
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Text strong>Amal turi:</Text>
          <div className="flex gap-2 mt-2">
            {[
              { value: "add", label: "Qo'shish" },
              { value: "subtract", label: "Ayirish" },
              { value: "mixed", label: "Aralash" },
            ].map((op) => (
              <Button
                key={op.value}
                type={settings.operation === op.value ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, operation: op.value }))
                }
              >
                {op.label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          block
          icon={<FaPlay />}
          onClick={startGame}
        >
          O'yinni boshlash
        </Button>
      </Space>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          icon={<FaArrowLeft />}
          onClick={() => navigate("/games")}
          size="large"
        >
          Orqaga
        </Button>

        {gameState !== "setup" && (
          <div className="flex items-center gap-4">
            <Text strong>Ball: {score}</Text>
            <Text strong>Daraja: {level}</Text>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center min-h-[80vh]">
        {gameState === "setup" && <SettingsPanel />}

        {gameState === "playing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="min-w-[300px] min-h-[200px] flex items-center justify-center">
              {currentNumber !== null ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <Text className="text-6xl font-bold text-blue-600">
                    {currentOperation !== "+" && currentOperation}
                    {currentNumber}
                  </Text>
                </motion.div>
              ) : (
                <div className="text-4xl text-gray-300">●</div>
              )}
            </Card>

            <Progress
              percent={((currentIndex + 1) / sequence.length) * 100}
              className="mt-4"
              strokeColor="#1890ff"
            />
          </motion.div>
        )}

        {gameState === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="min-w-[300px] p-6">
              <Title level={3} className="mb-4">
                Javobingizni kiriting
              </Title>
              <Input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onPressEnter={submitAnswer}
                size="large"
                className="text-center text-xl mb-4"
                placeholder="Natija..."
              />
              <Button
                type="primary"
                size="large"
                block
                onClick={submitAnswer}
                disabled={!userAnswer}
              >
                Tasdiqlash
              </Button>
            </Card>
          </motion.div>
        )}

        {gameState === "result" && showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="min-w-[300px] p-6">
              <div className="mb-4">
                <Title level={3}>
                  {parseInt(userAnswer) === correctAnswer
                    ? "✅ To'g'ri!"
                    : "❌ Noto'g'ri"}
                </Title>
                <div className="text-lg space-y-2">
                  <div>
                    Sizning javobingiz: <strong>{userAnswer}</strong>
                  </div>
                  <div>
                    To'g'ri javob: <strong>{correctAnswer}</strong>
                  </div>
                  <div>
                    Ball: <strong>{score}</strong>
                  </div>
                </div>
              </div>

              <Space>
                <Button
                  type="primary"
                  icon={<FaRedo />}
                  onClick={nextRound}
                  size="large"
                >
                  Keyingi
                </Button>
                <Button
                  icon={<FaStop />}
                  onClick={() => setGameState("setup")}
                  size="large"
                >
                  To'xtatish
                </Button>
              </Space>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlashAnzanGame;
