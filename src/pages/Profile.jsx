import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Tabs,
  Statistic,
  Progress,
  Table,
  Tag,
  Form,
  Input,
  Upload,
  Switch,
  Select,
  Modal,
  Space,
  Divider,
} from "antd";
import {
  FaUser,
  FaEdit,
  FaCamera,
  FaSave,
  FaTrophy,
  FaMedal,
  FaCalendar,
  FaClock,
  FaGamepad,
  FaStar,
  FaFire,
  FaTable,
  FaBrain,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { resultsAPI } from "../utils/api";
import {
  formatDate,
  formatScore,
  getRelativeTime,
  calculateUserLevel,
} from "../utils/helpers";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (user && editMode) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, editMode, profileForm]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load user stats and game history
      const [statsResponse] = await Promise.all([resultsAPI.getUserStats()]);

      setUserStats(statsResponse.data.user);

      // Mock game history data
      const mockHistory = [
        {
          id: 1,
          game: "numberMemory",
          gameName: "Raqam xotirasi",
          score: 850,
          level: 12,
          duration: 145,
          accuracy: 87,
          date: "2024-01-15T14:30:00Z",
          rank: "🥇",
        },
        {
          id: 2,
          game: "schulteTable",
          gameName: "Schulte jadvali",
          score: 720,
          level: 8,
          duration: 98,
          accuracy: 92,
          date: "2024-01-15T13:15:00Z",
          rank: "🥈",
        },
        {
          id: 3,
          game: "mathSystems",
          gameName: "Matematik amallar",
          score: 650,
          level: 7,
          duration: 167,
          accuracy: 78,
          date: "2024-01-14T19:45:00Z",
          rank: "🥉",
        },
      ];
      setGameHistory(mockHistory);

      // Mock achievements data
      const mockAchievements = [
        {
          id: 1,
          name: "Birinchi ming",
          description: "1000 ball to'plang",
          icon: "🥉",
          unlocked: true,
          unlockedDate: "2024-01-10",
          progress: 100,
        },
        {
          id: 2,
          name: "O'yin menejeri",
          description: "50 ta o'yin o'ynang",
          icon: "🎮",
          unlocked: true,
          unlockedDate: "2024-01-12",
          progress: 100,
        },
        {
          id: 3,
          name: "Ustoz",
          description: "10-darajaga yeting",
          icon: "🎓",
          unlocked: true,
          unlockedDate: "2024-01-14",
          progress: 100,
        },
        {
          id: 4,
          name: "Besh ming",
          description: "5000 ball to'plang",
          icon: "🥈",
          unlocked: false,
          progress: 67,
        },
        {
          id: 5,
          name: "Matematik usta",
          description: "Matematik o'yinlarda 90% aniqlik",
          icon: "🧮",
          unlocked: false,
          progress: 85,
        },
      ];
      setAchievements(mockAchievements);
    } catch (error) {
      console.error("Profile ma'lumotlarini yuklashda xato:", error);
      toast.error("Ma'lumotlarni yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      const result = await updateProfile(values);
      if (result.success) {
        setEditMode(false);
        toast.success("Profil muvaffaqiyatli yangilandi!");
      }
    } catch (error) {
      toast.error("Profil yangilashda xato yuz berdi");
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      const result = await changePassword(values);
      if (result.success) {
        setShowPasswordModal(false);
        passwordForm.resetFields();
        toast.success("Parol muvaffaqiyatli o'zgartirildi!");
      }
    } catch (error) {
      toast.error("Parol o'zgartirishda xato yuz berdi");
    }
  };

  const gameHistoryColumns = [
    {
      title: "O'yin",
      dataIndex: "gameName",
      key: "gameName",
      render: (name, record) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{record.rank}</span>
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Ball",
      dataIndex: "score",
      key: "score",
      render: (score) => formatScore(score),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: "Daraja",
      dataIndex: "level",
      key: "level",
      render: (level) => <Tag color="blue">{level}</Tag>,
    },
    {
      title: "Vaqt",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration}s`,
    },
    {
      title: "Aniqlik",
      dataIndex: "accuracy",
      key: "accuracy",
      render: (accuracy) => (
        <span className={accuracy >= 80 ? "text-green-600" : "text-orange-600"}>
          {accuracy}%
        </span>
      ),
    },
    {
      title: "Sana",
      dataIndex: "date",
      key: "date",
      render: (date) => getRelativeTime(date),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const userLevel = calculateUserLevel(user?.totalScore || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<FaUser />}
                className="border-4 border-white shadow-lg"
              />
              {editMode && (
                <Button
                  icon={<FaCamera />}
                  className="absolute bottom-0 right-0 rounded-full"
                  size="small"
                />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
                <div>
                  <Title level={2} className="mb-0">
                    {user?.name}
                  </Title>
                  <Text className="text-gray-600">{user?.email}</Text>
                  <div className="flex items-center space-x-2 mt-2">
                    <Tag color="gold" className="flex items-center space-x-1">
                      <FaStar className="text-xs" />
                      <span>Daraja {userLevel.level}</span>
                    </Tag>
                    <Tag color="blue">
                      {formatScore(user?.totalScore || 0)} ball
                    </Tag>
                  </div>
                </div>

                <div className="ml-auto">
                  {!editMode ? (
                    <Button
                      type="primary"
                      icon={<FaEdit />}
                      onClick={() => setEditMode(true)}
                    >
                      Tahrirlash
                    </Button>
                  ) : (
                    <Space>
                      <Button
                        icon={<FaSave />}
                        onClick={() => profileForm.submit()}
                        type="primary"
                      >
                        Saqlash
                      </Button>
                      <Button onClick={() => setEditMode(false)}>
                        Bekor qilish
                      </Button>
                    </Space>
                  )}
                </div>
              </div>

              {/* Level Progress */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-sm mb-1">
                  <span>Daraja {userLevel.level}</span>
                  <span>{userLevel.progress}%</span>
                </div>
                <Progress
                  percent={userLevel.progress}
                  strokeColor={{
                    "0%": "#667eea",
                    "100%": "#764ba2",
                  }}
                  showInfo={false}
                />
                <Text className="text-xs text-gray-500">
                  Keyingi darajagacha: {formatScore(userLevel.scoreToNext)} ball
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Profile Form */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card title="Profil ma'lumotlarini tahrirlash">
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="To'liq ism"
                    rules={[
                      { required: true, message: "Ismni kiriting" },
                      {
                        min: 2,
                        message:
                          "Ism kamida 2 ta belgidan iborat bo'lishi kerak",
                      },
                    ]}
                  >
                    <Input placeholder="Ismingizni kiriting" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Email kiriting" },
                      {
                        type: "email",
                        message: "To'g'ri email formatini kiriting",
                      },
                    ]}
                  >
                    <Input placeholder="Email manzilingiz" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Tabs defaultActiveKey="overview" size="large">
            {/* Overview Tab */}
            <TabPane
              tab={
                <span>
                  <FaUser className="mr-2" />
                  Ko'rinish
                </span>
              }
              key="overview"
            >
              <Row gutter={[24, 24]}>
                {/* Stats Cards */}
                <Col xs={24} md={16}>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} lg={6}>
                      <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <Statistic
                          title="O'yinlar soni"
                          value={user?.gamesPlayed || 0}
                          prefix={<FaGamepad className="text-blue-600" />}
                          valueStyle={{ color: "#2563eb" }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                      <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
                        <Statistic
                          title="Yutuqlar"
                          value={achievements.filter((a) => a.unlocked).length}
                          prefix={<FaTrophy className="text-green-600" />}
                          valueStyle={{ color: "#16a34a" }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                      <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100">
                        <Statistic
                          title="Eng uzun seriya"
                          value={15}
                          suffix="kun"
                          prefix={<FaFire className="text-purple-600" />}
                          valueStyle={{ color: "#9333ea" }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                      <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100">
                        <Statistic
                          title="O'rtacha ball"
                          value={
                            user?.gamesPlayed > 0
                              ? Math.round(
                                  (user?.totalScore || 0) / user.gamesPlayed
                                )
                              : 0
                          }
                          prefix={<FaTable className="text-orange-600" />}
                          valueStyle={{ color: "#ea580c" }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Col>

                {/* Quick Actions */}
                <Col xs={24} md={8}>
                  <Card title="Tezkor amallar" className="h-full">
                    <Space direction="vertical" className="w-full">
                      <Button
                        icon={<FaLock />}
                        onClick={() => setShowPasswordModal(true)}
                        block
                      >
                        Parolni o'zgartirish
                      </Button>
                      <Button icon={<FaBrain />} type="primary" block>
                        Yangi o'yin boshlash
                      </Button>
                      <Button icon={<FaTrophy />} block>
                        Reytingni ko'rish
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Game History Tab */}
            <TabPane
              tab={
                <span>
                  <FaGamepad className="mr-2" />
                  O'yinlar tarixi
                </span>
              }
              key="history"
            >
              <Table
                columns={gameHistoryColumns}
                dataSource={gameHistory}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                scroll={{ x: 800 }}
              />
            </TabPane>

            {/* Achievements Tab */}
            <TabPane
              tab={
                <span>
                  <FaTrophy className="mr-2" />
                  Yutuqlar
                </span>
              }
              key="achievements"
            >
              <Row gutter={[24, 24]}>
                {achievements.map((achievement, index) => (
                  <Col xs={24} sm={12} lg={8} key={achievement.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`h-full ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="text-center space-y-3">
                          <div
                            className={`text-4xl ${
                              achievement.unlocked ? "" : "grayscale opacity-50"
                            }`}
                          >
                            {achievement.icon}
                          </div>
                          <div>
                            <Title level={5} className="mb-1">
                              {achievement.name}
                            </Title>
                            <Text className="text-gray-600 text-sm">
                              {achievement.description}
                            </Text>
                          </div>
                          {achievement.unlocked ? (
                            <Tag color="gold" className="mt-2">
                              <FaMedal className="mr-1" />
                              {formatDate(achievement.unlockedDate)}
                            </Tag>
                          ) : (
                            <div className="mt-2">
                              <Progress
                                percent={achievement.progress}
                                size="small"
                                strokeColor="#fbbf24"
                              />
                              <Text className="text-xs text-gray-500">
                                {achievement.progress}% tugallandi
                              </Text>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </TabPane>

            {/* Settings Tab */}
            <TabPane
              tab={
                <span>
                  <FaClock className="mr-2" />
                  Sozlamalar
                </span>
              }
              key="settings"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="O'yin sozlamalari">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Text strong>Ovoz effektlari</Text>
                          <div className="text-xs text-gray-500">
                            O'yin ovozlarini yoqish/o'chirish
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <div>
                          <Text strong>Animatsiyalar</Text>
                          <div className="text-xs text-gray-500">
                            O'yin animatsiyalarini yoqish/o'chirish
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <div>
                          <Text strong>Bildirishnomalar</Text>
                          <div className="text-xs text-gray-500">
                            Yangi yutuqlar haqida xabar berish
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Maxfiylik sozlamalari">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Text strong>Profil ochiq</Text>
                          <div className="text-xs text-gray-500">
                            Boshqalar sizning profilingizni ko'ra oladi
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <div>
                          <Text strong>Reytingda ko'rsatish</Text>
                          <div className="text-xs text-gray-500">
                            Reytingda ismingizni ko'rsatish
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Divider />
                      <div>
                        <Text strong>Til tanlash</Text>
                        <Select
                          defaultValue="uz"
                          className="w-full mt-2"
                          options={[
                            { value: "uz", label: "O'zbekcha" },
                            { value: "ru", label: "Русский" },
                            { value: "en", label: "English" },
                          ]}
                        />
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>

      {/* Password Change Modal */}
      <Modal
        title="Parolni o'zgartirish"
        open={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Joriy parol"
            rules={[{ required: true, message: "Joriy parolni kiriting" }]}
          >
            <Input.Password
              placeholder="Joriy parolingiz"
              iconRender={(visible) => (visible ? <FaEye /> : <FaEyeSlash />)}
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Yangi parol"
            rules={[
              { required: true, message: "Yangi parolni kiriting" },
              {
                min: 6,
                message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
              },
            ]}
          >
            <Input.Password
              placeholder="Yangi parolingiz"
              iconRender={(visible) => (visible ? <FaEye /> : <FaEyeSlash />)}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Parolni tasdiqlang"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Parolni tasdiqlang" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Parollar mos kelmaydi!"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Yangi parolni takrorlang"
              iconRender={(visible) => (visible ? <FaEye /> : <FaEyeSlash />)}
            />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowPasswordModal(false)}>
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit">
              Saqlash
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
