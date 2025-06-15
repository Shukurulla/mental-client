import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  Checkbox,
} from "antd";
import {
  FaEye,
  FaEyeSlash,
  FaBrain,
  FaEnvelope,
  FaLock,
  FaCrown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname || "/games";

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    form.setFieldsValue({
      email: "demo@mentalmath.uz",
      password: "demo123",
    });
  };

  // Development uchun admin login
  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      // Mock admin login for development
      const adminCredentials = {
        email: "admin@mentalmath.uz",
        password: "admin123",
      };

      const result = await login(adminCredentials);
      if (result.success) {
        navigate("/admin", { replace: true });
      } else {
        // Agar API mavjud bo'lmasa, mock admin user yaratish
        const { useAuthStore } = await import("../stores/authStore");
        const { set } = useAuthStore.getState();

        const adminUser = {
          id: 1,
          name: "Admin User",
          email: "admin@mentalmath.uz",
          role: "admin",
          level: 20,
          totalScore: 25000,
          gamesPlayed: 150,
          avatar: null,
        };

        set({
          user: adminUser,
          token: "mock-admin-token-" + Date.now(),
          isAuthenticated: true,
        });

        navigate("/admin", { replace: true });
      }
    } catch (error) {
      console.error("Admin login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaBrain className="text-white text-2xl" />
            </motion.div>
            <Title level={2} className="text-gray-800 mb-2">
              Xush kelibsiz!
            </Title>
            <Text className="text-gray-600">
              Hisobingizga kiring va o'yinni davom eting
            </Text>
          </div>

          {/* Development Admin Login */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6">
              <Button
                type="primary"
                block
                icon={<FaCrown />}
                onClick={handleAdminLogin}
                loading={loading}
                className="h-12 text-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 border-none rounded-lg mb-4"
              >
                🔐 Admin sifatida kirish (Dev)
              </Button>
              <Divider className="my-4">
                <Text className="text-gray-500 text-sm">yoki oddiy login</Text>
              </Divider>
            </div>
          )}

          {/* Login Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email manzilini kiriting" },
                { type: "email", message: "To'g'ri email formatini kiriting" },
              ]}
            >
              <Input
                prefix={<FaEnvelope className="text-gray-400" />}
                placeholder="Email manzilingiz"
                className="rounded-lg h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Parolni kiriting" },
                {
                  min: 6,
                  message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
                },
              ]}
            >
              <Input.Password
                prefix={<FaLock className="text-gray-400" />}
                placeholder="Parolingiz"
                className="rounded-lg h-12"
                iconRender={(visible) =>
                  visible ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )
                }
              />
            </Form.Item>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                <Text className="text-gray-600 text-sm">Meni eslab qol</Text>
              </Checkbox>
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Parolni unutdingizmi?
              </Link>
            </div>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12 text-lg font-medium bg-gradient-to-r from-primary-500 to-secondary-500 border-none rounded-lg"
              >
                {loading ? "Kirish..." : "Kirish"}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6">
            <Text className="text-gray-500 text-sm">yoki</Text>
          </Divider>

          {/* Register Link */}
          <div className="text-center mb-6">
            <Text className="text-gray-600">
              Hisobingiz yo'qmi?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Ro'yxatdan o'ting
              </Link>
            </Text>
          </div>

          {/* Demo Account */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <Text className="text-blue-800 text-sm font-medium">
                Demo hisobni sinab ko'ring:
              </Text>
              <Button
                type="link"
                size="small"
                onClick={handleDemoLogin}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                To'ldirish
              </Button>
            </div>
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center justify-between">
                <Text className="text-blue-700 text-xs">📧 Email:</Text>
                <Text className="text-blue-700 text-xs font-mono">
                  demo@mentalmath.uz
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-blue-700 text-xs">🔑 Parol:</Text>
                <Text className="text-blue-700 text-xs font-mono">demo123</Text>
              </div>
            </Space>
          </div>

          {/* Admin Access Info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Title level={5} className="mb-3 text-purple-800">
                👑 Admin Panel:
              </Title>
              <div className="space-y-1 text-purple-700 text-xs">
                <div className="flex items-center justify-between">
                  <Text className="text-purple-700 text-xs">📧 Email:</Text>
                  <Text className="text-purple-700 text-xs font-mono">
                    admin@mentalmath.uz
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-purple-700 text-xs">🔑 Parol:</Text>
                  <Text className="text-purple-700 text-xs font-mono">
                    admin123
                  </Text>
                </div>
                <div className="mt-2 text-center">
                  <Text className="text-purple-600 text-xs">
                    Yuqoridagi "Admin sifatida kirish" tugmasini bosing
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Quick Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <Title level={5} className="mb-3 text-green-800">
              ⚡ Tez boshlash:
            </Title>
            <div className="grid grid-cols-2 gap-2 text-green-700 text-xs">
              <div className="flex items-center space-x-1">
                <span>🎮</span>
                <Text className="text-green-700 text-xs">11 ta o'yin</Text>
              </div>
              <div className="flex items-center space-x-1">
                <span>🏆</span>
                <Text className="text-green-700 text-xs">Reyting</Text>
              </div>
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <Text className="text-green-700 text-xs">Statistika</Text>
              </div>
              <div className="flex items-center space-x-1">
                <span>🎯</span>
                <Text className="text-green-700 text-xs">Yutuqlar</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Text className="text-gray-500 text-sm">
            © 2024 Mental Math. Barcha huquqlar himoyalangan.
          </Text>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
