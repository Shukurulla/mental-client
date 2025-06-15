import { Link } from "react-router-dom";
import { Layout, Row, Col, Typography, Space, Divider } from "antd";
import {
  FaBrain,
  FaGithub,
  FaTelegram,
  FaInstagram,
  FaFacebook,
  FaHeart,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { title: "Bosh sahifa", path: "/" },
    { title: "O'yinlar", path: "/games" },
    { title: "Reyting", path: "/leaderboard" },
    { title: "Profil", path: "/profile" },
  ];

  const gameTypes = [
    { title: "Raqam xotirasi", path: "/games/numberMemory" },
    { title: "Plitkalar", path: "/games/tileMemory" },
    { title: "Schulte jadvali", path: "/games/schulteTable" },
    { title: "Matematik amallar", path: "/games/mathSystems" },
    { title: "Foizlar", path: "/games/percentages" },
    { title: "O'qish tezligi", path: "/games/readingSpeed" },
  ];

  const socialLinks = [
    {
      icon: FaTelegram,
      url: "https://t.me/mentalmath_uz",
      label: "Telegram",
      color: "#0088cc",
    },
    {
      icon: FaInstagram,
      url: "https://instagram.com/mentalmath.uz",
      label: "Instagram",
      color: "#E4405F",
    },
    {
      icon: FaFacebook,
      url: "https://facebook.com/mentalmath.uz",
      label: "Facebook",
      color: "#1877F2",
    },
    {
      icon: FaGithub,
      url: "https://github.com/mentalmath-uz",
      label: "GitHub",
      color: "#333",
    },
  ];

  const contactInfo = [
    {
      icon: FaPhone,
      text: "+998 90 123 45 67",
      href: "tel:+998901234567",
    },
    {
      icon: FaEnvelope,
      text: "info@mentalmath.uz",
      href: "mailto:info@mentalmath.uz",
    },
    {
      icon: FaMapMarkerAlt,
      text: "Toshkent, O'zbekiston",
      href: "#",
    },
  ];

  return (
    <AntFooter className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <Row gutter={[32, 32]}>
          {/* Brand Section */}
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                to="/"
                className="flex items-center space-x-3 mb-4 text-white hover:text-blue-400 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaBrain className="text-white text-lg" />
                </div>
                <Title level={4} className="text-white mb-0">
                  Mental Math
                </Title>
              </Link>
              <Text className="text-gray-300 block mb-4">
                Aqlingizni rivojlantiring va matematik qobiliyatlaringizni
                oshiring. 11 xil qiziqarli o'yin orqali fikrlash tezligingizni
                oshiring!
              </Text>
              <Space size="middle">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      whileHover={{ scale: 1.1, color: social.color }}
                      transition={{ duration: 0.2 }}
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300"
                    >
                      <IconComponent size={18} />
                    </motion.a>
                  );
                })}
              </Space>
            </motion.div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Title level={5} className="text-white mb-4">
                Tezkor havolalar
              </Title>
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 py-1"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          </Col>

          {/* Game Types */}
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Title level={5} className="text-white mb-4">
                O'yin turlari
              </Title>
              <div className="space-y-2">
                {gameTypes.map((game, index) => (
                  <Link
                    key={index}
                    to={game.path}
                    className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 py-1 text-sm"
                  >
                    {game.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Title level={5} className="text-white mb-4">
                Aloqa
              </Title>
              <div className="space-y-3">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <a
                      key={index}
                      href={contact.href}
                      className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                    >
                      <IconComponent size={16} />
                      <Text className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                        {contact.text}
                      </Text>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </Col>
        </Row>

        <Divider className="border-gray-700 my-8" />

        {/* Bottom Section */}
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text className="text-gray-400 text-sm">
              © {currentYear} Mental Math. Barcha huquqlar himoyalangan.
            </Text>
          </Col>
          <Col xs={24} md={12} className="text-right">
            <Space
              split={<span className="text-gray-600">|</span>}
              size="middle"
            >
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Maxfiylik siyosati
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Foydalanish shartlari
              </Link>
              <Link
                to="/support"
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300"
              >
                Yordam
              </Link>
            </Space>
          </Col>
        </Row>

        {/* Made with love */}
        <div className="text-center mt-8">
          <Text className="text-gray-500 text-sm flex items-center justify-center">
            Made with <FaHeart className="text-red-500 mx-1 animate-pulse" /> by
            Mental Math Team
          </Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
