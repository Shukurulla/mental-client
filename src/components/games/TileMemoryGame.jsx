// components/games/TileMemoryGame.jsx - Plitkalar o'yini
import { useState } from "react";
import { Card, Button, Progress, Typography, Space, message, Modal, Slider } from "antd";
import { FaPlay, FaStop, FaLightbulb, FaCog } from "react-icons/fa";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const TileMemoryGame = () => {
  const [gameState, setGameState] = useState("waiting");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [gridSize, setGridSize] = useState(3); // 3x3 grid (standart)
  const [maxPattern, setMaxPattern] = useState(5); // Maksimal topish kerak bo'lgan plitkalar
  const [mode, setMode] = useState("sequential"); // sequential, random
  const [showSettings, setShowSettings] = useState(false);

  // Fisher-Yates shuffle algoritmi
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generatePattern = (currentLevel) => {
    const totalTiles = gridSize * gridSize;
    // Pattern uzunligi: Birinchi levelda maxPattern ni ishlatamiz, keyin level oshganda oshadi
    // Lekin hech qachon maxPattern dan oshmaydi
    const basePattern = Math.min(maxPattern, totalTiles - 1);
    const patternSize = Math.min(basePattern + (currentLevel - 1), maxPattern, totalTiles - 1);
    const newPattern = [];

    // Barcha mumkin bo'lgan plitkalarni yaratish
    const allTiles = Array.from({ length: totalTiles }, (_, i) => i);

    if (mode === "random") {
      // Haqiqiy tasodifiy tartib
      const shuffled = shuffleArray(allTiles);
      for (let i = 0; i < patternSize; i++) {
        newPattern.push(shuffled[i]);
      }
    } else {
      // Oddiy tasodifiy tanlov (sequential mode)
      while (newPattern.length < patternSize) {
        const tile = Math.floor(Math.random() * totalTiles);
        if (!newPattern.includes(tile)) {
          newPattern.push(tile);
        }
      }
    }

    return newPattern;
  };

  const startGame = () => {
    const newPattern = generatePattern(level);
    setPattern(newPattern);
    setUserPattern([]);
    setShowingPattern(true);
    setGameState("showing");

    // Pattern ko'rsatish vaqti
    const showTime = Math.max(2000 - level * 100, 500);
    setTimeout(() => {
      setShowingPattern(false);
      setGameState("playing");
      message.info("Endi plitkalarni bosing!");
    }, showTime);
  };

  const handleTileClick = (tileIndex) => {
    if (gameState !== "playing") return;

    // Agar bu plitka allaqachon bosilgan bo'lsa, qayta bosib bo'lmaydi
    if (userPattern.includes(tileIndex)) {
      message.warning("Bu plitkani allaqachon tanladingiz!");
      return;
    }

    // Faqat pattern ichida borligini tekshirish (tartib muhim emas)
    const isInPattern = pattern.includes(tileIndex);

    if (!isInPattern) {
      // Noto'g'ri - bu karta pattern ichida yo'q
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setGameState("finished");
        message.error("O'yin tugadi! Jon qolmadi.");
      } else {
        message.error(`Noto'g'ri! Bu karta ko'k emas edi. ${newLives} jon qoldi.`);
        // To'g'ri topilgan plitkalarni saqlab qolamiz
      }
      return;
    }

    // To'g'ri - bu karta pattern ichida bor!
    const newUserPattern = [...userPattern, tileIndex];
    setUserPattern(newUserPattern);

    // Barcha to'g'ri kartalar tanlandimi?
    if (newUserPattern.length === pattern.length) {
      setScore(score + pattern.length * 50);
      setLevel(level + 1);
      message.success(`Ajoyib! Barcha kartalarni topdingiz! Keyingi daraja: ${level + 1}`);
      setTimeout(() => {
        startGame();
      }, 1500);
    } else {
      // Hali yakunlanmagan, to'g'ri yo'ldasiz
      message.success(`To'g'ri! ${newUserPattern.length}/${pattern.length} topildi`);
    }
  };

  const renderGrid = () => {
    const tiles = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
      // MUHIM: Faqat showingPattern TRUE bo'lganda VA bu index pattern ichida bo'lsa ko'k
      const shouldShowBlue = showingPattern === true && pattern.includes(i);
      const isClickedByUser = userPattern.includes(i);

      tiles.push(
        <motion.button
          key={i}
          className={`
            relative w-full aspect-square rounded-lg border-2 transition-all duration-300 font-bold text-xl
            ${
              shouldShowBlue
                ? "bg-blue-500 border-blue-600 text-white shadow-lg"
                : isClickedByUser
                ? "bg-green-400 border-green-500 text-white shadow-md"
                : "bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-600 shadow-sm"
            }
            ${gameState === "playing" ? "cursor-pointer active:scale-95" : "cursor-default"}
          `}
          onClick={() => handleTileClick(i)}
          whileHover={gameState === "playing" ? { scale: 1.05 } : {}}
          whileTap={gameState === "playing" ? { scale: 0.95 } : {}}
          disabled={gameState !== "playing"}
        >
          {/* Kartalar endi bo'sh */}
        </motion.button>
      );
    }

    return (
      <div
        className={`grid gap-3 max-w-2xl mx-auto`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
        }}
      >
        {tiles}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        {/* Game Header */}
        <div className="text-center mb-6">
          <Title level={2}>🎯 Plitkalar Xotirasi</Title>
          <Text className="text-gray-600">
            Ko'k bo'lgan plitkalarni eslab qoling va ularni toping (tartib muhim emas)
          </Text>

          {/* Mode selector */}
          {gameState === "waiting" && (
            <div className="mt-4">
              <Text strong className="block mb-2">
                Rejim tanlang:
              </Text>
              <Space>
                <Button
                  type={mode === "sequential" ? "primary" : "default"}
                  onClick={() => setMode("sequential")}
                >
                  Ketma-ket
                </Button>
                <Button
                  type={mode === "random" ? "primary" : "default"}
                  onClick={() => setMode("random")}
                >
                  Haqiqiy Tasodifiy
                </Button>
                <Button
                  icon={<FaCog />}
                  onClick={() => setShowSettings(true)}
                >
                  Sozlamalar
                </Button>
              </Space>
            </div>
          )}
        </div>

        {/* Game Stats */}
        <div className="flex justify-center mb-6">
          <Space size="large">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{level}</div>
              <div className="text-sm text-gray-500">Daraja</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-500">Ball</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lives}</div>
              <div className="text-sm text-gray-500">Jonlar</div>
            </div>
          </Space>
        </div>

        {/* Game Instructions */}
        <div className="text-center mb-6">
          {gameState === "waiting" && (
            <div>
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                <FaLightbulb className="text-yellow-500" />
                <Text>
                  Ko'k bo'lgan plitkalarni kuzatib, ularni istalgan tartibda toping
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<FaPlay />}
                onClick={startGame}
                className="px-8"
              >
                O'yinni boshlash
              </Button>
            </div>
          )}

          {gameState === "showing" && (
            <div>
              <Text className="text-lg font-medium text-blue-600 mb-4 block">
                🔍 Diqqat bilan kuzating... ({pattern.length} ta plitka)
              </Text>
              <Progress
                percent={100}
                showInfo={false}
                strokeColor="#3b82f6"
                className="max-w-md mx-auto"
              />
            </div>
          )}

          {gameState === "playing" && (
            <Text className="text-lg font-medium text-green-600">
              👆 Ko'k bo'lgan plitkalarni toping ({userPattern.length}/{pattern.length} topildi)
            </Text>
          )}
        </div>

        {/* Game Grid */}
        <div className="mb-6">{renderGrid()}</div>

        {/* Controls */}
        {gameState === "playing" && (
          <div className="text-center">
            <Space>
              <Button
                danger
                icon={<FaStop />}
                onClick={() => setGameState("finished")}
              >
                O'yinni to'xtatish
              </Button>
              <Button
                onClick={() => {
                  // Pattern'ni qayta ko'rsatish
                  setUserPattern([]);
                  setShowingPattern(true);
                  setGameState("showing");

                  message.info("Pattern qayta ko'rsatilmoqda...");

                  const showTime = Math.max(2000 - level * 100, 500);
                  setTimeout(() => {
                    setShowingPattern(false);
                    setGameState("playing");
                    message.info("Endi plitkalarni bosing!");
                  }, showTime);
                }}
              >
                Qayta ko'rsatish
              </Button>
            </Space>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="mb-4">
              <Text className="text-lg">
                O'yin tugadi! Sizning natijangiz: <strong>{score}</strong> ball
              </Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<FaPlay />}
                onClick={() => {
                  setLevel(1);
                  setScore(0);
                  setLives(3);
                  setGameState("waiting");
                }}
              >
                Qayta o'ynash
              </Button>
              <Button onClick={() => window.history.back()}>Chiqish</Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Sozlamalar Modal */}
      <Modal
        title="Sozlamalar"
        open={showSettings}
        onOk={() => setShowSettings(false)}
        onCancel={() => setShowSettings(false)}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <div className="space-y-6">
          <div>
            <Text strong className="block mb-2">
              Plitkalar soni: {gridSize}x{gridSize} ({gridSize * gridSize} ta)
            </Text>
            <Slider
              min={3}
              max={6}
              value={gridSize}
              onChange={(value) => {
                setGridSize(value);
                // Grid o'zgarsa, maxPattern ham mos bo'lishi kerak
                const newTotalTiles = value * value;
                const maxPossible = Math.floor(newTotalTiles * 0.6); // 60% gacha
                if (maxPattern > maxPossible) {
                  setMaxPattern(maxPossible);
                }
              }}
              marks={{
                3: '3x3',
                4: '4x4',
                5: '5x5',
                6: '6x6'
              }}
              step={1}
            />
            <Text type="secondary" className="text-xs block mt-2">
              Standart: 3x3 (9 ta plitka)
            </Text>
          </div>

          <div>
            <Text strong className="block mb-2">
              Topish kerak bo'lgan plitkalar: {maxPattern} ta (maksimal)
            </Text>
            <Slider
              min={3}
              max={Math.floor(gridSize * gridSize * 0.6)} // Jami plitkalarning 60% gacha
              value={maxPattern}
              onChange={(value) => setMaxPattern(value)}
              marks={{
                3: '3',
                [Math.floor(gridSize * gridSize * 0.6)]: `${Math.floor(gridSize * gridSize * 0.6)}`
              }}
              step={1}
            />
            <Text type="secondary" className="text-xs block mt-2">
              O'yin level oshgani sari topish kerak bo'lgan plitkalar soni oshadi, lekin bu maksimal qiymatdan oshmaydi.
            </Text>
            <Text type="secondary" className="text-xs block mt-1">
              Standart: 5 ta (9 ta plitkada)
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TileMemoryGame;
