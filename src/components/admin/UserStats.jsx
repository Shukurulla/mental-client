import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Avatar,
  Button,
  Input,
  Select,
  Statistic,
  Modal,
  Form,
  Space,
  Tooltip,
  Popconfirm,
  message,
} from "antd";
import {
  FaUser,
  FaEdit,
  FaTrash,
  FaEye,
  FaBan,
  FaUnlock,
  FaSearch,
  FaDownload,
  FaUserPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://mental-server.vercel.app/api";

const UserStats = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    role: "all",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm] = Form.useForm();
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    averageLevel: 0,
    totalGames: 0,
  });

  // API headers with auth token
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    loadUsers();
    loadUserStatistics();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.role !== "all" && { role: filters.role }),
      });

      const response = await axios.get(
        `${API_BASE_URL}/admin/users?${params}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.total,
          current: response.data.data.currentPage,
        }));
      }
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xato:", error);
      message.error("Foydalanuvchilarni yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStatistics = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/dashboard`,
        getAuthHeaders()
      );

      if (response.data.success) {
        const data = response.data.data;
        setUserStats({
          total: data.users?.total || 0,
          active: data.users?.active || 0,
          averageLevel: data.users?.averageLevel || 0,
          totalGames: data.games?.total || 0,
        });
      }
    } catch (error) {
      console.error("User statistics yuklashda xato:", error);
    }
  };

  const handleUserAction = async (action, userId) => {
    try {
      switch (action) {
        case "view":
          const userResponse = await axios.get(
            `${API_BASE_URL}/admin/users/${userId}`,
            getAuthHeaders()
          );
          if (userResponse.data.success) {
            setSelectedUser(userResponse.data.data.user);
            setShowUserModal(true);
          }
          break;
        case "edit":
          const editResponse = await axios.get(
            `${API_BASE_URL}/admin/users/${userId}`,
            getAuthHeaders()
          );
          if (editResponse.data.success) {
            const user = editResponse.data.data.user;
            setSelectedUser(user);
            editForm.setFieldsValue(user);
            setShowEditModal(true);
          }
          break;
        case "toggle":
          const user = users.find((u) => u._id === userId);
          const updateResponse = await axios.put(
            `${API_BASE_URL}/admin/users/${userId}`,
            { isActive: !user.isActive },
            getAuthHeaders()
          );
          if (updateResponse.data.success) {
            message.success("Foydalanuvchi holati o'zgartirildi");
            loadUsers();
          }
          break;
        case "delete":
          await axios.delete(
            `${API_BASE_URL}/admin/users/${userId}`,
            getAuthHeaders()
          );
          message.success("Foydalanuvchi o'chirildi");
          loadUsers();
          break;
      }
    } catch (error) {
      console.error("Foydalanuvchi amalini bajarishda xato:", error);
      message.error("Amalni bajarishda xato yuz berdi");
    }
  };

  const handleEditUser = async (values) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${selectedUser._id}`,
        values,
        getAuthHeaders()
      );

      if (response.data.success) {
        message.success("Foydalanuvchi ma'lumotlari yangilandi");
        setShowEditModal(false);
        loadUsers();
      }
    } catch (error) {
      console.error("Foydalanuvchini yangilashda xato:", error);
      message.error("Yangilashda xato yuz berdi");
    }
  };

  const exportUsers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/export/users`,
        getAuthHeaders()
      );

      // Faylni yuklab olish
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users_export_${Date.now()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      message.success("Foydalanuvchilar muvaffaqiyatli eksport qilindi");
    } catch (error) {
      console.error("Eksport qilishda xato:", error);
      message.error("Eksport qilishda xato yuz berdi");
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: "Foydalanuvchi",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={record.avatar}
            icon={<FaUser />}
            className={
              record.role === "admin" ? "border-2 border-yellow-400" : ""
            }
          />
          <div>
            <div className="font-medium flex items-center space-x-2">
              <span>{name}</span>
              {record.role === "admin" && (
                <Tag color="gold" size="small">
                  Admin
                </Tag>
              )}
            </div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Daraja",
      dataIndex: "level",
      key: "level",
      render: (level) => (
        <Tag
          color={
            level >= 15
              ? "red"
              : level >= 10
              ? "orange"
              : level >= 5
              ? "blue"
              : "green"
          }
        >
          {level || 1}
        </Tag>
      ),
      sorter: true,
    },
    {
      title: "Umumiy ball",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => (score || 0).toLocaleString(),
      sorter: true,
    },
    {
      title: "O'yinlar",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      render: (games) => games || 0,
      sorter: true,
    },
    {
      title: "Oxirgi kirish",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => {
        if (!date) return "Hech qachon";
        const loginDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - loginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Bugun";
        if (diffDays === 2) return "Kecha";
        if (diffDays <= 7) return `${diffDays} kun oldin`;
        return loginDate.toLocaleDateString();
      },
      sorter: true,
    },
    {
      title: "Holat",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Faol" : "Nofaol"}
        </Tag>
      ),
      filters: [
        { text: "Faol", value: true },
        { text: "Nofaol", value: false },
      ],
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {record.role !== "admin" && (
            <Tooltip title="O'chirish">
              <Popconfirm
                title="Foydalanuvchini o'chirishni tasdiqlaysizmi?"
                onConfirm={() => handleUserAction("delete", record._id)}
                okText="Ha"
                cancelText="Yo'q"
              >
                <Button icon={<FaTrash />} size="small" type="link" danger />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={3}>👥 Foydalanuvchilar Statistikasi</Title>
        <Space>
          <Button icon={<FaUserPlus />} type="primary">
            Yangi foydalanuvchi
          </Button>
          <Button icon={<FaDownload />} onClick={exportUsers}>
            Eksport
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <Statistic
                title="Jami foydalanuvchilar"
                value={userStats.total}
                prefix="👥"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <Statistic
                title="Faol foydalanuvchilar"
                value={userStats.active}
                prefix="✅"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center">
              <Statistic
                title="O'rtacha daraja"
                value={userStats.averageLevel}
                precision={1}
                prefix="⭐"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center">
              <Statistic
                title="Jami o'yinlar"
                value={userStats.totalGames}
                prefix="🎮"
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: "100%" }}
            >
              <Option value="all">Barchasi</Option>
              <Option value="active">Faol</Option>
              <Option value="inactive">Nofaol</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={filters.role}
              onChange={(value) => handleFilterChange("role", value)}
              style={{ width: "100%" }}
            >
              <Option value="all">Barcha rollar</Option>
              <Option value="user">Foydalanuvchi</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize,
                }));
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} ta foydalanuvchi`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </motion.div>

      {/* User Details Modal */}
      <Modal
        title="Foydalanuvchi ma'lumotlari"
        open={showUserModal}
        onCancel={() => setShowUserModal(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b">
              <Avatar size={64} src={selectedUser.avatar} icon={<FaUser />} />
              <div>
                <Title level={4} className="mb-0">
                  {selectedUser.name}
                </Title>
                <Text className="text-gray-600">{selectedUser.email}</Text>
                <div className="mt-1">
                  <Tag color={selectedUser.role === "admin" ? "gold" : "blue"}>
                    {selectedUser.role === "admin"
                      ? "Administrator"
                      : "Foydalanuvchi"}
                  </Tag>
                </div>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Daraja" value={selectedUser.level || 1} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Umumiy ball"
                  value={(selectedUser.totalScore || 0).toLocaleString()}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="O'yinlar soni"
                  value={selectedUser.gamesPlayed || 0}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Yutuqlar"
                  value={selectedUser.achievements?.length || 0}
                />
              </Col>
            </Row>

            <div className="pt-4 border-t">
              <Title level={5}>Qo'shimcha ma'lumotlar</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Ro'yxatdan o'tgan sana:</Text>
                  <Text>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Oxirgi kirish:</Text>
                  <Text>
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleDateString()
                      : "Hech qachon"}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Holat:</Text>
                  <Tag color={selectedUser.isActive ? "green" : "red"}>
                    {selectedUser.isActive ? "Faol" : "Nofaol"}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Foydalanuvchini tahrirlash"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onOk={() => editForm.submit()}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditUser}>
          <Form.Item
            name="name"
            label="To'liq ism"
            rules={[{ required: true, message: "Ismni kiriting" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email kiriting" },
              { type: "email", message: "To'g'ri email formatini kiriting" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="level"
            label="Daraja"
            rules={[{ required: true, message: "Darajani kiriting" }]}
          >
            <Input type="number" min={1} max={20} />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Rolni tanlang" }]}
          >
            <Select>
              <Option value="user">Foydalanuvchi</Option>
              <Option value="admin">Administrator</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Holat" valuePropName="checked">
            <input type="checkbox" /> Faol
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserStats;
