import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Progress,
  Space,
  Typography,
  Statistic,
  Modal,
  Radio,
} from "antd";
import { FaPlay, FaStop, FaRedo, FaCog, FaDivide } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const FractionsGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, playing, result
  const [level, setLevel] = useState(1);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [problems, setProblems] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(75);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
  });
  const [settings, setSettings] = useState({
    difficulty: "medium",
    timeLimit: 75,
    problemTypes: ["compare", "add", "subtract", "multiply"],
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

  // Helper functions for fraction operations
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  const simplifyFraction = (num, den) => {
    const g = gcd(Math.abs(num), Math.abs(den));
    return { num: num / g, den: den / g };
  };

  const addFractions = (f1, f2) => {
    const commonDen = lcm(f1.den, f2.den);
    const num = (f1.num * commonDen) / f1.den + (f2.num * commonDen) / f2.den;
    return simplifyFraction(num, commonDen);
  };

  const subtractFractions = (f1, f2) => {
    const commonDen = lcm(f1.den, f2.den);
    const num = (f1.num * commonDen) / f1.den - (f2.num * commonDen) / f2.den;
    return simplifyFraction(num, commonDen);
  };

  const multiplyFractions = (f1, f2) => {
    return simplifyFraction(f1.num * f2.num, f1.den * f2.den);
  };

  const compareFractions = (f1, f2) => {
    const val1 = f1.num / f1.den;
    const val2 = f2.num / f2.den;
    if (Math.abs(val1 - val2) < 0.0001) return "equal";
    return val1 > val2 ? "greater" : "less";
  };

  // Generate fraction problems
  const generateProblems = useCallback(() => {
    const problemCount = 8 + level * 2;
    const generatedProblems = [];

    for (let i = 0; i < problemCount; i++) {
      const type =
        settings.problemTypes[
          Math.floor(Math.random() * settings.problemTypes.length)
        ];
      let problem;

      switch (type) {
        case "compare":
          problem = generateCompareProblem();
          break;
        case "add":
          problem = generateAddProblem();
          break;
        case "subtract":
          problem = generateSubtractProblem();
          break;
        case "multiply":
          problem = generateMultiplyProblem();
          break;
        default:
          problem = generateCompareProblem();
      }

      generatedProblems.push(problem);
    }

    return generatedProblems;
  }, [level, settings.problemTypes]);

  const generateCompareProblem = () => {
    const f1 = {
      num: Math.floor(Math.random() * 9) + 1,
      den: Math.floor(Math.random() * 9) + 2,
    };
    const f2 = {
      num: Math.floor(Math.random() * 9) + 1,
      den: Math.floor(Math.random() * 9) + 2,
    };

    const result = compareFractions(f1, f2);
    const correctAnswer =
      result === "greater" ? "A > B" : result === "less" ? "A < B" : "A = B";

    const options = ["A > B", "A < B", "A = B"];

    return {
      question: `${f1.num}/${f1.den} va ${f2.num}/${f2.den} ni solishtiring`,
      options: options,
      correctAnswer: correctAnswer,
      type: "compare",
      fractions: [f1, f2],
    };
  };

  const generateAddProblem = () => {
    const f1 = {
      num: Math.floor(Math.random() * 5) + 1,
      den: Math.floor(Math.random() * 6) + 2,
    };
    const f2 = {
      num: Math.floor(Math.random() * 5) + 1,
      den: Math.floor(Math.random() * 6) + 2,
    };

    const result = addFractions(f1, f2);
    const correctAnswer = `${result.num}/${result.den}`;

    // Generate wrong options
    const wrong1 = simplifyFraction(result.num + 1, result.den);
    const wrong2 = simplifyFraction(result.num, result.den + 1);
    const wrong3 = simplifyFraction(f1.num + f2.num, f1.den + f2.den); // Common mistake

    const options = [
      correctAnswer,
      `${wrong1.num}/${wrong1.den}`,
      `${wrong2.num}/${wrong2.den}`,
      `${wrong3.num}/${wrong3.den}`,
    ].sort(() => Math.random() - 0.5);

    return {
      question: `${f1.num}/${f1.den} × ${f2.num}/${f2.den} = ?`,
      options: options,
      correctAnswer: correctAnswer,
      type: "multiply",
      fractions: [f1, f2],
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
      setSelectedAnswer(null);
      setStartTime(Date.now());
      setTimeLeft(settings.timeLimit);
      setGameStats({ correct: 0, total: 0 });

      toast.success("Kasrlar o'yini boshlandi!");
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast.error("Javobni tanlang");
      return;
    }

    const isCorrect = selectedAnswer === currentProblem.correctAnswer;

    const newStats = {
      correct: gameStats.correct + (isCorrect ? 1 : 0),
      total: gameStats.total + 1,
    };
    setGameStats(newStats);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      const points = 14 + level * 3;
      setScore((prev) => prev + points);
      toast.success(`To'g'ri! +${points} ball`);
    } else {
      toast.error(`Noto'g'ri! To'g'ri javob: ${currentProblem.correctAnswer}`);
    }

    // Move to next problem
    setTimeout(() => {
      if (problemIndex < problems.length - 1) {
        setProblemIndex((prev) => prev + 1);
        setCurrentProblem(problems[problemIndex + 1]);
        setSelectedAnswer(null);
      } else {
        endGame();
      }
    }, 1500);
  };

  // End game
  const endGame = async () => {
    setGameState("result");
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    try {
      await gamesAPI.submitResult("fractions", {
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
    setSelectedAnswer(null);
    setTimeLeft(75);
    setGameStats({ correct: 0, total: 0 });
  };

  // Get problem type emoji and title
  const getProblemInfo = (type) => {
    switch (type) {
      case "compare":
        return { emoji: "⚖️", title: "Solishtirish" };
      case "add":
        return { emoji: "➕", title: "Qo'shish" };
      case "subtract":
        return { emoji: "➖", title: "Ayirish" };
      case "multiply":
        return { emoji: "✖️", title: "Ko'paytirish" };
      default:
        return { emoji: "📐", title: "Kasrlar" };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          ➗ Kasrlar
        </Title>
        <Text className="text-gray-600 text-lg">
          Kasrlarni solishtiring va ular bilan matematik amallar bajaring
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
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-game min-h-[500px]">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">➗</div>
              <Title level={3}>Kasrlar o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Kasrlarni solishtiring va ular ustida matematik amallar
                (qo'shish, ayirish, ko'paytirish) ni bajaring.
              </Text>

              {/* Problem type examples */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚖️</div>
                    <Text strong>Solishtirish</Text>
                    <Text className="text-xs text-gray-500 block">
                      3/4 ? 2/3
                    </Text>
                  </div>
                </Card>
                <Card className="bg-white/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">➕</div>
                    <Text strong>Qo'shish</Text>
                    <Text className="text-xs text-gray-500 block">
                      1/2 + 1/3 = ?
                    </Text>
                  </div>
                </Card>
                <Card className="bg-white/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">➖</div>
                    <Text strong>Ayirish</Text>
                    <Text className="text-xs text-gray-500 block">
                      3/4 - 1/2 = ?
                    </Text>
                  </div>
                </Card>
                <Card className="bg-white/50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">✖️</div>
                    <Text strong>Ko'paytirish</Text>
                    <Text className="text-xs text-gray-500 block">
                      2/3 × 3/4 = ?
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
          {gameState === "playing" && currentProblem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <Text className="text-lg">
                  Masala {problemIndex + 1} / {problems.length}
                </Text>
                <div
                  className={`text-2xl font-mono ${
                    timeLeft <= 15
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
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-3xl">
                      {getProblemInfo(currentProblem.type).emoji}
                    </span>
                    <Text className="text-sm text-gray-500">
                      {getProblemInfo(currentProblem.type).title}
                    </Text>
                  </div>

                  <Title level={3} className="text-gray-800 mb-6">
                    {currentProblem.question}
                  </Title>

                  <div className="space-y-4">
                    <Text className="text-gray-600">Javobni tanlang:</Text>

                    <Radio.Group
                      value={selectedAnswer}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      className="w-full"
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {currentProblem.options.map((option, index) => (
                          <Radio
                            key={index}
                            value={option}
                            className="border rounded-lg p-3 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-lg font-mono">{option}</span>
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>

                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      disabled={!selectedAnswer}
                      size="large"
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-2 h-auto"
                    >
                      Tasdiqlash
                    </Button>
                  </div>
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
                  ? "🏆"
                  : correctAnswers / gameStats.total >= 0.6
                  ? "🎉"
                  : correctAnswers / gameStats.total >= 0.4
                  ? "👍"
                  : "💪"}
              </div>
              <Title level={3}>
                {correctAnswers / gameStats.total >= 0.8
                  ? "Mukammal!"
                  : correctAnswers / gameStats.total >= 0.6
                  ? "Ajoyib!"
                  : correctAnswers / gameStats.total >= 0.4
                  ? "Yaxshi!"
                  : "Yana harakat qiling!"}
              </Title>

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
                    title="Sarflangan vaqt"
                    value={
                      startTime
                        ? Math.floor((Date.now() - startTime) / 1000)
                        : 0
                    }
                    suffix="s"
                  />
                </Card>
              </div>

              {/* Performance feedback */}
              <Card className="bg-blue-50 border-blue-200 max-w-md mx-auto">
                <Text className="text-blue-800 text-sm">
                  {correctAnswers / gameStats.total >= 0.8
                    ? "🌟 Siz kasrlarni mukammal bilasiz!"
                    : correctAnswers / gameStats.total >= 0.6
                    ? "✨ Yaxshi! Kasrlar bilan ishlash mahoratingiz ajoyib."
                    : correctAnswers / gameStats.total >= 0.4
                    ? "📚 Kasrlar qoidalarini yana bir bor takrorlang."
                    : "💡 Kasrlarning asosiy qoidalarini o'rganing."}
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
        title="Kasrlar o'yini sozlamalari"
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
                min="45"
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
            <Text strong>Amal turlari:</Text>
            <div className="mt-2 space-y-2">
              {[
                { key: "compare", label: "⚖️ Kasrlarni solishtirish" },
                { key: "add", label: "➕ Kasrlarni qo'shish" },
                { key: "subtract", label: "➖ Kasrlarni ayirish" },
                { key: "multiply", label: "✖️ Kasrlarni ko'paytirish" },
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
                        if (settings.problemTypes.length > 1) {
                          setSettings((prev) => ({
                            ...prev,
                            problemTypes: prev.problemTypes.filter(
                              (t) => t !== type.key
                            ),
                          }));
                        }
                      }
                    }}
                  />
                  <Text className="text-sm">{type.label}</Text>
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

export default FractionsGame;
