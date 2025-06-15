import { Link } from "react-router-dom";
import { Button, Card, Row, Col, Typography, Statistic, Space } from "antd";
import {
  FaBrain,
  FaPlay,
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaGamepad,
  FaStar,
  FaTarget,
  FaRocket,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const { Title, Text, Paragraph } = Typography;

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-gray-200">
      <div className="text-4xl text-primary-500 mb-4">
        <Icon />
      </div>
      <Title level={4} className="mb-3">
        {title}
      </Title>
      <Text className="text-gray-600">{description}</Text>
    </Card>
  </motion.div>
);

const GameTypeCard = ({ icon, title, description, color = "blue" }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="h-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
      <div className="text-center space-y-3">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center mx-auto`}
        >
          <span className="text-white text-xl">{icon}</span>
        </div>
        <Title level={5} className="mb-2">
          {title}
        </Title>
        <Text className="text-gray-600 text-sm">{description}</Text>
      </div>
    </Card>
  </motion.div>
);

const Home = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center"
            >
              <FaBrain className="text-white text-3xl" />
            </motion.div>
          </div>

          <Title
            level={1}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-6"
          >
            Mental <span className="text-gradient">Arifmetika</span>
          </Title>

          <Paragraph className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Aqlingizni rivojlantiring, matematik qobiliyatlaringizni oshiring va
            11 xil qiziqarli o'yin orqali fikrlash tezligingizni oshiring!
          </Paragraph>

          <Space size="large" className="flex-wrap justify-center">
            {isAuthenticated ? (
              <Link to="/games">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaPlay />}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-3 h-auto text-lg"
                >
                  O'ynashni boshlash
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    icon={<FaRocket />}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-3 h-auto text-lg"
                  >
                    Bepul ro'yxatdan o'tish
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="large" className="px-8 py-3 h-auto text-lg">
                    Kirish
                  </Button>
                </Link>
              </>
            )}
          </Space>
        </motion.div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && user && (
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
              <Title level={3} className="text-center mb-6">
                Sizning natijalaringiz
              </Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8} className="text-center">
                  <Statistic
                    title="Daraja"
                    value={user.level}
                    prefix={<FaStar className="text-yellow-500" />}
                    valueStyle={{ color: "#f59e0b" }}
                  />
                </Col>
                <Col xs={24} sm={8} className="text-center">
                  <Statistic
                    title="Umumiy ball"
                    value={user.totalScore}
                    prefix={<FaTrophy className="text-primary-500" />}
                    valueStyle={{ color: "#3b82f6" }}
                  />
                </Col>
                <Col xs={24} sm={8} className="text-center">
                  <Statistic
                    title="O'ynagan o'yinlar"
                    value={user.gamesPlayed}
                    prefix={<FaGamepad className="text-green-500" />}
                    valueStyle={{ color: "#10b981" }}
                  />
                </Col>
              </Row>
            </Card>
          </motion.div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16"
          >
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              Nima uchun Mental Arifmetika?
            </Title>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bizning platformamiz zamonaviy yondashuv bilan matematik
              fikrlashni rivojlantiradi
            </Text>
          </motion.div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <FeatureCard
                icon={FaBrain}
                title="Aqli qobiliyatlarni rivojlantirish"
                description="11 xil o'yin orqali xotira, diqqat va mantiqiy fikrlashni mustahkamlang"
                delay={0.1}
              />
            </Col>
            <Col xs={24} md={8}>
              <FeatureCard
                icon={FaChartLine}
                title="Progress tracking"
                description="Rivojlanishingizni kuzatib boring va natijalaringizni tahlil qiling"
                delay={0.2}
              />
            </Col>
            <Col xs={24} md={8}>
              <FeatureCard
                icon={FaUsers}
                title="Raqobat va reyting"
                description="Boshqa o'yinchilar bilan raqobatlashing va reytingda yuqoriga ko'tariling"
                delay={0.3}
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* Games Overview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-16"
          >
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              O'yin turlari
            </Title>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Har xil qobiliyatlarni rivojlantirish uchun maxsus yaratilgan
              o'yinlar
            </Text>
          </motion.div>

          <Row gutter={[24, 24]}>
            <Col xs={12} sm={8} md={6}>
              <GameTypeCard
                icon="🧠"
                title="Xotira o'yinlari"
                description="Raqam va naqshlarni eslab qolish"
                color="blue"
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <GameTypeCard
                icon="🎯"
                title="Diqqat mashqlari"
                description="Schulte jadvali va fokus o'yinlari"
                color="green"
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <GameTypeCard
                icon="🧮"
                title="Matematik amallar"
                description="Hisoblash va formulalar"
                color="purple"
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <GameTypeCard
                icon="📊"
                title="Mantiq masalalari"
                description="Foizlar va kasrlar bilan ishlash"
                color="orange"
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <GameTypeCard
                icon="📖"
                title="O'qish tezligi"
                description="Tushunish bilan tez o'qish"
                color="cyan"
              />
            </Col>
            <Col xs={12} sm={8} md={6}>
              <GameTypeCard
                icon="🔍"
                title="Vizual topish"
                description="Berkinchoq va naqsh topish"
                color="red"
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <Title level={2} className="text-4xl font-bold text-white mb-4">
            Bugun o'ynashni boshlang!
          </Title>
          <Paragraph className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Matematik qobiliyatlaringizni rivojlantirish uchun eng yaxshi vaqt -
            hozir! Bepul ro'yxatdan o'ting va o'z imkoniyatlaringizni kashf
            qiling.
          </Paragraph>

          {!isAuthenticated && (
            <Space size="large">
              <Link to="/register">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaTarget />}
                  className="bg-white text-primary-600 hover:bg-gray-100 border-none px-8 py-3 h-auto text-lg font-medium"
                >
                  Hoziroq boshlash
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="large"
                  className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 h-auto text-lg"
                >
                  Hisobim bor
                </Button>
              </Link>
            </Space>
          )}

          {isAuthenticated && (
            <Link to="/games">
              <Button
                type="primary"
                size="large"
                icon={<FaPlay />}
                className="bg-white text-primary-600 hover:bg-gray-100 border-none px-8 py-3 h-auto text-lg font-medium"
              >
                O'yinlarni ko'rish
              </Button>
            </Link>
          )}
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-16"
          >
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              Mental arifmetikaning foydalari
            </Title>
            <Text className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ilmiy tadqiqotlarga ko'ra, muntazam mental mashqlar miyaning
              ishlashini sezilarli darajada yaxshilaydi
            </Text>
          </motion.div>

          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBrain className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <Title level={4} className="mb-2">
                      Xotira kuchayadi
                    </Title>
                    <Text className="text-gray-600">
                      Qisqa muddatli va uzoq muddatli xotira qobiliyatlari
                      rivojlanadi, kundalik hayotda ma'lumotlarni yaxshiroq
                      eslab qolasiz.
                    </Text>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaTarget className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <Title level={4} className="mb-2">
                      Diqqat markazlashadi
                    </Title>
                    <Text className="text-gray-600">
                      Koncentratsiya qobiliyati oshadi, chalg'ituvchi omillarga
                      qarshi turish kuchi mustahkamlanadi.
                    </Text>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaChartLine className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <Title level={4} className="mb-2">
                      Tezkor fikrlash
                    </Title>
                    <Text className="text-gray-600">
                      Qaror qabul qilish tezligi oshadi, muammolarni tezroq hal
                      qilish qobiliyati rivojlanadi.
                    </Text>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-center"
              >
                <div className="relative inline-block">
                  <div className="w-80 h-80 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                    <div className="w-64 h-64 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full flex items-center justify-center">
                      <div className="w-48 h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <FaBrain className="text-white text-6xl" />
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0"
                  >
                    <div className="absolute top-4 left-8 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">+</span>
                    </div>
                    <div className="absolute bottom-8 right-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">×</span>
                    </div>
                    <div className="absolute top-1/3 right-2 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">÷</span>
                    </div>
                    <div className="absolute bottom-1/3 left-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">-</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-primary-200">
            <div className="py-8">
              <Title level={3} className="text-gray-800 mb-4">
                Miyangizning to'liq potentsialini ochib bering!
              </Title>
              <Text className="text-gray-600 text-lg mb-6 block">
                Har kuni atigi 10-15 daqiqalik mashq bilan matematik fikrlash
                qobiliyatingizni sezilarli darajada yaxshilang.
              </Text>

              {!isAuthenticated ? (
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    icon={<FaRocket />}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-3 h-auto text-lg"
                  >
                    Bugun boshlaymiz!
                  </Button>
                </Link>
              ) : (
                <Link to="/games">
                  <Button
                    type="primary"
                    size="large"
                    icon={<FaPlay />}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none px-8 py-3 h-auto text-lg"
                  >
                    O'yinni boshlash
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
