import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Progress,
  Space,
  Typography,
  Statistic,
  Modal,
} from "antd";
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaCog,
  FaEyeSlash,
  FaEye,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const HideAndSeekGame = () => {
  const navigate = useNavigate();
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, showing, searching, result
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState([]);
  const [hiddenCells, setHiddenCells] = useState([]);
  const [foundCells, setFoundCells] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showTime, setShowTime] = useState(3);
  const [startTime, setStartTime] = useState(null);
  const [gameStats, setGameStats] = useState({
    correct: 0,
    total: 0,
  });
  const [settings, setSettings] = useState({
    gridSize: 4,
    showDuration: 3000,
    hiddenCount: 6,
    difficulty: "medium",
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate random grid layout
  const generateGrid = useCallback(() => {
    const size = settings.gridSize;
    const totalCells = size * size;
    const numbersToHide = Math.min(
      settings.hiddenCount + level - 1,
      totalCells - 2
    );

    // Create array of numbers 1 to totalCells
    const numbers = Array.from({ length: totalCells }, (_, i) => i + 1);

    // Shuffle the numbers randomly (Fisher-Yates shuffle)
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Create grid with shuffled numbers
    const newGrid = numbers.map((number, index) => ({
      id: index,
      number: number,
      position: {
        row: Math.floor(index / size),
        col: index % size,
      },
    }));

    // Randomly select cells to hide (select the smallest numbers for easy gameplay)
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const numbersToHideList = sortedNumbers.slice(0, numbersToHide);

    // Find cells with these numbers and mark them as hidden
    const hiddenCellsList = [];
    newGrid.forEach((cell) => {
      if (numbersToHideList.includes(cell.number)) {
        hiddenCellsList.push({
          id: cell.id,
          number: cell.number,
          position: cell.position,
        });
      }
    });

    // Sort hidden cells by number for easier gameplay
    hiddenCellsList.sort((a, b) => a.number - b.number);
    setHiddenCells(hiddenCellsList);

    return newGrid;
  }, [level, settings.gridSize, settings.hiddenCount]);

  // Back to games
  const handleBack = () => {
    if (gameState === "showing" || gameState === "searching") {
      Modal.confirm({
        title: "O'yinni tark etish",
        content:
          "Haqiqatan ham o'yinni tark etmoqchimisiz? Barcha progress yo'qoladi.",
        okText: "Ha, tark etish",
        cancelText: "Bekor qilish",
        onOk: () => navigate("/games"),
      });
    } else {
      navigate("/games");
    }
  };

  // Start new game
  const startGame = async () => {
    try {
      const newGrid = generateGrid();
      setGrid(newGrid);
      setGameState("showing");
      setFoundCells([]);
      setShowTime(settings.showDuration / 1000);
      setStartTime(Date.now());
      setGameStats({
        correct: 0,
        total: 0,
      });

      toast.success("Raqamlarning joyini eslab qoling!");

      // Show numbers for specified duration
      showNumbers();
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Show numbers phase
  const showNumbers = () => {
    let timeLeft = settings.showDuration / 1000;

    const timer = setInterval(() => {
      timeLeft -= 1;
      setShowTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        setGameState("searching");
        const firstTarget = hiddenCells[0];
        toast.info(`${firstTarget.number} raqamini toping!`);
      }
    }, 1000);
  };

  // Handle cell click
  const handleCellClick = (cell) => {
    if (gameState !== "searching") return;

    // Check if this cell should be hidden and not found yet
    const hiddenCell = hiddenCells.find((h) => h.id === cell.id);
    const alreadyFound = foundCells.find((f) => f.id === cell.id);

    if (!hiddenCell) {
      // Clicked on a cell that shouldn't be hidden
      toast.error("Bu raqam yashirilmagan!");
      return;
    }

    if (alreadyFound) {
      // Already found this cell
      toast.warning("Bu raqam allaqachon topilgan!");
      return;
    }

    // Find the next number we need to find
    const nextNumberToFind = hiddenCells
      .filter((h) => !foundCells.find((f) => f.id === h.id))
      .sort((a, b) => a.number - b.number)[0];

    if (hiddenCell.number === nextNumberToFind.number) {
      // Correct cell clicked
      const newFoundCells = [...foundCells, hiddenCell];
      setFoundCells(newFoundCells);

      const points = 50 + level * 10;
      setScore((prev) => prev + points);

      const newStats = {
        ...gameStats,
        correct: gameStats.correct + 1,
        total: gameStats.total + 1,
      };
      setGameStats(newStats);

      toast.success(`To'g'ri! +${points} ball`);

      // Check if all hidden cells found
      if (newFoundCells.length === hiddenCells.length) {
        completeLevel();
      } else {
        // Find next number to search
        const nextTarget = hiddenCells
          .filter((h) => !newFoundCells.find((f) => f.id === h.id))
          .sort((a, b) => a.number - b.number)[0];
        toast.info(`Endi ${nextTarget.number} raqamini toping!`);
      }
    } else {
      // Wrong cell clicked (correct hidden cell but wrong order)
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          endGame();
          return 0;
        }
        toast.error(
          `Noto'g'ri! Avval ${nextNumberToFind.number} raqamini toping. ${newLives} jon qoldi`
        );
        return newLives;
      });

      setGameStats((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
    }
  };

  // Complete current level
  const completeLevel = () => {
    setLevel((prev) => prev + 1);
    const bonusPoints = level * 100;
    setScore((prev) => prev + bonusPoints);

    toast.success(`Daraja ${level} tugallandi! +${bonusPoints} bonus ball`);

    // Start next level after delay
    setTimeout(() => {
      if (level < 10) {
        startGame();
      } else {
        endGame();
      }
    }, 2000);
  };

  // End game
  const endGame = async () => {
    setGameState("result");
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    try {
      await gamesAPI.submitResult("hideAndSeek", {
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
  };

  // Reset game
  const resetGame = () => {
    setGameState("idle");
    setLevel(1);
    setScore(0);
    setLives(3);
    setGrid([]);
    setHiddenCells([]);
    setFoundCells([]);
    setShowTime(3);
    setStartTime(null);
    setGameStats({
      correct: 0,
      total: 0,
    });
  };

  // Check if cell should be visible
  const isCellVisible = (cell) => {
    // During showing phase - all cells visible
    if (gameState === "showing") return true;

    // During searching phase - hidden cells are invisible unless found
    if (gameState === "searching") {
      const isHidden = hiddenCells.find((h) => h.id === cell.id);
      const isFound = foundCells.find((f) => f.id === cell.id);
      return !isHidden || isFound;
    }

    // In result phase - show all
    return true;
  };

  // Get cell style
  const getCellStyle = (cell) => {
    const isHidden = hiddenCells.find((h) => h.id === cell.id);
    const isFound = foundCells.find((f) => f.id === cell.id);
    const isVisible = isCellVisible(cell);

    // Next target highlighting
    let isNextTarget = false;
    if (gameState === "searching" && isHidden && !isFound) {
      const nextTarget = hiddenCells
        .filter((h) => !foundCells.find((f) => f.id === h.id))
        .sort((a, b) => a.number - b.number)[0];
      isNextTarget = nextTarget && nextTarget.id === cell.id;
    }

    return `
      aspect-square border-2 rounded-lg cursor-pointer transition-all duration-300
      flex items-center justify-center font-bold text-lg select-none
      ${
        isVisible
          ? isFound
            ? "bg-green-100 border-green-500 text-green-700"
            : "bg-white border-gray-300 text-gray-800"
          : "bg-gray-200 border-gray-400 text-transparent hover:bg-blue-50 hover:border-blue-300"
      }
      
    `;
  };

  // Render grid cell
  const renderCell = (cell) => {
    const isVisible = isCellVisible(cell);
    const isHidden = hiddenCells.find((h) => h.id === cell.id);
    const isFound = foundCells.find((f) => f.id === cell.id);

    return (
      <motion.div
        key={cell.id}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{
          scale: gameState === "searching" && !isVisible ? 1.05 : 1,
        }}
        whileTap={{ scale: gameState === "searching" && !isVisible ? 0.95 : 1 }}
        transition={{ delay: cell.id * 0.02 }}
        className={getCellStyle(cell)}
        onClick={() => handleCellClick(cell)}
      >
        {isVisible && (
          <span className={isFound ? "line-through" : ""}>{cell.number}</span>
        )}
        {!isVisible && gameState === "searching" && (
          <FaEyeSlash className="text-gray-400 text-sm" />
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          🔍 Berkinmachoq
        </Title>
        <Text className="text-gray-600 text-lg">
          Yashiringan raqamlarning joyini eslab qoling va ularni tartib bilan
          toping
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
            title="Topildi"
            value={foundCells.length}
            suffix={`/${hiddenCells.length}`}
          />
        </Card>
      </div>

      {/* Current Target */}
      {gameState === "searching" && hiddenCells.length > 0 && (
        <Card className="mb-6 text-center bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-center space-x-2">
            <FaEye className="text-yellow-600" />
            <Text className="text-lg font-medium">
              Qidirilayotgan raqam:
              <span className="text-2xl font-bold text-yellow-700 ml-2">
                {
                  hiddenCells
                    .filter((h) => !foundCells.find((f) => f.id === h.id))
                    .sort((a, b) => a.number - b.number)[0]?.number
                }
              </span>
            </Text>
          </div>
          <Text className="text-sm text-yellow-600 mt-2">
            Yashiringan raqamlar:{" "}
            {hiddenCells
              .map((h) => h.number)
              .sort((a, b) => a - b)
              .join(", ")}
          </Text>
        </Card>
      )}

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
              <div className="text-6xl mb-4">🔍</div>
              <Title level={3}>Berkinmachoq o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Raqamlar tasodifiy joylarda ko'rsatiladi, keyin ba'zilari
                yashiriladi. Yashiringan raqamlarni kichikdan boshlab tartib
                bo'yicha toping!
              </Text>

              {/* Game Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-lg">
                <Card className="bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👀</div>
                    <Text strong className="text-blue-700">
                      1. Kuzatish
                    </Text>
                    <Text className="text-xs text-blue-600 block">
                      Raqamlarning joyini yodlab oling
                    </Text>
                  </div>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🙈</div>
                    <Text strong className="text-purple-700">
                      2. Yashirish
                    </Text>
                    <Text className="text-xs text-purple-600 block">
                      Ba'zi raqamlar yashiriladi
                    </Text>
                  </div>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔍</div>
                    <Text strong className="text-green-700">
                      3. Qidirish
                    </Text>
                    <Text className="text-xs text-green-600 block">
                      Kichikdan boshlab tartib bo'yicha toping
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

          {/* Showing State */}
          {gameState === "showing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Raqamlarning joyini eslab qoling!</Title>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {showTime}
              </div>

              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 70}px`,
                }}
              >
                {grid.map(renderCell)}
              </div>

              <Progress
                percent={(
                  ((settings.showDuration / 1000 - showTime) /
                    (settings.showDuration / 1000)) *
                  100
                ).toFixed()}
                strokeColor="#3b82f6"
                showInfo={false}
              />

              <Text className="text-sm text-gray-600">
                Yashiriladigan raqamlar:{" "}
                {hiddenCells
                  .map((h) => h.number)
                  .sort((a, b) => a - b)
                  .join(", ")}
              </Text>
            </motion.div>
          )}

          {/* Searching State */}
          {gameState === "searching" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <Title level={3}>Yashiringan raqamlarni toping!</Title>

              <div
                className="grid gap-3 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                  maxWidth: `${settings.gridSize * 70}px`,
                }}
              >
                {grid.map(renderCell)}
              </div>

              <Progress
                percent={(foundCells.length / hiddenCells.length) * 100}
                strokeColor="#22c55e"
                className="max-w-md mx-auto"
              />

              <Text className="text-sm text-gray-500">
                Tartib:{" "}
                {hiddenCells
                  .map((h) => h.number)
                  .sort((a, b) => a - b)
                  .join(" → ")}
              </Text>

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
              <div className="text-6xl mb-4">{lives > 0 ? "🎉" : "😢"}</div>
              <Title level={3}>
                {lives > 0 ? "Ajoyib o'yin!" : "O'yin tugadi!"}
              </Title>

              <div className="grid grid-cols-2 gap-4 my-6 max-w-md mx-auto">
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
                <Button
                  icon={<FaArrowLeft />}
                  onClick={() => navigate("/games")}
                  size="large"
                  className="px-8 py-2 h-auto"
                >
                  O'yinlarga qaytish
                </Button>
              </Space>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="Berkinmachoq o'yini sozlamalari"
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
            <Text strong>Jadval o'lchami:</Text>
            <div className="mt-2 space-x-2">
              {[3, 4, 5].map((size) => (
                <Button
                  key={size}
                  type={settings.gridSize === size ? "primary" : "default"}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, gridSize: size }))
                  }
                >
                  {size}x{size}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Text strong>Ko'rsatish vaqti (soniya):</Text>
            <div className="mt-2">
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={settings.showDuration / 1000}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    showDuration: Number(e.target.value) * 1000,
                  }))
                }
                className="w-full"
              />
              <Text className="text-sm text-gray-500">
                {settings.showDuration / 1000} soniya
              </Text>
            </div>
          </div>

          <div>
            <Text strong>Yashiringan raqamlar soni:</Text>
            <div className="mt-2">
              <input
                type="range"
                min="3"
                max={Math.floor(settings.gridSize * settings.gridSize * 0.7)}
                step="1"
                value={settings.hiddenCount}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    hiddenCount: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <Text className="text-sm text-gray-500">
                {settings.hiddenCount} ta
              </Text>
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

export default HideAndSeekGame;
