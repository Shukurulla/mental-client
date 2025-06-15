import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Progress,
  Space,
  Typography,
  Statistic,
  Modal,
  Input,
  Radio,
} from "antd";
import { FaPlay, FaStop, FaRedo, FaCog, FaCalculator } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import "katex/dist/katex.min.css";

const { Title, Text } = Typography;

const MathSystemsGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, playing, result
  const [level, setLevel] = useState(1);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblems] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
  });
  const [settings, setSettings] = useState({
    difficulty: "medium",
    timeLimit: 60,
    problemTypes: ["power", "root", "log"],
  });
  const [showSettings, setShowSettings] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Generate math problems
  const generateProblems = useCallback(() => {
    const problemCount = 10 + level * 2;
    const generatedProblems = [];

    for (let i = 0; i < problemCount; i++) {
      const type =
        settings.problemTypes[
          Math.floor(Math.random() * settings.problemTypes.length)
        ];
      let problem;

      switch (type) {
        case "power":
          problem = generatePowerProblem();
          break;
        case "root":
          problem = generateRootProblem();
          break;
        case "log":
          problem = generateLogProblem();
          break;
        default:
          problem = generatePowerProblem();
      }

      generatedProblems.push(problem);
    }

    return generatedProblems;
  }, [level, settings.problemTypes]);

  const generatePowerProblem = () => {
    const base = Math.floor(Math.random() * 8) + 2; // 2-9
    const exponent = Math.floor(Math.random() * 4) + 2; // 2-5
    return {
      question: `${base}^${exponent}`,
      answer: Math.pow(base, exponent),
      type: "power",
      latex: `${base}^{${exponent}}`,
    };
  };

  const generateRootProblem = () => {
    const result = Math.floor(Math.random() * 10) + 2; // 2-11
    const number = result * result;
    return {
      question: `√${number}`,
      answer: result,
      type: "root",
      latex: `\\sqrt{${number}}`,
    };
  };

  const generateLogProblem = () => {
    const bases = [2, 3, 5, 10];
    const base = bases[Math.floor(Math.random() * bases.length)];
    const result = Math.floor(Math.random() * 4) + 1; // 1-4
    const number = Math.pow(base, result);
    return {
      question: `log₍${base}₎(${number})`,
      answer: result,
      type: "log",
      latex: `\\log_{${base}}(${number})`,
    };
  };

  // Start new game
  const startGame = async () => {
    try {
      const newProblems = generateProblems();
      setProblems(newProblems);
      setCurrentProblem(newProblems[0]);
      setProblemIndex(0);
      setGameState("playing");
      setScore(0);
      setCorrectAnswers(0);
      setUserAnswer("");
      setStartTime(Date.now());
      setTimeLeft(settings.timeLimit);
      setGameStats({ correct: 0, total: 0 });

      toast.success("O'yin boshlandi!");
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      toast.error("Javobni kiriting");
      return;
    }

    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - currentProblem.answer) < 0.001;

    const newStats = {
      correct: gameStats.correct + (isCorrect ? 1 : 0),
      total: gameStats.total + 1,
    };
    setGameStats(newStats);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      const points = 10 + level * 2;
      setScore((prev) => prev + points);
      toast.success(`To'g'ri! +${points} ball`);
    } else {
      toast.error(`Noto'g'ri! To'g'ri javob: ${currentProblem.answer}`);
    }

    // Move to next problem
    if (problemIndex < problems.length - 1) {
      setProblemIndex((prev) => prev + 1);
      setCurrentProblem(problems[problemIndex + 1]);
      setUserAnswer("");
    } else {
      endGame();
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // End game
  const endGame = async () => {
    setGameState("result");
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    try {
      await gamesAPI.submitResult("mathSystems", {
        score,
        level,
        duration,
        correctAnswers,
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
    setCorrectAnswers(0);
    setProblems([]);
    setCurrentProblem(null);
    setProblemIndex(0);
    setUserAnswer("");
    setTimeLeft(60);
    setGameStats({ correct: 0, total: 0 });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🧮 Hisoblash Tizimlari
        </Title>
        <Text className="text-gray-600 text-lg">
          Daraja, ildiz va logarifm masalalarini yeching
        </Text>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic title="Ball" value={score} />
        </Card>
        <Card className="text-center">
          <Statistic title="Vaqt" value={timeLeft} suffix="s" />
        </Card>
        <Card className="text-center">
          <Statistic
            title="To'g'ri"
            value={correctAnswers}
            suffix={`/${gameStats.total}`}
          />
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
              <div className="text-6xl mb-4">🧮</div>
              <Title level={3}>Matematik amallar o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Daraja, kvadrat ildiz va logarifm masalalarini tez va to'g'ri
                yeching. Har bir to'g'ri javob uchun ball oling!
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
          {gameState === "playing" && currentProblem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <Text className="text-lg">
                  Masala {problemIndex + 1} / {problems.length}
                </Text>
                <div
                  className={`text-2xl font-mono ${
                    timeLeft <= 10
                      ? "text-red-500 animate-pulse"
                      : "text-gray-700"
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>

              <Progress
                percent={(problemIndex / problems.length) * 100}
                strokeColor="#3b82f6"
                className="mb-6"
              />

              {/* Problem Display */}
              <Card className="bg-white border border-gray-200">
                <div className="text-center space-y-4">
                  <Title level={2} className="text-gray-800 mb-4">
                    {currentProblem.question}
                  </Title>

                  <Text className="text-gray-600">Javobni kiriting:</Text>

                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Javobingizni kiriting"
                    className="text-center text-xl py-3"
                    type="number"
                    autoFocus
                  />

                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-2 h-auto"
                  >
                    Tasdiqlash
                  </Button>
                </div>
              </Card>

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
              <div className="text-6xl mb-4">
                {correctAnswers / gameStats.total >= 0.8
                  ? "🎉"
                  : correctAnswers / gameStats.total >= 0.6
                  ? "👍"
                  : "💪"}
              </div>
              <Title level={3}>O'yin tugadi!</Title>

              <div className="grid grid-cols-2 gap-4 my-6 max-w-md mx-auto">
                <Card>
                  <Statistic title="Yakuniy ball" value={score} />
                </Card>
                <Card>
                  <Statistic
                    title="To'g'ri javoblar"
                    value={correctAnswers}
                    suffix={`/${gameStats.total}`}
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
                <Card>
                  <Statistic
                    title="Vaqt"
                    value={
                      startTime
                        ? Math.floor((Date.now() - startTime) / 1000)
                        : 0
                    }
                    suffix="s"
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
        title="Hisoblash tizimlari sozlamalari"
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
            <Text strong>Vaqt chegarasi (soniya):</Text>
            <div className="mt-2">
              <input
                type="range"
                min="30"
                max="120"
                step="15"
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
            <Text strong>Masala turlari:</Text>
            <div className="mt-2 space-y-2">
              {[
                { key: "power", label: "Daraja (2³, 3⁴, ...)" },
                { key: "root", label: "Kvadrat ildiz (√16, √25, ...)" },
                { key: "log", label: "Logarifm (log₂(8), log₁₀(100), ...)" },
              ].map((type) => (
                <label key={type.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.problemTypes.includes(type.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings((prev) => ({
                          ...prev,
                          problemTypes: [...prev.problemTypes, type.key],
                        }));
                      } else {
                        setSettings((prev) => ({
                          ...prev,
                          problemTypes: prev.problemTypes.filter(
                            (t) => t !== type.key
                          ),
                        }));
                      }
                    }}
                  />
                  <Text>{type.label}</Text>
                </label>
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

export default MathSystemsGame;
