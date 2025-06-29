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
  Statistic,
} from "antd";
import { FaPlay, FaStop, FaRedo, FaArrowLeft, FaCog } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { gamesAPI } from "../../utils/api";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const FlashCardsGame = () => {
  const navigate = useNavigate();
  const { updateUserStats } = useAuthStore();

  // Game settings
  const [settings, setSettings] = useState({
    mode: "single", // single, audience
    sequenceLength: 1, // Start with 1 card
    displayTime: 1000, // milliseconds
    cardType: "soroban", // soroban, dots
  });

  // Game state
  const [gameState, setGameState] = useState("idle"); // idle, playing, input, result
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    bestScore: 0,
    averageScore: 0,
  });

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Generate random number (0-9 for single digit cards)
  const generateNumber = useCallback(() => {
    return Math.floor(Math.random() * 10);
  }, []);

  // Generate card display segments (like in soroban)
  const generateCardSegments = useCallback((number) => {
    // Generate segments for soroban display
    const segments = Array(7).fill(1);

    // Hide random segments but keep the pattern recognizable
    const segmentsToHide = Math.floor(Math.random() * 2) + 1; // Hide 1-2 segments
    const hideIndices = [];

    while (hideIndices.length < segmentsToHide) {
      const randomIndex = Math.floor(Math.random() * 7);
      if (!hideIndices.includes(randomIndex)) {
        hideIndices.push(randomIndex);
        segments[randomIndex] = 0;
      }
    }

    return segments;
  }, []);

  // Generate sequence
  const generateSequence = useCallback(() => {
    const newSequence = [];
    let total = 0;

    for (let i = 0; i < settings.sequenceLength; i++) {
      const number = generateNumber();
      const cardData = {
        number: number,
        segments: generateCardSegments(number),
      };
      newSequence.push(cardData);
      total += number;
    }

    setSequence(newSequence);
    setCorrectAnswer(total);
    setCurrentIndex(0);
  }, [settings.sequenceLength, generateNumber, generateCardSegments]);

  // Start game
  const startGame = () => {
    generateSequence();
    setGameState("playing");
    setGameStartTime(Date.now());
    setScore(0);
    setCurrentIndex(0);
    toast.success("Flash Cards o'yini boshlandi!");
  };

  // Display sequence
  useEffect(() => {
    if (gameState !== "playing" || currentIndex >= sequence.length) return;

    setCurrentCard(sequence[currentIndex]);

    timerRef.current = setTimeout(() => {
      setCurrentCard(null);

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
  }, [gameState, currentIndex, sequence, settings.displayTime]);

  // Submit answer
  const submitAnswer = async () => {
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);

    let newScore = score;
    if (isCorrect) {
      newScore = score + settings.sequenceLength * 100;
      setScore(newScore);
    }

    // Save result to backend
    try {
      await gamesAPI.submitResult("flashCards", {
        score: newScore,
        level: level,
        duration: duration,
        correctAnswers: isCorrect ? 1 : 0,
        totalQuestions: 1,
        settings: settings,
        gameData: {
          sequence: sequence,
          userAnswer: parseInt(userAnswer),
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
        },
      });

      updateUserStats({
        totalScore: newScore,
        gamesPlayed: 1,
      });

      // Update local stats
      setGameStats((prev) => ({
        totalGames: prev.totalGames + 1,
        bestScore: Math.max(prev.bestScore, newScore),
        averageScore:
          (prev.averageScore * prev.totalGames + newScore) /
          (prev.totalGames + 1),
      }));
    } catch (error) {
      console.error("Error saving game result:", error);
      toast.error("Natijani saqlashda xato");
    }

    setGameState("result");
    setShowResult(true);

    if (isCorrect) {
      toast.success("To'g'ri javob!");
    } else {
      toast.error("Noto'g'ri javob!");
    }
  };

  // Next round
  const nextRound = () => {
    if (parseInt(userAnswer) === correctAnswer && level < 20) {
      setLevel((prev) => prev + 1);
      // Increase difficulty
      if (level % 3 === 0 && settings.sequenceLength < 10) {
        setSettings((prev) => ({
          ...prev,
          sequenceLength: prev.sequenceLength + 1,
        }));
      }
      if (level % 5 === 0 && settings.displayTime > 300) {
        setSettings((prev) => ({
          ...prev,
          displayTime: prev.displayTime - 100,
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

  // Reset game
  const resetGame = () => {
    setGameState("idle");
    setLevel(1);
    setScore(0);
    setSequence([]);
    setCurrentIndex(0);
    setCurrentCard(null);
    setUserAnswer("");
    setShowResult(false);
  };

  // Soroban Card Component
  const SorobanCard = ({ segments }) => (
    <div className="w-[150px] relative h-[300px] py-2 border-4 rounded-2xl border-gray-600 bg-yellow-100">
      {/* Central rod */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[4px] bg-gray-600 h-full"></div>
      {/* Horizontal separator */}
      <div className="absolute top-[90px] left-1/2 transform -translate-x-1/2 w-full h-[4px] bg-gray-600"></div>

      {/* Beads */}
      {segments.map((visible, index) => (
        <div
          key={index}
          className={`mb-2 ${
            index === 1 ? "mb-4" : ""
          } flex relative z-20 items-center justify-center ${
            index < 2 ? "mt-2" : ""
          }`}
          style={{ opacity: visible ? 1 : 0.2 }}
        >
          <div className="w-[30px] h-[30px] bg-red-500 rounded-full border-2 border-red-700"></div>
        </div>
      ))}
    </div>
  );

  // Dots Card Component
  const DotsCard = ({ number }) => (
    <div className="w-[200px] h-[200px] border-4 rounded-2xl border-gray-600 bg-blue-50 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full ${
              i < number ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🃏 Flash Cards
        </Title>
        <Text className="text-gray-600 text-lg">
          Kartalar orqali tez hisoblash qobiliyatini rivojlantiring
        </Text>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic title="Ball" value={score} />
        </Card>
        <Card className="text-center">
          <Statistic title="Daraja" value={level} />
        </Card>
        <Card className="text-center">
          <Statistic title="Eng yaxshi" value={gameStats.bestScore} />
        </Card>
        <Card className="text-center">
          <Statistic
            title="O'rtacha"
            value={Math.round(gameStats.averageScore)}
          />
        </Card>
      </div>

      {/* Game Area */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-none shadow-game min-h-[500px]">
        <div className="flex flex-col items-center justify-center h-full">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl mb-4">🃏</div>
              <Title level={3}>Flash Cards o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Bu o'yin vizual xotira va tez hisoblash qobiliyatlaringizni
                rivojlantiradi. Kartalarni ko'rib, ulardagi raqamlarni qo'shing.
              </Text>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-lg">
                <Card className="bg-white/70">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👀</div>
                    <Text strong>Kuzating</Text>
                    <Text className="text-xs text-gray-600 block">
                      Kartadagi raqamni diqqat bilan ko'ring
                    </Text>
                  </div>
                </Card>
                <Card className="bg-white/70">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🧮</div>
                    <Text strong>Hisoblang</Text>
                    <Text className="text-xs text-gray-600 block">
                      Barcha kartalar yig'indisini toping
                    </Text>
                  </div>
                </Card>
                <Card className="bg-white/70">
                  <div className="text-center">
                    <div className="text-2xl mb-2">✍️</div>
                    <Text strong>Javob bering</Text>
                    <Text className="text-xs text-gray-600 block">
                      Jami natijani kiriting
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
              className="text-center"
            >
              <div className="mb-4">
                {currentCard ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-center"
                  >
                    {settings.cardType === "soroban" ? (
                      <SorobanCard segments={currentCard.segments} />
                    ) : (
                      <DotsCard number={currentCard.number} />
                    )}
                  </motion.div>
                ) : (
                  <div className="w-[200px] h-[200px] border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                    <div className="text-4xl text-gray-300">●</div>
                  </div>
                )}
              </div>

              <Progress
                percent={((currentIndex + 1) / sequence.length) * 100}
                className="mt-4"
                strokeColor="#52c41a"
              />

              <div className="flex justify-center mt-6">
                <Button icon={<FaStop />} onClick={resetGame} className="px-6">
                  To'xtatish
                </Button>
              </div>
            </motion.div>
          )}

          {/* Input State */}
          {gameState === "input" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Card className="min-w-[300px] p-6">
                <Title level={3} className="mb-4">
                  {settings.mode === "single"
                    ? "Javobingizni kiriting"
                    : "Auditoriya uchun"}
                </Title>

                {settings.mode === "single" ? (
                  <>
                    <Input
                      ref={inputRef}
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onPressEnter={submitAnswer}
                      size="large"
                      className="text-center text-xl mb-4"
                      placeholder="Jami..."
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
                  </>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => {
                      setShowResult(true);
                      setGameState("result");
                    }}
                  >
                    Javobni ko'rsatish
                  </Button>
                )}
              </Card>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === "result" && showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="min-w-[300px] p-6">
                <div className="mb-4">
                  {settings.mode === "single" ? (
                    <Title level={3}>
                      {parseInt(userAnswer) === correctAnswer
                        ? "✅ To'g'ri!"
                        : "❌ Noto'g'ri"}
                    </Title>
                  ) : (
                    <Title level={3}>Natija</Title>
                  )}

                  <div className="text-lg space-y-2">
                    {settings.mode === "single" && (
                      <div>
                        Sizning javobingiz: <strong>{userAnswer}</strong>
                      </div>
                    )}
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
                  <Button icon={<FaStop />} onClick={resetGame} size="large">
                    To'xtatish
                  </Button>
                </Space>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="Flash Cards sozlamalari"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        className="settings-modal"
      >
        <div className="space-y-4">
          <div>
            <Text strong>O'yin rejimi:</Text>
            <div className="flex gap-2 mt-2">
              {[
                { value: "single", label: "Yakka" },
                { value: "audience", label: "Auditoriya" },
              ].map((mode) => (
                <Button
                  key={mode.value}
                  type={settings.mode === mode.value ? "primary" : "default"}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, mode: mode.value }))
                  }
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Text strong>Kartalar soni:</Text>
            <div className="flex gap-2 mt-2">
              {[1, 3, 5, 7, 10].map((length) => (
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
            <Text strong>Karta turi:</Text>
            <div className="flex gap-2 mt-2">
              {[
                { value: "soroban", label: "Soroban" },
                { value: "dots", label: "Nuqtalar" },
              ].map((type) => (
                <Button
                  key={type.value}
                  type={
                    settings.cardType === type.value ? "primary" : "default"
                  }
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, cardType: type.value }))
                  }
                >
                  {type.label}
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

export default FlashCardsGame;
