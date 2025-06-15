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
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaCog,
  FaBookOpen,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const { Title, Text, Paragraph } = Typography;

const ReadingSpeedGame = () => {
  const { updateUserStats } = useAuthStore();
  const [gameState, setGameState] = useState("idle"); // idle, reading, questions, result
  const [level, setLevel] = useState(1);
  const [currentText, setCurrentText] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [readingEndTime, setReadingEndTime] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStats, setGameStats] = useState({
    wpm: 0,
    comprehension: 0,
    readingTime: 0,
  });
  const [settings, setSettings] = useState({
    difficulty: "medium",
    textLength: "medium",
    showTimer: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Reading texts with different difficulty levels
  const texts = {
    easy: [
      {
        title: "Tabiat va Biz",
        content:
          "Tabiat bizning eng katta xazinarimizdir. U bizga havo, suv, oziq-ovqat va boshqa zarur narsalarni beradi. Daraxtlar havoni tozalaydi va kislorod ishlab chiqaradi. Daryolar va ko'llar ichimlik suvi manbai hisoblanadi. Hayvonlar va o'simliklar tabiat muvozanatini saqlaydi. Shuning uchun biz tabiatni asrashimiz kerak. Har bir inson o'z hissasini qo'shishi mumkin. Axlatni to'g'ri joyga tashlash, suvni tejash, daraxtlar ekish - bularning barchasi muhimdir.",
        questions: [
          {
            question: "Tabiat bizga nima beradi?",
            options: [
              "Faqat havo",
              "Havo, suv, oziq-ovqat",
              "Faqat suv",
              "Faqat oziq-ovqat",
            ],
            correct: 1,
          },
          {
            question: "Daraxtlar nimani ishlab chiqaradi?",
            options: ["Karbonat angidrid", "Kislorod", "Azot", "Vodorod"],
            correct: 1,
          },
          {
            question: "Tabiatni asrash uchun nima qilish mumkin?",
            options: [
              "Axlatni tepaga tashlash",
              "Suvni isrof qilish",
              "Daraxtlar ekish",
              "Hayvonlarni bezovta qilish",
            ],
            correct: 2,
          },
        ],
      },
      {
        title: "Sport va Salomatlik",
        content:
          "Sport inson salomatligi uchun juda muhimdir. Muntazam jismoniy mashqlar tanani mustahkamlaydi va kasalliklardan himoya qiladi. Sport qilish yurakni kuchaytiradi va qon aylanishini yaxshilaydi. Mushaklar ham kuchayadi va chidamlilik oshadi. Sport ruhiy holatni ham yaxshilaydi. Mashq qilganidan keyin odam o'zini yaxshi his qiladi. Stress va tashvish kamayadi. Uyqu ham yaxshilanadi. Har kimga mos sport turi bor. Kimdir yugurish, kimdir suzish yoqadi. Muhimi muntazam ravishda sport bilan shug'ullanish.",
        questions: [
          {
            question: "Sport nima uchun foydali?",
            options: [
              "Faqat vaqt o'tkazish uchun",
              "Salomatlikni mustahkamlash uchun",
              "Faqat o'yin-kulgi uchun",
              "Faqat raqobat uchun",
            ],
            correct: 1,
          },
          {
            question: "Sport qilish qaysi a'zoni kuchaytiradi?",
            options: [
              "Faqat oyoqlarni",
              "Faqat qo'llarni",
              "Yurakni",
              "Faqat boshni",
            ],
            correct: 2,
          },
          {
            question: "Sportning ruhiy holatga ta'siri qanday?",
            options: [
              "Yomon ta'sir qiladi",
              "Hech qanday ta'sir qilmaydi",
              "Yaxshi ta'sir qiladi",
              "Faqat charchatadi",
            ],
            correct: 2,
          },
        ],
      },
    ],
    medium: [
      {
        title: "Texnologiya va Kelajak",
        content:
          "Zamonaviy texnologiyalar hayotimizni tubdan o'zgartirdi. Sun'iy intellekt, robotlar va kvant kompyuterlari kelajakda yanada keng qo'llanila boshlaydi. Tibbiyotda nanobotlar kasalliklarni davolashda yordam beradi. Ta'limda virtual reallik yangi imkoniyatlar yaratadi. Transport sohasida avtopilot avtomobillari va uchuvchi mashinalar paydo bo'ladi. Energetikada quyosh va shamol energiyasi asosiy manbalar bo'ladi. Biroq texnologik taraqqiyot bilan birga yangi muammolar ham paydo bo'ladi. Kiberhavfsizlik, ishsizlik va ma'lumotlar xavfsizligi kabi masalalar muhim ahamiyat kasb etadi. Shuning uchun texnologiyalardan oqilona foydalanish zarur.",
        questions: [
          {
            question: "Kelajakda qaysi texnologiyalar ko'p qo'llaniladi?",
            options: [
              "Faqat kompyuterlar",
              "Sun'iy intellekt va robotlar",
              "Faqat telefonlar",
              "Faqat televizorlar",
            ],
            correct: 1,
          },
          {
            question: "Tibbiyotda qaysi yangilik kutilmoqda?",
            options: [
              "Nanobotlar",
              "Katta robotlar",
              "Eski usullar",
              "Oddiy dorilar",
            ],
            correct: 0,
          },
          {
            question:
              "Texnologiya rivojlanishi bilan qanday muammolar paydo bo'ladi?",
            options: [
              "Hech qanday muammo yo'q",
              "Faqat yaxshi narsalar",
              "Kiberhavfsizlik va ishsizlik",
              "Faqat quvonchli voqealar",
            ],
            correct: 2,
          },
        ],
      },
    ],
    hard: [
      {
        title: "Kvant Fizikasi va Zamonaviy Ilm-fan",
        content:
          "Kvant mexanikasi XX asrning eng muhim kashfiyotlaridan biri hisoblanadi. Bu nazariya atomlar va subatomik zarralar olamini tushuntirishga yordam berdi. Kvant holatlari, superpozitsiya va chalkashlik hodisalari klassik fizika qonunlariga zid keladi. Heyzenbergning noaniqlik prinsipi bo'yicha, zarraning koordinatasi va impulsini bir vaqtda aniq o'lchash mumkin emas. Kvant kompyuterlari bu printsiplardan foydalanib, klassik kompyuterlarga nisbatan eksponensial tezlikda hisob-kitoblarni amalga oshira oladi. Kvant kriptografiya esa ma'lumotlar xavfsizligida yangi darajaga olib chiqadi. Shuningdek, kvant teleportatsiya va kvant tarmoqlar kelajakda aloqa tizimlarini inqilob qilishi mumkin.",
        questions: [
          {
            question: "Kvant mexanikasi qaysi asrda kashf etilgan?",
            options: ["XIX asr", "XX asr", "XXI asr", "XVIII asr"],
            correct: 1,
          },
          {
            question: "Heyzenbergning noaniqlik prinsipi nimani bildiradi?",
            options: [
              "Hamma narsani aniq o'lchash mumkin",
              "Koordinata va impulsni bir vaqtda aniq o'lchab bo'lmaydi",
              "Faqat koordinatani o'lchash mumkin",
              "Faqat impulsni o'lchash mumkin",
            ],
            correct: 1,
          },
          {
            question: "Kvant kompyuterlari qanday ustunlikka ega?",
            options: [
              "Faqat kichik",
              "Klassik kompyuterlarga nisbatan tezroq hisoblash",
              "Faqat chiroyli",
              "Arzonroq",
            ],
            correct: 1,
          },
        ],
      },
    ],
  };

  // Start new game
  const startGame = async () => {
    try {
      const difficultyTexts = texts[settings.difficulty] || texts.medium;
      const randomText =
        difficultyTexts[Math.floor(Math.random() * difficultyTexts.length)];

      setCurrentText(randomText);
      setQuestions(randomText.questions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setScore(0);
      setCorrectAnswers(0);
      setGameState("reading");
      setReadingStartTime(Date.now());

      toast.success("Matnni diqqat bilan o'qing!");
    } catch (error) {
      toast.error("O'yinni boshlashda xato yuz berdi");
    }
  };

  // Finish reading and start questions
  const finishReading = () => {
    setReadingEndTime(Date.now());
    setGameState("questions");

    const readingTime = (Date.now() - readingStartTime) / 1000; // seconds
    const wordCount = currentText.content.split(" ").length;
    const wpm = Math.round((wordCount / readingTime) * 60);

    setGameStats((prev) => ({
      ...prev,
      wpm,
      readingTime,
    }));

    toast.success(`O'qish tezligi: ${wpm} so'z/daqiqa`);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  // Submit current answer and move to next question
  const submitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error("Javobni tanlang");
      return;
    }

    const isCorrect =
      selectedAnswer === questions[currentQuestionIndex].correct;
    const newAnswers = [
      ...answers,
      {
        questionIndex: currentQuestionIndex,
        selected: selectedAnswer,
        correct: isCorrect,
      },
    ];
    setAnswers(newAnswers);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      toast.success("To'g'ri javob!");
    } else {
      toast.error("Noto'g'ri javob");
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  // Finish game and calculate results
  const finishGame = async () => {
    const comprehension = (correctAnswers / questions.length) * 100;
    const finalScore = Math.round(gameStats.wpm * (comprehension / 100));

    setScore(finalScore);
    setGameStats((prev) => ({
      ...prev,
      comprehension,
    }));

    setGameState("result");

    try {
      await gamesAPI.submitResult("readingSpeed", {
        score: finalScore,
        level,
        duration: gameStats.readingTime,
        correctAnswers,
        totalQuestions: questions.length,
        settings: {
          ...settings,
          wpm: gameStats.wpm,
          comprehension,
        },
      });

      updateUserStats({
        totalScore: finalScore,
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
    setCurrentText(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setReadingStartTime(null);
    setReadingEndTime(null);
    setGameStats({
      wpm: 0,
      comprehension: 0,
      readingTime: 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-gray-800 mb-2">
          📖 O'qish Tezligi
        </Title>
        <Text className="text-gray-600 text-lg">
          Matnni tez o'qing va savollariga javob bering
        </Text>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic title="WPM" value={gameStats.wpm} suffix="so'z/daq" />
        </Card>
        <Card className="text-center">
          <Statistic
            title="Tushunish"
            value={gameStats.comprehension}
            suffix="%"
            precision={1}
          />
        </Card>
        <Card className="text-center">
          <Statistic title="Ball" value={score} />
        </Card>
        <Card className="text-center">
          <Statistic
            title="To'g'ri"
            value={correctAnswers}
            suffix={`/${questions.length}`}
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
              <div className="text-6xl mb-4">📖</div>
              <Title level={3}>O'qish tezligi o'yinini boshlaylik!</Title>
              <Text className="text-gray-600 block mb-6 max-w-md">
                Sizga matn beriladi. Uni imkon qadar tez va diqqat bilan o'qing,
                so'ngra savollariga javob bering. O'qish tezligi va tushunish
                darajangiz baholanadi.
              </Text>

              {/* Reading tips */}
              <Card className="bg-white/50 max-w-md mx-auto">
                <Title level={5} className="mb-3">
                  📚 Maslahatlar:
                </Title>
                <div className="text-left space-y-1">
                  <Text className="text-sm block">
                    • Matnni diqqat bilan o'qing
                  </Text>
                  <Text className="text-sm block">
                    • Asosiy fikrlarni eslab qoling
                  </Text>
                  <Text className="text-sm block">
                    • Tez o'qishga harakat qiling
                  </Text>
                  <Text className="text-sm block">
                    • Savollarga e'tibor bering
                  </Text>
                </div>
              </Card>

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

          {/* Reading State */}
          {gameState === "reading" && currentText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl space-y-6"
            >
              <div className="text-center mb-6">
                <Title level={3}>{currentText.title}</Title>
                {settings.showTimer && (
                  <Text className="text-gray-600">
                    <FaClock className="inline mr-1" />
                    O'qish vaqti:{" "}
                    {readingStartTime
                      ? Math.floor((Date.now() - readingStartTime) / 1000)
                      : 0}
                    s
                  </Text>
                )}
              </div>

              <Card className="bg-white">
                <Paragraph className="text-lg leading-relaxed text-justify">
                  {currentText.content}
                </Paragraph>
              </Card>

              <div className="text-center">
                <Button
                  type="primary"
                  size="large"
                  onClick={finishReading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 border-none px-8 py-2 h-auto"
                >
                  O'qishni tugatdim
                </Button>
              </div>
            </motion.div>
          )}

          {/* Questions State */}
          {gameState === "questions" && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl space-y-6"
            >
              <div className="text-center mb-6">
                <Title level={4}>
                  Savol {currentQuestionIndex + 1} / {questions.length}
                </Title>
                <Progress
                  percent={(currentQuestionIndex / questions.length) * 100}
                  strokeColor="#3b82f6"
                />
              </div>

              <Card className="bg-white">
                <div className="space-y-6">
                  <Title level={4} className="text-gray-800">
                    {questions[currentQuestionIndex].question}
                  </Title>

                  <Radio.Group
                    value={selectedAnswer}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-full"
                  >
                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options.map(
                        (option, index) => (
                          <Radio
                            key={index}
                            value={index}
                            className="block border rounded-lg p-3 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-base">{option}</span>
                          </Radio>
                        )
                      )}
                    </div>
                  </Radio.Group>

                  <div className="text-center">
                    <Button
                      type="primary"
                      onClick={submitAnswer}
                      disabled={selectedAnswer === null}
                      size="large"
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-2 h-auto"
                    >
                      {currentQuestionIndex < questions.length - 1
                        ? "Keyingi savol"
                        : "Tugatish"}
                    </Button>
                  </div>
                </div>
              </Card>
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
                {gameStats.wpm >= 200 && gameStats.comprehension >= 80
                  ? "🏆"
                  : gameStats.wpm >= 150 && gameStats.comprehension >= 70
                  ? "🎉"
                  : gameStats.wpm >= 100 && gameStats.comprehension >= 60
                  ? "👍"
                  : "💪"}
              </div>
              <Title level={3}>
                {gameStats.wpm >= 200 && gameStats.comprehension >= 80
                  ? "Ajoyib natija!"
                  : gameStats.wpm >= 150 && gameStats.comprehension >= 70
                  ? "Yaxshi!"
                  : gameStats.wpm >= 100 && gameStats.comprehension >= 60
                  ? "O'rtacha"
                  : "Yana mashq qiling!"}
              </Title>

              <div className="grid grid-cols-2 gap-4 my-6 max-w-md mx-auto">
                <Card>
                  <Statistic
                    title="O'qish tezligi"
                    value={gameStats.wpm}
                    suffix="WPM"
                  />
                </Card>
                <Card>
                  <Statistic
                    title="Tushunish"
                    value={gameStats.comprehension}
                    suffix="%"
                    precision={1}
                  />
                </Card>
                <Card>
                  <Statistic title="Yakuniy ball" value={score} />
                </Card>
                <Card>
                  <Statistic
                    title="O'qish vaqti"
                    value={gameStats.readingTime}
                    suffix="s"
                    precision={1}
                  />
                </Card>
              </div>

              {/* Performance analysis */}
              <Card className="bg-blue-50 border-blue-200 max-w-md mx-auto">
                <div className="space-y-2">
                  <Text className="text-blue-800 text-sm block">
                    <strong>O'qish tezligi:</strong>{" "}
                    {gameStats.wpm >= 250
                      ? "Juda tez"
                      : gameStats.wpm >= 200
                      ? "Tez"
                      : gameStats.wpm >= 150
                      ? "Yaxshi"
                      : gameStats.wpm >= 100
                      ? "O'rtacha"
                      : "Sekin"}
                  </Text>
                  <Text className="text-blue-800 text-sm block">
                    <strong>Tushunish:</strong>{" "}
                    {gameStats.comprehension >= 90
                      ? "Mukammal"
                      : gameStats.comprehension >= 80
                      ? "Yaxshi"
                      : gameStats.comprehension >= 70
                      ? "O'rtacha"
                      : gameStats.comprehension >= 60
                      ? "Qoniqarli"
                      : "Yomon"}
                  </Text>
                </div>
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
                  Yangi matn
                </Button>
              </Space>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        title="O'qish tezligi sozlamalari"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        className="settings-modal"
      >
        <div className="space-y-4">
          <div>
            <Text strong>Matn qiyinligi:</Text>
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
            <Text strong>Matn uzunligi:</Text>
            <div className="mt-2 space-x-2">
              {["short", "medium", "long"].map((length) => (
                <Button
                  key={length}
                  type={settings.textLength === length ? "primary" : "default"}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, textLength: length }))
                  }
                >
                  {length === "short"
                    ? "Qisqa"
                    : length === "medium"
                    ? "O'rta"
                    : "Uzun"}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Text strong>Vaqt ko'rsatgichini ko'rsatish:</Text>
            <div className="mt-2 space-x-2">
              <Button
                type={settings.showTimer ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, showTimer: true }))
                }
              >
                Ha
              </Button>
              <Button
                type={!settings.showTimer ? "primary" : "default"}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, showTimer: false }))
                }
              >
                Yo'q
              </Button>
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

export default ReadingSpeedGame;
