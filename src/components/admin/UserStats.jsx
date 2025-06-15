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
  DatePicker,
  Statistic,
  Progress,
  Modal,
  Form,
  Space,
  Tooltip,
  Popconfirm,
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
import { adminAPI } from "../../utils/api";
import { formatDate, formatScore, getRelativeTime } from "../../utils/helpers";
import toast from "react-hot-toast";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserStats = () => {
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
    level: "all",
    dateRange: [],
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Simulate API call with mock data
      const mockUsers = [
        {
          id: 1,
          name: "Ahmadjon Karimov",
          email: "ahmadjon@example.com",
          avatar: null,
          level: 12,
          totalScore: 15420,
          gamesPlayed: 247,
          lastLogin: "2024-01-15T14:30:00Z",
          joinDate: "2023-08-12T10:00:00Z",
          isActive: true,
          role: "user",
          avgGameTime: 145,
          favoriteGame: "numberMemory",
          achievements: 8,
          streak: 12,
        },
        {
          id: 2,
          name: "Malika Sultanova",
          email: "malika@example.com",
          avatar: null,
          level: 15,
          totalScore: 18950,
          gamesPlayed: 312,
          lastLogin: "2024-01-15T16:45:00Z",
          joinDate: "2023-07-20T15:30:00Z",
          isActive: true,
          role: "user",
          avgGameTime: 132,
          favoriteGame: "schulteTable",
          achievements: 12,
          streak: 25,
        },
        {
          id: 3,
          name: "Bobur Mahmudov",
          email: "bobur@example.com",
          avatar: null,
          level: 8,
          totalScore: 9650,
          gamesPlayed: 178,
          lastLogin: "2024-01-14T20:15:00Z",
          joinDate: "2023-11-05T09:20:00Z",
          isActive: true,
          role: "user",
          avgGameTime: 168,
          favoriteGame: "mathSystems",
          achievements: 5,
          streak: 7,
        },
        {
          id: 4,
          name: "Admin User",
          email: "admin@mentalmath.uz",
          avatar: null,
          level: 20,
          totalScore: 25000,
          gamesPlayed: 150,
          lastLogin: "2024-01-15T18:00:00Z",
          joinDate: "2023-06-01T00:00:00Z",
          isActive: true,
          role: "admin",
          avgGameTime: 120,
          favoriteGame: "all",
          achievements: 20,
          streak: 50,
        },
      ];

      setUsers(mockUsers);
      setPagination((prev) => ({
        ...prev,
        total: mockUsers.length,
      }));
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xato:", error);
      toast.error("Foydalanuvchilarni yuklashda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action, userId) => {
    try {
      switch (action) {
        case "view":
          const user = users.find((u) => u.id === userId);
          setSelectedUser(user);
          setShowUserModal(true);
          break;
        case "edit":
          const editUser = users.find((u) => u.id === userId);
          setSelectedUser(editUser);
          editForm.setFieldsValue(editUser);
          setShowEditModal(true);
          break;
        case "toggle":
          // Toggle user active status
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, isActive: !user.isActive } : user
            )
          );
          toast.success("Foydalanuvchi holati o'zgartirildi");
          break;
        case "delete":
          // Remove user from list
          setUsers((prev) => prev.filter((user) => user.id !== userId));
          toast.success("Foydalanuvchi o'chirildi");
          break;
      }
    } catch (error) {
      console.error("Foydalanuvchi amalini bajarishda xato:", error);
      toast.error("Amalni bajarishda xato yuz berdi");
    }
  };

  const handleEditUser = async (values) => {
    try {
      // Update user in the list
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? { ...user, ...values } : user
        )
      );

      setShowEditModal(false);
      toast.success("Foydalanuvchi ma'lumotlari yangilandi");
    } catch (error) {
      console.error("Foydalanuvchini yangilashda xato:", error);
      toast.error("Yangilashda xato yuz berdi");
    }
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
            className={record.role === "admin" ? "border-2 border-gold" : ""}
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
          {level}
        </Tag>
      ),
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: "Umumiy ball",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => formatScore(score),
      sorter: (a, b) => a.totalScore - b.totalScore,
    },
    {
      title: "O'yinlar",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      sorter: (a, b) => a.gamesPlayed - b.gamesPlayed,
    },
    {
      title: "Oxirgi kirish",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => (
        <Tooltip title={formatDate(date)}>
          <span>{getRelativeTime(date)}</span>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
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
          <Tooltip title="Ko'rish">
            <Button
              icon={<FaEye />}
              size="small"
              type="link"
              onClick={() => handleUserAction("view", record.id)}
            />
          </Tooltip>
          <Tooltip title="Tahrirlash">
            <Button
              icon={<FaEdit />}
              size="small"
              type="link"
              onClick={() => handleUserAction("edit", record.id)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Bloklash" : "Aktivlashtirish"}>
            <Button
              icon={record.isActive ? <FaBan /> : <FaUnlock />}
              size="small"
              type="link"
              onClick={() => handleUserAction("toggle", record.id)}
              className={record.isActive ? "text-orange-500" : "text-green-500"}
            />
          </Tooltip>
          {record.role !== "admin" && (
            <Tooltip title="O'chirish">
              <Popconfirm
                title="Foydalanuvchini o'chirishni tasdiqlaysizmi?"
                onConfirm={() => handleUserAction("delete", record.id)}
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

  const filteredUsers = users.filter((user) => {
    if (
      filters.search &&
      !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !user.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.status !== "all") {
      if (filters.status === "active" && !user.isActive) return false;
      if (filters.status === "inactive" && user.isActive) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={3}>👥 Foydalanuvchilar Statistikasi</Title>
        <Space>
          <Button icon={<FaUserPlus />} type="primary">
            Yangi foydalanuvchi
          </Button>
          <Button icon={<FaDownload />}>Eksport</Button>
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
                value={users.length}
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
                value={users.filter((u) => u.isActive).length}
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
                value={(
                  users.reduce((sum, u) => sum + u.level, 0) / users.length
                ).toFixed(1)}
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
                value={users.reduce((sum, u) => sum + u.gamesPlayed, 0)}
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
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              style={{ width: "100%" }}
            >
              <Option value="all">Barchasi</Option>
              <Option value="active">Faol</Option>
              <Option value="inactive">Nofaol</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              value={filters.level}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, level: value }))
              }
              style={{ width: "100%" }}
            >
              <Option value="all">Barcha darajalar</Option>
              <Option value="1-5">1-5 daraja</Option>
              <Option value="6-10">6-10 daraja</Option>
              <Option value="11-15">11-15 daraja</Option>
              <Option value="16+">16+ daraja</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) =>
                setFilters((prev) => ({ ...prev, dateRange: dates }))
              }
              format="DD.MM.YYYY"
              style={{ width: "100%" }}
            />
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
            dataSource={filteredUsers}
            rowKey="id"
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
                <Statistic title="Daraja" value={selectedUser.level} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Umumiy ball"
                  value={formatScore(selectedUser.totalScore)}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="O'yinlar soni"
                  value={selectedUser.gamesPlayed}
                />
              </Col>
              <Col span={12}>
                <Statistic title="Yutuqlar" value={selectedUser.achievements} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Eng uzun seriya"
                  value={selectedUser.streak}
                  suffix="kun"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="O'rtacha o'yin vaqti"
                  value={selectedUser.avgGameTime}
                  suffix="s"
                />
              </Col>
            </Row>

            <div className="pt-4 border-t">
              <Title level={5}>Qo'shimcha ma'lumotlar</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Sevimli o'yin:</Text>
                  <Text strong>{selectedUser.favoriteGame}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Ro'yxatdan o'tgan sana:</Text>
                  <Text>{formatDate(selectedUser.joinDate)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Oxirgi kirish:</Text>
                  <Text>{formatDate(selectedUser.lastLogin)}</Text>
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
          <Form name="isActive" label="Holat" valuePropName="checked">
            <input type="checkbox" /> Faol
          </Form>
        </Form>
      </Modal>
    </div>
  );
};

export default UserStats;
