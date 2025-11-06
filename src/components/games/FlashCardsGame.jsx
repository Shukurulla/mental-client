import { useState, useRef, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Input,
  Space,
  Progress,
  Modal,
  Statistic,
  Select,
  Slider,
  Row,
  Col,
} from "antd";
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaArrowLeft,
  FaCog,
  FaTrophy,
  FaBrain,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { gamesAPI } from "../../utils/api";
import toast from "react-hot-toast";
import ProfessionalAbacus from "./ProfessionalAbacus";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * FLASH CARDS O'YINI - PROFESSIONAL VERSIYA
 * ==========================================
 * Bu o'yin vizual xotira va tez hisoblash qobiliyatlarini rivojlantiradi.
 * Dunyo standartlariga mos keluvchi mental arifmetika trenazhyori.
 */

const FlashCardsGame = () => {
  const navigate = useNavigate();
  const { updateUserStats } = useAuthStore();

  // O'YIN SOZLAMALARI
  const [settings, setSettings] = useState({
    mode: "training", // training (foydalanuvchi o'zi javob beradi) yoki presentation (auditoriya uchun)
    numberOfCards: 3, // Ketma-ketlikdagi kartalar soni (1-20)
    displaySpeed: 1000, // Har bir karta ko'rsatilish vaqti (ms)
    cardType: "soroban", // soroban, dots, numbers
    difficulty: "beginner", // beginner, intermediate, advanced
    numberRange: { min: 0, max: 9 }, // Raqamlar diapazoni
  });

  // O'YIN HOLATI
  const [gameState, setGameState] = useState("idle"); // idle, playing, paused, answering, result
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);

  // KARTALAR VA KETMA-KETLIK
  const [cardSequence, setCardSequence] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(false);

  // JAVOB VA NATIJALAR
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // STATISTIKA
  const [, setSessionStats] = useState({
    totalGames: 0,
    bestScore: 0,
    averageAccuracy: 0,
    totalTime: 0,
  });

  // MODAL VA BOSHQALAR
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  /**
   * RAQAM GENERATSIYA QILISH
   * Sozlamalarga asosan tasodifiy raqam yaratadi
   */
  const generateRandomNumber = useCallback(() => {
    const { min, max } = settings.numberRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [settings.numberRange]);

  /**
   * KARTALAR KETMA-KETLIGINI YARATISH
   * Yangi raund uchun kartalar to'plamini generatsiya qiladi
   */
  const generateCardSequence = useCallback(() => {
    const sequence = [];
    let sum = 0;

    for (let i = 0; i < settings.numberOfCards; i++) {
      const number = generateRandomNumber();
      sequence.push({
        id: i,
        number: number,
        timestamp: Date.now() + i * settings.displaySpeed,
      });
      sum += number;
    }

    setCardSequence(sequence);
    setCorrectAnswer(sum);
    return sequence;
  }, [settings.numberOfCards, settings.displaySpeed, generateRandomNumber]);

  /**
   * O'YINNI BOSHLASH
   */
  const startGame = () => {
    const sequence = generateCardSequence();
    setGameState("playing");
    setCurrentCardIndex(0);
    setIsCardVisible(false);
    setUserAnswer("");
    setRoundStartTime(Date.now());
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentRound(1);

    toast.success("Flash Cards o'yini boshlandi!", {
      icon: "🎮",
      duration: 2000,
    });

    // Birinchi kartani ko'rsatish uchun kichik kechikish
    setTimeout(() => {
      showNextCard(sequence, 0);
    }, 500);
  };

  /**
   * KEYINGI KARTANI KO'RSATISH
   */
  const showNextCard = (sequence, index) => {
    if (index >= sequence.length) {
      // Barcha kartalar ko'rsatildi - javob berish vaqti
      setGameState("answering");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }

    setCurrentCardIndex(index);
    setIsCardVisible(true);

    // Kartani belgilangan vaqt davomida ko'rsatish
    timerRef.current = setTimeout(() => {
      setIsCardVisible(false);

      // Keyingi kartaga o'tish uchun kichik pauza
      setTimeout(() => {
        showNextCard(sequence, index + 1);
      }, 300);
    }, settings.displaySpeed);
  };

  /**
   * JAVOBNI TEKSHIRISH VA SAQLASH
   */
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Iltimos, javobni kiriting!");
      return;
    }

    const userNum = parseInt(userAnswer, 10);
    const isCorrect = userNum === correctAnswer;
    const timeTaken = Math.floor((Date.now() - roundStartTime) / 1000);

    // Ball hisoblash (vaqt va qiyinchilikka qarab)
    let points = 0;
    if (isCorrect) {
      const basePoints = settings.numberOfCards * 10;
      const timeBonus = Math.max(0, 50 - timeTaken);
      points = basePoints + timeBonus;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
    }

    // Natijani backend'ga yuborish
    try {
      await gamesAPI.saveResult({
        gameType: "flashCards",
        score: score + points,
        level: currentRound,
        duration: timeTaken,
        correctAnswers: isCorrect ? 1 : 0,
        totalQuestions: 1,
        accuracy: isCorrect ? 100 : 0,
        metadata: {
          numberOfCards: settings.numberOfCards,
          cardType: settings.cardType,
          correctAnswer: correctAnswer,
          userAnswer: userNum,
        },
      });

      await updateUserStats();
    } catch (error) {
      console.error("Natijani saqlashda xato:", error);
      // Xatolikka qaramay o'yinni davom ettirish
    }

    // Natijani ko'rsatish
    setShowResult(true);
    setGameState("result");

    // Toast xabari
    if (isCorrect) {
      toast.success(`To'g'ri javob! +${points} ball`, {
        icon: "✅",
        duration: 3000,
      });
    } else {
      toast.error(`Noto'g'ri! To'g'ri javob: ${correctAnswer}`, {
        icon: "❌",
        duration: 3000,
      });
    }
  };

  /**
   * KEYINGI RAUNDGA O'TISH
   */
  const nextRound = () => {
    if (currentRound >= totalRounds) {
      // O'yin tugadi - yakuniy natijalar
      finishGame();
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setShowResult(false);
    setUserAnswer("");

    // Qiyinchilikni avtomatik oshirish (agar to'g'ri javob berilgan bo'lsa)
    if (parseInt(userAnswer) === correctAnswer) {
      autoAdjustDifficulty();
    }

    // Yangi ketma-ketlik yaratish
    const sequence = generateCardSequence();
    setGameState("playing");
    setCurrentCardIndex(0);
    setIsCardVisible(false);
    setRoundStartTime(Date.now());

    setTimeout(() => {
      showNextCard(sequence, 0);
    }, 500);
  };

  /**
   * QIYINCHILIKNI AVTOMATIK SOZLASH
   */
  const autoAdjustDifficulty = () => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      // Har 3 to'g'ri javobdan keyin kartalar sonini oshirish
      if (correctCount > 0 && correctCount % 3 === 0) {
        if (newSettings.numberOfCards < 10) {
          newSettings.numberOfCards += 1;
          toast.success(`Qiyinchilik oshirildi! Endi ${newSettings.numberOfCards} ta karta`, {
            icon: "📈",
          });
        }
      }

      // Har 5 to'g'ri javobdan keyin tezlikni oshirish
      if (correctCount > 0 && correctCount % 5 === 0) {
        if (newSettings.displaySpeed > 500) {
          newSettings.displaySpeed -= 100;
          toast.success("Tezlik oshirildi!", {
            icon: "⚡",
          });
        }
      }

      return newSettings;
    });
  };

  /**
   * O'YINNI TUGATISH
   */
  const finishGame = () => {
    const accuracy = totalRounds > 0 ? (correctCount / totalRounds) * 100 : 0;

    toast.success(
      `O'yin tugadi! To'g'ri: ${correctCount}/${totalRounds} (${accuracy.toFixed(1)}%)`,
      {
        icon: "🏆",
        duration: 5000,
      }
    );

    // Statistikani yangilash
    setSessionStats((prev) => ({
      totalGames: prev.totalGames + 1,
      bestScore: Math.max(prev.bestScore, score),
      averageAccuracy: (prev.averageAccuracy * prev.totalGames + accuracy) / (prev.totalGames + 1),
      totalTime: prev.totalTime + (Date.now() - roundStartTime) / 1000,
    }));

    setGameState("idle");
    setShowResult(false);
  };

  /**
   * O'YINNI TO'XTATISH
   */
  const stopGame = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setGameState("idle");
    setShowResult(false);
    setCurrentCardIndex(0);
    setIsCardVisible(false);
    toast("O'yin to'xtatildi", { icon: "⏸️" });
  };

  /**
   * O'YINNI QAYTA BOSHLASH
   */
  const resetGame = () => {
    stopGame();
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentRound(1);
    setUserAnswer("");
  };

  /**
   * SOZLAMALARNI SAQLASH
   */
  const handleSettingsSave = () => {
    setShowSettings(false);
    toast.success("Sozlamalar saqlandi!", { icon: "⚙️" });
  };

  /**
   * KARTA KOMPONENTLARI
   */

  // SOROBAN KARTA
  const SorobanCard = ({ number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-center items-center"
    >
      <ProfessionalAbacus number={number} showValue={false} />
    </motion.div>
  );

  // NUQTALAR KARTA
  const DotsCard = ({ number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center"
    >
      <div className="relative w-[280px] h-[280px]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-3xl shadow-2xl border-4 border-blue-200">
          {/* Nuqtalar grid */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <div className="grid grid-cols-3 gap-5">
              {Array.from({ length: 9 }, (_, i) => {
                const isActive = i < number;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="relative w-14 h-14"
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-lg opacity-40 animate-pulse" />
                    )}
                    <div
                      className={`relative w-full h-full rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 shadow-xl scale-110"
                          : "bg-gray-300 shadow-md"
                      }`}
                    >
                      {isActive && (
                        <>
                          <div className="absolute top-2 left-3 w-4 h-4 bg-white/60 rounded-full blur-sm" />
                          <div className="absolute inset-0 rounded-full shadow-inner" />
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // RAQAM KARTA
  const NumberCard = ({ number }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center"
    >
      <div className="w-[280px] h-[280px] bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl shadow-2xl border-4 border-green-300 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-9xl font-bold bg-gradient-to-br from-green-600 to-emerald-700 bg-clip-text text-transparent"
        >
          {number}
        </motion.div>
      </div>
    </motion.div>
  );

  /**
   * KARTANI RENDER QILISH
   */
  const renderCard = (number) => {
    switch (settings.cardType) {
      case "soroban":
        return <SorobanCard number={number} />;
      case "dots":
        return <DotsCard number={number} />;
      case "numbers":
        return <NumberCard number={number} />;
      default:
        return <SorobanCard number={number} />;
    }
  };

  /**
   * BO'SH KARTA (Kartalar orasidagi pauza)
   */
  const EmptyCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-[280px] h-[280px] border-4 border-dashed border-gray-300 rounded-3xl flex items-center justify-center bg-gray-50"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-6xl text-gray-400"
      >
        ●
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <Button
            icon={<FaArrowLeft />}
            onClick={() => navigate(-1)}
            size="large"
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Orqaga
          </Button>

          <div className="text-center flex-1">
            <Title level={2} className="mb-0 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Flash Cards - Mental Arifmetika
            </Title>
            <Text className="text-gray-600">
              Vizual xotira va tez hisoblash qobiliyatingizni rivojlantiring
            </Text>
          </div>

          <Button
            icon={<FaCog />}
            onClick={() => setShowSettings(true)}
            size="large"
            type="text"
            className="shadow-md hover:shadow-lg transition-shadow"
          />
        </div>

        {/* STATISTIKA PANELI */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={12} sm={6}>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <Statistic
                title={<span className="text-blue-700 font-semibold">Ball</span>}
                value={score}
                prefix={<FaTrophy className="text-yellow-500" />}
                valueStyle={{ color: "#2563eb", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <Statistic
                title={<span className="text-green-700 font-semibold">To'g'ri</span>}
                value={correctCount}
                suffix={`/ ${totalRounds}`}
                valueStyle={{ color: "#16a34a", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <Statistic
                title={<span className="text-red-700 font-semibold">Noto'g'ri</span>}
                value={wrongCount}
                valueStyle={{ color: "#dc2626", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <Statistic
                title={<span className="text-purple-700 font-semibold">Raund</span>}
                value={currentRound}
                suffix={`/ ${totalRounds}`}
                prefix={<FaBrain className="text-purple-500" />}
                valueStyle={{ color: "#9333ea", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        {/* ASOSIY O'YIN MAYDONI */}
        <Card className="shadow-2xl border-none min-h-[600px] bg-gradient-to-br from-white to-gray-50">
          <div className="flex flex-col items-center justify-center min-h-[500px] relative">
            {/* BOSHLANG'ICH HOLAT */}
            {gameState === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 max-w-2xl"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  🧮
                </motion.div>

                <Title level={3} className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Flash Cards o'yiniga xush kelibsiz!
                </Title>

                <Text className="text-gray-700 text-lg block mb-8">
                  Bu o'yin mental arifmetika ko'nikmalarini rivojlantiradi.
                  Kartalarni diqqat bilan kuzating va ularning yig'indisini hisoblang.
                </Text>

                {/* YO'RIQNOMA */}
                <Row gutter={[16, 16]} className="mb-8">
                  <Col xs={24} md={8}>
                    <Card className="h-full bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <div className="text-5xl mb-4">👁️</div>
                        <Title level={4} className="text-blue-700">1. Kuzating</Title>
                        <Text className="text-gray-600">
                          Har bir kartani diqqat bilan ko'ring va eslab qoling
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="h-full bg-purple-50 border-purple-200 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <div className="text-5xl mb-4">🧮</div>
                        <Title level={4} className="text-purple-700">2. Hisoblang</Title>
                        <Text className="text-gray-600">
                          Barcha kartalar yig'indisini aqliy ravishda hisoblang
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="h-full bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <div className="text-5xl mb-4">✍️</div>
                        <Title level={4} className="text-green-700">3. Javob bering</Title>
                        <Text className="text-gray-600">
                          To'g'ri javobni kiriting va ball to'plang
                        </Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Space size="large" className="mt-8">
                  <Button
                    type="primary"
                    size="large"
                    icon={<FaPlay />}
                    onClick={startGame}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none px-12 py-8 h-auto text-xl font-semibold shadow-xl hover:shadow-2xl transition-all"
                  >
                    O'yinni boshlash
                  </Button>
                </Space>
              </motion.div>
            )}

            {/* O'YIN DAVOM ETAYOTGAN VAQT */}
            {gameState === "playing" && (
              <div className="text-center space-y-8">
                <div className="mb-4">
                  <Text className="text-2xl font-semibold text-gray-700">
                    Karta {currentCardIndex + 1} / {settings.numberOfCards}
                  </Text>
                </div>

                <AnimatePresence mode="wait">
                  {isCardVisible && cardSequence[currentCardIndex] ? (
                    <div key={`card-${currentCardIndex}`}>
                      {renderCard(cardSequence[currentCardIndex].number)}
                    </div>
                  ) : (
                    <EmptyCard key="empty" />
                  )}
                </AnimatePresence>

                <Progress
                  percent={((currentCardIndex + 1) / settings.numberOfCards) * 100}
                  strokeColor={{
                    "0%": "#3b82f6",
                    "100%": "#6366f1",
                  }}
                  strokeWidth={12}
                  className="max-w-md mx-auto"
                />

                <Button
                  icon={<FaStop />}
                  onClick={stopGame}
                  size="large"
                  danger
                  className="mt-8"
                >
                  To'xtatish
                </Button>
              </div>
            )}

            {/* JAVOB BERISH VAQTI */}
            {gameState === "answering" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <Card className="max-w-md mx-auto p-8 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
                  <Title level={3} className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Javobingizni kiriting
                  </Title>

                  <Text className="text-gray-600 block mb-6">
                    {settings.numberOfCards} ta kartaning yig'indisi qancha?
                  </Text>

                  <Input
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onPressEnter={submitAnswer}
                    size="large"
                    placeholder="Javobingiz..."
                    className="text-center text-3xl font-bold mb-6 py-4"
                    autoFocus
                  />

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 text-lg font-semibold"
                  >
                    Javobni yuborish
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* NATIJA KO'RSATISH */}
            {gameState === "result" && showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card
                  className={`max-w-lg mx-auto p-8 shadow-2xl ${
                    parseInt(userAnswer) === correctAnswer
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300"
                      : "bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-300"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Title
                      level={2}
                      className={
                        parseInt(userAnswer) === correctAnswer
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {parseInt(userAnswer) === correctAnswer
                        ? "🎉 Ajoyib! To'g'ri javob!"
                        : "😔 Noto'g'ri javob"}
                    </Title>
                  </motion.div>

                  <div className="space-y-4 mt-8">
                    <div className="bg-white/70 p-4 rounded-xl shadow-md">
                      <Text className="text-gray-600">Sizning javobingiz:</Text>
                      <div className="text-3xl font-bold text-blue-700 mt-2">
                        {userAnswer}
                      </div>
                    </div>

                    <div className="bg-white/70 p-4 rounded-xl shadow-md">
                      <Text className="text-gray-600">To'g'ri javob:</Text>
                      <div className="text-3xl font-bold text-green-700 mt-2">
                        {correctAnswer}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl shadow-lg border-2 border-blue-300">
                      <Text className="text-gray-700 text-lg">Umumiy ball:</Text>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                        {score}
                      </div>
                    </div>
                  </div>

                  <Space size="middle" className="mt-8">
                    <Button
                      type="primary"
                      icon={<FaRedo />}
                      onClick={nextRound}
                      size="large"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 h-12"
                    >
                      {currentRound < totalRounds ? "Keyingi raund" : "Natijalarni ko'rish"}
                    </Button>
                    <Button
                      icon={<FaStop />}
                      onClick={resetGame}
                      size="large"
                      className="px-8 h-12"
                    >
                      To'xtatish
                    </Button>
                  </Space>
                </Card>
              </motion.div>
            )}
          </div>
        </Card>

        {/* SOZLAMALAR MODAL */}
        <Modal
          title={
            <Title level={3} className="mb-0">
              ⚙️ O'yin sozlamalari
            </Title>
          }
          open={showSettings}
          onCancel={() => setShowSettings(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowSettings(false)}>
              Bekor qilish
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSettingsSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Saqlash
            </Button>,
          ]}
          width={600}
        >
          <div className="space-y-6 py-4">
            {/* Karta turi */}
            <div>
              <Text strong className="block mb-2">
                Karta turi:
              </Text>
              <Select
                value={settings.cardType}
                onChange={(value) =>
                  setSettings((prev) => ({ ...prev, cardType: value }))
                }
                className="w-full"
                size="large"
              >
                <Option value="soroban">🧮 Soroban (Yapon abakus)</Option>
                <Option value="dots">⚫ Nuqtalar</Option>
                <Option value="numbers">🔢 Raqamlar</Option>
              </Select>
            </div>

            {/* Kartalar soni */}
            <div>
              <Text strong className="block mb-2">
                Kartalar soni: {settings.numberOfCards}
              </Text>
              <Slider
                min={1}
                max={20}
                value={settings.numberOfCards}
                onChange={(value) =>
                  setSettings((prev) => ({ ...prev, numberOfCards: value }))
                }
                marks={{ 1: "1", 5: "5", 10: "10", 15: "15", 20: "20" }}
              />
            </div>

            {/* Ko'rsatish tezligi */}
            <div>
              <Text strong className="block mb-2">
                Ko'rsatish tezligi: {(settings.displaySpeed / 1000).toFixed(1)}s
              </Text>
              <Slider
                min={300}
                max={3000}
                step={100}
                value={settings.displaySpeed}
                onChange={(value) =>
                  setSettings((prev) => ({ ...prev, displaySpeed: value }))
                }
                marks={{
                  300: "0.3s",
                  1000: "1s",
                  2000: "2s",
                  3000: "3s",
                }}
              />
            </div>

            {/* Raundlar soni */}
            <div>
              <Text strong className="block mb-2">
                Raundlar soni: {totalRounds}
              </Text>
              <Slider
                min={5}
                max={50}
                step={5}
                value={totalRounds}
                onChange={setTotalRounds}
                marks={{ 5: "5", 10: "10", 20: "20", 50: "50" }}
              />
            </div>

            {/* Raqamlar diapazoni */}
            <div>
              <Text strong className="block mb-2">
                Raqamlar diapazoni: {settings.numberRange.min} - {settings.numberRange.max}
              </Text>
              <Slider
                range
                min={0}
                max={99}
                value={[settings.numberRange.min, settings.numberRange.max]}
                onChange={([min, max]) =>
                  setSettings((prev) => ({
                    ...prev,
                    numberRange: { min, max },
                  }))
                }
                marks={{ 0: "0", 9: "9", 50: "50", 99: "99" }}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FlashCardsGame;
