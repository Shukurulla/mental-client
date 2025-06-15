import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Result, Button } from "antd";
import { FaLock } from "react-icons/fa";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin route but user is not admin
  if (adminOnly && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Result
          status="403"
          title="403"
          subTitle="Kechirasiz, bu sahifaga kirish huquqingiz yo'q."
          icon={<FaLock className="text-6xl text-red-500 mx-auto" />}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Orqaga qaytish
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
