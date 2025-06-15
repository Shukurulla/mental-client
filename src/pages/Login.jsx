import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, Typography, Divider, Space } from "antd";
import { FaEye, FaEyeSlash, FaBrain, FaEnvelope, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
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
          <div className="text-center">
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Text className="text-blue-800 text-sm block mb-2 font-medium">
              Demo hisob:
            </Text>
            <Space direction="vertical" size="small" className="w-full">
              <Text className="text-blue-700 text-xs">
                📧 Email: demo@mentalmath.uz
              </Text>
              <Text className="text-blue-700 text-xs">🔑 Parol: demo123</Text>
            </Space>
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
