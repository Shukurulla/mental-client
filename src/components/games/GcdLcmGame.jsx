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
import { FaPlay, FaStop, FaRedo, FaCog, FaDivide } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const GcdLcmGame = () => {
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
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
  });
  const [settings, setSettings] = useState({
    difficulty: "medium",
    timeLimit: 120,
    problemTypes: ["gcd", "lcm"],
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

  // Math helper functions
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a, b) => (a * b) / gcd(a, b);

  // Generate GCD/LCM problems
  const generateProblems = useCallback(() => {
    const problemCount = 8 + level * 2;
    const generatedProblems = [];

    for (let i = 0; i < problemCount; i++) {
      const type =
        settings.problemTypes[
          Math.floor(Math.random() * settings.problemTypes.length)
        ];
      let problem;

      if (type === "gcd") {
        problem = generateGcdProblem();
      } else {
        problem = generateLcmProblem();
      }

      generatedProblems.push(problem);
    }

    return generatedProblems;
  }, [level, settings.problemTypes]);

  const generateGcdProblem = () => {
    let a, b;

    // Generate numbers based on difficulty
    if (settings.difficulty === "easy") {
      a = Math.floor(Math.random() * 48) + 12; // 12-60
      b = Math.floor(Math.random() * 48) + 12;
    } else if (settings.difficulty === "medium") {
      a = Math.floor(Math.random() * 88) + 12; // 12-100
      b = Math.floor(Math.random() * 88) + 12;
    } else {
      a = Math.floor(Math.random() * 188) + 12; // 12-200
      b = Math.floor(Math.random() * 188) + 12;
    }

    const answer = gcd(a, b);

    return {
      question: `EKUB(${a}, ${b}) = ?`,
      numbers: [a, b],
      answer: answer,
      type: "gcd",
      explanation: `${a} va ${b} ning eng katta umumiy bo'luvchisi`,
    };
  };

  const generateLcmProblem = () => {
    let a, b;

    // Generate smaller numbers for LCM to avoid huge results
    if (settings.difficulty === "easy") {
      a = Math.floor(Math.random() * 18) + 2; // 2-20
      b = Math.floor(Math.random() * 18) + 2;
    } else if (settings.difficulty === "medium") {
      a = Math.floor(Math.random() * 28) + 2; // 2-30
      b = Math.floor(Math.random() * 28) + 2;
    } else {
      a = Math.floor(Math.random() * 48) + 2; // 2-50
      b = Math.floor(Math.random() * 48) + 2;
    }

    const answer = lcm(a, b);

    return {
      question: `EKUK(${a}, ${b}) = ?`,
      numbers: [a, b],
      answer: answer,
      type: "lcm",
      explanation: `${a} va ${b} ning eng kichik umumiy karrali`,
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

      toast.success("EKUB/EKUK o'yini boshlandi!");
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

    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentProblem.answer;

    const newStats = {
      correct: gameStats.correct + (isCorrect ? 1 : 0),
      total: gameStats.total + 1,
    };
    setGameStats(newStats);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      const points = currentProblem.type === "gcd" ? 15 : 20; // LCM is harder
      const levelBonus = level * 2;
      const totalPoints = points + levelBonus;
      setScore((prev) => prev + totalPoints);
      toast.success(`To'g'ri! +${totalPoints} ball`);
    } else {
      toast.error(`Noto'g'ri! To'g'ri javob: ${currentProblem.answer}`);
    }

    // Move to next problem
    setTimeout(() => {
      if (problemIndex < problems.length - 1) {
        setProblemIndex((prev) => prev + 1);
        setCurrentProblem(problems[problemIndex + 1]);
        setUserAnswer("");
      } else {
        endGame();
      }
    }, 1500);
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
      await gamesAPI.submitResult("gcdLcm", {
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
    setTimeLeft(120);
    setGameStats({ correct: 0, total: 0 });
  };

  // Get problem type emoji and color
  const getProblemInfo = (type) => {
    if (type === "gcd") {
      return {
        emoji: "🔻",
        title: "EKUB",
        color: "blue",
        description: "Eng Katta Umumiy Bo'luvchi",
      };
    } else {
      return {
        emoji: "🔺",
        title: "EKUK",
        color: "green",
        description: "Eng Kichik Umumiy Karrali",
      };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          ➗ EKUB va EKUK
        </Title>
        <Text className="text-gray-600 text-lg">
          Eng katta umumiy bo'luvchi va eng kichik umumiy karralini toping
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
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-game min-h-[450px]">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">➗</div>
              <Title level={3}>EKUB va EKUK o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Ikki sonning eng katta umumiy bo'luvchisi (EKUB) va eng kichik
                umumiy karralini (EKUK) toping.
              </Text>

              {/* Concept explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔻</div>
                    <Text strong className="text-blue-700">
                      EKUB
                    </Text>
                    <Text className="text-xs text-blue-600 block">
                      Eng Katta Umumiy Bo'luvchi
                    </Text>
                    <Text className="text-xs text-blue-600 block mt-1">
                      Masalan: EKUB(12, 18) = 6
                    </Text>
                  </div>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔺</div>
                    <Text strong className="text-green-700">
                      EKUK
                    </Text>
                    <Text className="text-xs text-green-600 block">
                      Eng Kichik Umumiy Karrali
                    </Text>
                    <Text className="text-xs text-green-600 block mt-1">
                      Masalan: EKUK(12, 18) = 36
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
                    timeLeft <= 20
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
                    <div className="text-left">
                      <Text
                        className={`text-lg font-bold text-${
                          getProblemInfo(currentProblem.type).color
                        }-700`}
                      >
                        {getProblemInfo(currentProblem.type).title}
                      </Text>
                      <Text className="text-xs text-gray-500 block">
                        {getProblemInfo(currentProblem.type).description}
                      </Text>
                    </div>
                  </div>

                  <Title level={3} className="text-gray-800 mb-6">
                    {currentProblem.question}
                  </Title>

                  <Text className="text-sm text-gray-600 mb-4">
                    {currentProblem.explanation}
                  </Text>

                  <div className="space-y-4">
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
                  ? "Yaxshi!"
                  : correctAnswers / gameStats.total >= 0.4
                  ? "O'rtacha!"
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
                    ? "🌟 Siz EKUB va EKUK ni mukammal bilasiz!"
                    : correctAnswers / gameStats.total >= 0.6
                    ? "✨ Yaxshi natija! Bo'linish qoidalarini takrorlang."
                    : correctAnswers / gameStats.total >= 0.4
                    ? "📚 EKUB va EKUK topish usullarini o'rganing."
                    : "💡 Sonlar nazariyasi asoslarini takrorlang."}
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
        title="EKUB va EKUK o'yini sozlamalari"
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
                min="60"
                max="180"
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
                {
                  key: "gcd",
                  label: "🔻 EKUB (Eng Katta Umumiy Bo'luvchi)",
                },
                {
                  key: "lcm",
                  label: "🔺 EKUK (Eng Kichik Umumiy Karrali)",
                },
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

export default GcdLcmGame;
