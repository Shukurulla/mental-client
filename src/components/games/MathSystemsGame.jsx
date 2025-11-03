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
  Select,
  Tag,
} from "antd";
import { FaPlay, FaStop, FaRedo, FaCog, FaCalculator } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

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
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
  });
  const [settings, setSettings] = useState({
    mode: "formulasiz", // formulasiz, 5lik, 10liq, aralas
    digitType: "1xonali", // 1xonali, 2xonali, 3xonali, aralas
    rowCount: 5, // 5, 6, 7, 8, 9, 10
    timeLimit: 90,
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

  // Generate numbers based on digit type
  const generateNumber = (digitType) => {
    switch (digitType) {
      case "1xonali":
        return Math.floor(Math.random() * 9) + 1; // 1-9
      case "2xonali":
        return Math.floor(Math.random() * 90) + 10; // 10-99
      case "3xonali":
        return Math.floor(Math.random() * 900) + 100; // 100-999
      case "aralas":
        const types = ["1xonali", "2xonali", "3xonali"];
        return generateNumber(types[Math.floor(Math.random() * types.length)]);
      default:
        return Math.floor(Math.random() * 9) + 1;
    }
  };

  // Apply 5lik formula
  const apply5Formula = (num) => {
    // +1 = +5-4, +2 = +5-3, +3 = +5-2, +4 = +5-1
    // -1 = -5+4, -2 = -5+3, -3 = -5+2, -4 = -5+1
    const formulas = [
      { original: num, formula: `+${num}`, result: num },
      { original: num, formula: `+5-${5 - num}`, result: num },
      { original: -num, formula: `-${num}`, result: -num },
      { original: -num, formula: `-5+${5 - num}`, result: -num },
    ];

    // 1-4 sonlari uchun 5lik formula
    if (num >= 1 && num <= 4) {
      return formulas[Math.floor(Math.random() * 2)]; // + yoki - variantdan birini tanlash
    }
    return { original: num, formula: `+${num}`, result: num };
  };

  // Apply 10liq formula (kengaytirilgan 2 va 3 xonali sonlar uchun)
  const apply10Formula = (num) => {
    // 1 xonali sonlar uchun: +9 = -1+10, +8 = -2+10, ...
    if (num >= 6 && num <= 9) {
      const formulas = [
        { original: num, formula: `+${num}`, result: num },
        { original: num, formula: `-${10 - num}+10`, result: num },
        { original: -num, formula: `-${num}`, result: -num },
        { original: -num, formula: `+${10 - num}-10`, result: -num },
      ];
      return formulas[Math.floor(Math.random() * 2)];
    }

    // 2 xonali sonlar uchun: +10 = +50-40, +20 = +50-30, ...
    if (num >= 10 && num <= 99) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;

      if (tens >= 10 && tens <= 40) {
        // 10, 20, 30, 40 uchun formula
        const formulas = [
          { original: num, formula: `+${num}`, result: num },
          { original: num, formula: `+50-${50 - tens}`, result: num },
        ];
        return formulas[Math.floor(Math.random() * formulas.length)];
      } else if (tens >= 60 && tens <= 90) {
        // 60, 70, 80, 90 uchun formula
        const formulas = [
          { original: num, formula: `+${num}`, result: num },
          { original: num, formula: `-${100 - tens}+100`, result: num },
        ];
        return formulas[Math.floor(Math.random() * formulas.length)];
      }
    }

    // 3 xonali sonlar uchun: +100 = +500-400, +200 = +500-300, ...
    if (num >= 100 && num <= 999) {
      const hundreds = Math.floor(num / 100) * 100;

      if (hundreds >= 100 && hundreds <= 400) {
        // 100, 200, 300, 400 uchun formula
        const formulas = [
          { original: num, formula: `+${num}`, result: num },
          { original: num, formula: `+500-${500 - hundreds}`, result: num },
        ];
        return formulas[Math.floor(Math.random() * formulas.length)];
      } else if (hundreds >= 600 && hundreds <= 900) {
        // 600, 700, 800, 900 uchun formula
        const formulas = [
          { original: num, formula: `+${num}`, result: num },
          { original: num, formula: `-${1000 - hundreds}+1000`, result: num },
        ];
        return formulas[Math.floor(Math.random() * formulas.length)];
      }
    }

    return { original: num, formula: `+${num}`, result: num };
  };

  // Apply formula based on mode
  const applyFormula = (num, mode) => {
    switch (mode) {
      case "5lik":
        return apply5Formula(num);
      case "10liq":
        return apply10Formula(num);
      case "aralas":
        // 5lik va 10liq formulalarni aralash
        if (num >= 1 && num <= 4) {
          return apply5Formula(num);
        } else if (num >= 6 && num <= 9) {
          return apply10Formula(num);
        }
        return { original: num, formula: `+${num}`, result: num };
      case "formulasiz":
      default:
        // Oddiy qo'shish/ayirish
        const isPositive = Math.random() > 0.5;
        return {
          original: num,
          formula: isPositive ? `+${num}` : `-${num}`,
          result: isPositive ? num : -num,
        };
    }
  };

  // Generate math problems
  const generateProblems = useCallback(() => {
    const problemCount = 10 + level * 2;
    const generatedProblems = [];

    for (let i = 0; i < problemCount; i++) {
      const numbers = [];
      let sum = 0;

      // Har bir qator uchun sonlar generatsiya qilish
      for (let j = 0; j < settings.rowCount; j++) {
        const num = generateNumber(settings.digitType);
        const formulaData = applyFormula(num, settings.mode);
        numbers.push(formulaData);
        sum += formulaData.result;
      }

      generatedProblems.push({
        numbers,
        answer: sum,
        display: numbers.map(n => n.formula).join(" "),
      });
    }

    return generatedProblems;
  }, [level, settings]);

  const startGame = () => {
    const generatedProblems = generateProblems();
    setProblems(generatedProblems);
    setCurrentProblem(generatedProblems[0]);
    setProblemIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setUserAnswer("");
    setTimeLeft(settings.timeLimit);
    setStartTime(Date.now());
    setGameState("playing");
    setGameStats({ correct: 0, total: 0 });
  };

  const checkAnswer = () => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;

    if (isCorrect) {
      setScore(score + 10 * level);
      setCorrectAnswers(correctAnswers + 1);
      setGameStats({
        correct: gameStats.correct + 1,
        total: gameStats.total + 1,
      });
      toast.success("To'g'ri! 🎉");
    } else {
      setGameStats({
        ...gameStats,
        total: gameStats.total + 1,
      });
      toast.error(`Noto'g'ri. To'g'ri javob: ${currentProblem.answer}`);
    }

    // Next problem
    if (problemIndex < problems.length - 1) {
      setProblemIndex(problemIndex + 1);
      setCurrentProblem(problems[problemIndex + 1]);
      setUserAnswer("");
    } else {
      // Level completed
      if (correctAnswers >= problems.length * 0.7) {
        setLevel(level + 1);
        toast.success("Daraja oshdi! 🎯");
        const newProblems = generateProblems();
        setProblems(newProblems);
        setProblemIndex(0);
        setCurrentProblem(newProblems[0]);
        setUserAnswer("");
      } else {
        endGame();
      }
    }
  };

  const endGame = async () => {
    setGameState("result");
    const duration = Date.now() - startTime;

    try {
      await gamesAPI.saveResult({
        gameType: "mathSystems",
        score,
        level,
        duration,
        correctAnswers,
        totalQuestions: gameStats.total,
        accuracy: gameStats.total > 0 ? (gameStats.correct / gameStats.total) * 100 : 0,
      });

      await updateUserStats();
      toast.success("Natijangiz saqlandi!");
    } catch (error) {
      console.error("Failed to save result:", error);
      toast.error("Natijani saqlashda xatolik");
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setLevel(1);
    setProblems([]);
    setCurrentProblem(null);
    setProblemIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setUserAnswer("");
    setTimeLeft(settings.timeLimit);
    setGameStats({ correct: 0, total: 0 });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && gameState === "playing") {
      checkAnswer();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🧮 Hisoblash Tizimlari
        </Title>
        <Text className="text-gray-600 text-lg">
          Turli formulalar yordamida tez hisoblashni o'rganing
        </Text>
      </div>

      {/* Mode Display */}
      <div className="text-center mb-4">
        <Space size="middle">
          <Tag color="blue" className="text-lg px-3 py-1">
            Rejim: {settings.mode === "formulasiz" ? "Formulasiz" :
                    settings.mode === "5lik" ? "5lik formula" :
                    settings.mode === "10liq" ? "10liq formula" : "Aralas formula"}
          </Tag>
          <Tag color="green" className="text-lg px-3 py-1">
            Xonalar: {settings.digitType === "aralas" ? "Aralash" : settings.digitType}
          </Tag>
          <Tag color="orange" className="text-lg px-3 py-1">
            Qatorlar: {settings.rowCount}
          </Tag>
        </Space>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic title="Daraja" value={level} />
        </Card>
        <Card className="text-center">
          <Statistic title="Ball" value={score} />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Vaqt"
            value={timeLeft}
            suffix="s"
            valueStyle={{ color: timeLeft < 10 ? "#ff4d4f" : "#1890ff" }}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Aniqlik"
            value={gameStats.total > 0 ? Math.round((gameStats.correct / gameStats.total) * 100) : 0}
            suffix="%"
          />
        </Card>
      </div>

      {/* Main Game Area */}
      <Card className="mb-6" style={{ minHeight: 400 }}>
        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-96"
            >
              <div className="text-6xl mb-4">🧮</div>
              <Title level={3}>Hisoblashga tayyormisiz?</Title>
              <Text className="text-gray-600 mb-6">
                Turli formulalar yordamida tez hisoblashni mashq qiling
              </Text>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaPlay />}
                  onClick={startGame}
                  className="px-8"
                >
                  Boshlash
                </Button>
                <Button
                  size="large"
                  icon={<FaCog />}
                  onClick={() => setShowSettings(true)}
                >
                  Sozlamalar
                </Button>
              </Space>
            </motion.div>
          )}

          {gameState === "playing" && currentProblem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-96"
            >
              <div className="mb-4">
                <Progress
                  percent={(problemIndex / problems.length) * 100}
                  showInfo={false}
                  strokeColor="#52c41a"
                />
                <Text className="text-gray-600 text-sm mt-2">
                  {problemIndex + 1} / {problems.length} savol
                </Text>
              </div>

              <div className="text-center mb-8">
                <div className="bg-blue-50 p-8 rounded-lg mb-4">
                  <Text className="text-3xl font-bold text-gray-800">
                    {currentProblem.display} = ?
                  </Text>
                </div>

                {/* Formula hint for learning */}
                {settings.mode !== "formulasiz" && (
                  <div className="mb-4">
                    {currentProblem.numbers.map((n, idx) => (
                      <Tag key={idx} color="cyan" className="m-1">
                        {n.formula}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Input
                  size="large"
                  placeholder="Javobingiz"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-48 text-center text-xl"
                  autoFocus
                  type="number"
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={checkAnswer}
                  disabled={!userAnswer}
                >
                  Tekshirish
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "result" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">
                {score >= 100 ? "🏆" : score >= 50 ? "🎉" : "💪"}
              </div>
              <Title level={2} className="mb-4">
                O'yin tugadi!
              </Title>
              <div className="mb-6">
                <Statistic
                  title="Yakuniy ball"
                  value={score}
                  className="mb-4"
                />
                <Text className="text-lg block mb-2">
                  To'g'ri javoblar: {gameStats.correct} / {gameStats.total}
                </Text>
                <Text className="text-lg block">
                  Aniqlik: {gameStats.total > 0 ? Math.round((gameStats.correct / gameStats.total) * 100) : 0}%
                </Text>
              </div>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaRedo />}
                  onClick={resetGame}
                >
                  Qayta o'ynash
                </Button>
                <Button
                  size="large"
                  icon={<FaCog />}
                  onClick={() => {
                    setShowSettings(true);
                    resetGame();
                  }}
                >
                  Sozlamalarni o'zgartirish
                </Button>
              </Space>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Game Controls */}
      {gameState === "playing" && (
        <div className="flex justify-center space-x-4">
          <Button
            danger
            size="large"
            icon={<FaStop />}
            onClick={endGame}
          >
            To'xtatish
          </Button>
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        title="Hisoblash tizimlari sozlamalari"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <Text strong className="block mb-2">
              Hisoblash rejimi:
            </Text>
            <Radio.Group
              value={settings.mode}
              onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
              className="space-y-2"
            >
              <Radio value="formulasiz" className="block">
                Formulasiz (oddiy qo'shish/ayirish)
              </Radio>
              <Radio value="5lik" className="block">
                5lik formula (+1=+5-4, +2=+5-3, ...)
              </Radio>
              <Radio value="10liq" className="block">
                10liq formula (+9=-1+10, +8=-2+10, ...)
              </Radio>
              <Radio value="aralas" className="block">
                Aralas formula (5lik va 10liq)
              </Radio>
            </Radio.Group>
          </div>

          <div>
            <Text strong className="block mb-2">
              Sonlar xonasi:
            </Text>
            <Radio.Group
              value={settings.digitType}
              onChange={(e) => setSettings({ ...settings, digitType: e.target.value })}
              className="space-y-2"
            >
              <Radio value="1xonali" className="block">1 xonali (1-9)</Radio>
              <Radio value="2xonali" className="block">2 xonali (10-99)</Radio>
              <Radio value="3xonali" className="block">3 xonali (100-999)</Radio>
              <Radio value="aralas" className="block">Aralash</Radio>
            </Radio.Group>
          </div>

          <div>
            <Text strong className="block mb-2">
              Qatorlar soni:
            </Text>
            <Select
              value={settings.rowCount}
              onChange={(value) => setSettings({ ...settings, rowCount: value })}
              className="w-full"
            >
              <Select.Option value={5}>5 qator</Select.Option>
              <Select.Option value={6}>6 qator</Select.Option>
              <Select.Option value={7}>7 qator</Select.Option>
              <Select.Option value={8}>8 qator</Select.Option>
              <Select.Option value={9}>9 qator</Select.Option>
              <Select.Option value={10}>10 qator</Select.Option>
            </Select>
          </div>

          <div>
            <Text strong className="block mb-2">
              Vaqt chegarasi:
            </Text>
            <Radio.Group
              value={settings.timeLimit}
              onChange={(e) => setSettings({ ...settings, timeLimit: e.target.value })}
            >
              <Radio value={60}>60 soniya</Radio>
              <Radio value={90}>90 soniya</Radio>
              <Radio value={120}>120 soniya</Radio>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            block
            onClick={() => setShowSettings(false)}
          >
            Saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MathSystemsGame;