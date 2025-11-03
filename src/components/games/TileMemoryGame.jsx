// components/games/TileMemoryGame.jsx - Plitkalar o'yini
import React, { useState, useEffect } from "react";
import { Card, Button, Progress, Typography, Space, message } from "antd";
import { FaPlay, FaStop, FaLightbulb } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text } = Typography;

const TileMemoryGame = () => {
  const [gameState, setGameState] = useState("waiting");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [gridSize] = useState(3); // 3x3 grid
  const [mode, setMode] = useState("sequential"); // sequential, random

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
    const patternSize = Math.min(2 + currentLevel, 9);
    const newPattern = [];

    // Barcha mumkin bo'lgan plitkalarni yaratish
    const allTiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);

    if (mode === "random") {
      // Haqiqiy tasodifiy tartib
      const shuffled = shuffleArray(allTiles);
      for (let i = 0; i < patternSize; i++) {
        newPattern.push(shuffled[i]);
      }
    } else {
      // Oddiy tasodifiy tanlov (sequential mode)
      while (newPattern.length < patternSize) {
        const tile = Math.floor(Math.random() * (gridSize * gridSize));
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
    }, showTime);
  };

  const handleTileClick = (tileIndex) => {
    if (gameState !== "playing") return;

    const newUserPattern = [...userPattern, tileIndex];

    // Hozirgi bosqichni tekshirish
    if (
      newUserPattern[newUserPattern.length - 1] !==
      pattern[newUserPattern.length - 1]
    ) {
      // Noto'g'ri
      setLives(lives - 1);
      if (lives <= 1) {
        setGameState("finished");
        message.error("O'yin tugadi!");
      } else {
        message.error("Noto'g'ri! Qayta urinib ko'ring.");
        setUserPattern([]);
      }
      return;
    }

    setUserPattern(newUserPattern);

    // Pattern to'liq to'g'ri kiritildimi?
    if (newUserPattern.length === pattern.length) {
      setScore(score + pattern.length * 50);
      setLevel(level + 1);
      message.success("Ajoyib! Keyingi darajaga o'tdingiz!");
      setTimeout(() => {
        startGame();
      }, 1000);
    }
  };

  const renderGrid = () => {
    const tiles = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
      const isInPattern = pattern.includes(i);
      const isShowing = showingPattern && isInPattern;
      const isClicked = userPattern.includes(i);

      tiles.push(
        <motion.button
          key={i}
          className={`
            w-full aspect-square rounded-lg border-2 transition-all duration-300 font-bold text-xl
            ${
              isShowing
                ? "bg-blue-500 border-blue-600 text-white shadow-lg"
                : isClicked
                ? "bg-green-400 border-green-500 text-white"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-600"
            }
            ${gameState === "playing" ? "cursor-pointer" : "cursor-default"}
          `}
          onClick={() => handleTileClick(i)}
          whileHover={gameState === "playing" ? { scale: 1.05 } : {}}
          whileTap={gameState === "playing" ? { scale: 0.95 } : {}}
          disabled={gameState !== "playing"}
          animate={
            isShowing
              ? {
                  scale: [1, 1.1, 1],
                  backgroundColor: ["#3b82f6", "#60a5fa", "#3b82f6"],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          {/* Raqam ko'rsatilmasin, faqat rang o'zgarishi */}
        </motion.button>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">{tiles}</div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        {/* Game Header */}
        <div className="text-center mb-6">
          <Title level={2}>🎯 Plitkalar Xotirasi</Title>
          <Text className="text-gray-600">
            Yongan plitkalarning ketma-ketligini eslab qoling va takrorlang
          </Text>

          {/* Mode selector */}
          {gameState === "waiting" && (
            <div className="mt-4">
              <Text strong className="block mb-2">Rejim tanlang:</Text>
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
                  Yongan plitkalarni kuzatib, ularni tartib bo'yicha bosing
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
                🔍 Diqqat bilan kuzating...
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
              👆 Endi plitkalarni tartib bo'yicha bosing ({userPattern.length}/
              {pattern.length})
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
                  setUserPattern([]);
                  message.info("Pattern tozalandi, qayta boshlang");
                }}
              >
                Qayta boshlash
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
                  startGame();
                }}
              >
                Qayta o'ynash
              </Button>
              <Button onClick={() => window.history.back()}>Chiqish</Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TileMemoryGame;
