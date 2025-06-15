import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (values) => {
    if (!acceptTerms) {
      form.setFields([
        {
          name: "terms",
          errors: ["Foydalanish shartlarini qabul qilishingiz shart"],
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const result = await register(values);
      if (result.success) {
        navigate("/games");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
                Mental Math'ga xush kelibsiz!
              </Title>
              <Text className="text-gray-600">
                Aqlingizni rivojlantirish sayohatini boshlang
              </Text>
            </div>

            {/* Register Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
              className="space-y-4"
            >
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Ismingizni kiriting" },
                  {
                    min: 2,
                    message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak",
                  },
                  {
                    max: 50,
                    message: "Ism 50 ta belgidan ko'p bo'lmasligi kerak",
                  },
                ]}
              >
                <Input
                  prefix={<FaUser className="text-gray-400" />}
                  placeholder="Ismingiz"
                  className="rounded-lg h-12"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Email manzilini kiriting" },
                  {
                    type: "email",
                    message: "To'g'ri email formatini kiriting",
                  },
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

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Parolni tasdiqlang" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Parollar mos kelmaydi!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<FaLock className="text-gray-400" />}
                  placeholder="Parolni tasdiqlang"
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

              {/* Terms and Conditions */}
              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Shartlarni qabul qilishingiz kerak")
                          ),
                  },
                ]}
              >
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="text-sm"
                >
                  <Text className="text-gray-600 text-sm">
                    Men{" "}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      foydalanish shartlari
                    </Link>{" "}
                    va{" "}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      maxfiylik siyosati
                    </Link>{" "}
                    bilan tanishib chiqdim va roziman
                  </Text>
                </Checkbox>
              </Form.Item>

              <Form.Item className="mb-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  disabled={!acceptTerms}
                  className="h-12 text-lg font-medium bg-gradient-to-r from-primary-500 to-secondary-500 border-none rounded-lg"
                >
                  {loading
                    ? "Ro'yxatdan o'tkazilmoqda..."
                    : "Ro'yxatdan o'tish"}
                </Button>
              </Form.Item>
            </Form>

            <Divider className="my-6">
              <Text className="text-gray-500 text-sm">yoki</Text>
            </Divider>

            {/* Login Link */}
            <div className="text-center">
              <Text className="text-gray-600">
                Hisobingiz bormi?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Kirish
                </Link>
              </Text>
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Title level={5} className="mb-3 text-blue-800">
                🎯 Nima olasiz:
              </Title>
              <div className="space-y-2 text-blue-700 text-sm">
                <div className="flex items-center space-x-2">
                  <span>🧠</span>
                  <Text className="text-blue-700 text-sm">
                    11 xil aqli o'yinlar
                  </Text>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📊</span>
                  <Text className="text-blue-700 text-sm">
                    Shaxsiy progress kuzatuvi
                  </Text>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🏆</span>
                  <Text className="text-blue-700 text-sm">
                    Reyting va yutuqlar
                  </Text>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <Text className="text-blue-700 text-sm">
                    Barcha qurilmalarda ishlaydi
                  </Text>
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
    </div>
  );
};

export default Register;
