import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Space } from "antd";
import {
  FaBrain,
  FaUser,
  FaSignOutAlt,
  FaTrophy,
  FaGamepad,
  FaChartLine,
  FaCog,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useAuthStore } from "../stores/authStore";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <FaUser className="text-gray-600" />,
      label: "Profil",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <FaCog className="text-gray-600" />,
      label: "Sozlamalar",
      onClick: () => navigate("/profile?tab=settings"),
    },
    user?.role === "admin" && {
      key: "admin",
      icon: <MdDashboard className="text-blue-600" />,
      label: "Admin Panel",
      onClick: () => navigate("/admin"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <FaSignOutAlt className="text-red-600" />,
      label: "Chiqish",
      onClick: handleLogout,
    },
  ].filter(Boolean);

  const menuItems = [
    {
      key: "/",
      icon: <FaBrain />,
      label: <Link to="/">Bosh sahifa</Link>,
    },
    isAuthenticated && {
      key: "/games",
      icon: <FaGamepad />,
      label: <Link to="/games">O'yinlar</Link>,
    },
    isAuthenticated && {
      key: "/leaderboard",
      icon: <FaTrophy />,
      label: <Link to="/leaderboard">Reyting</Link>,
    },
  ].filter(Boolean);

  return (
    <AntHeader className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 px-4">
      <div className="container mx-auto flex items-center justify-between h-full">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 text-xl font-bold text-gray-800 hover:text-primary-600 transition-colors"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <FaBrain className="text-white text-lg" />
          </div>
          <span className="hidden sm:block">Mental Math</span>
        </Link>

        {/* Navigation Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="bg-transparent border-none flex-1 justify-center max-w-md"
          onSelect={({ key }) => setSelectedKey(key)}
        />

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Space size="middle">
              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
                  <Avatar
                    src={user?.avatar}
                    icon={<FaUser />}
                    className="border-2 border-primary-200"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.totalScore || 0} ball
                    </div>
                  </div>
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Space>
              <Link to="/login">
                <Button
                  type="text"
                  className="text-gray-600 hover:text-primary-600"
                >
                  Kirish
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  type="primary"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 border-none"
                >
                  Ro'yxatdan o'tish
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
