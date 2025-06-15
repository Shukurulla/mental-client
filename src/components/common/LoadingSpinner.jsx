import { Spin } from "antd";
import { FaBrain } from "react-icons/fa";

const LoadingSpinner = ({ size = "default", text = "Yuklanmoqda..." }) => {
  const spinnerSizes = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12",
  };

  const textSizes = {
    small: "text-sm",
    default: "text-base",
    large: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Animated brain icon */}
        <div className={`${spinnerSizes[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaBrain
              className={`text-primary-500 ${
                size === "large"
                  ? "text-lg"
                  : size === "small"
                  ? "text-xs"
                  : "text-sm"
              }`}
            />
          </div>
        </div>
      </div>

      {text && (
        <p
          className={`text-gray-600 font-medium ${textSizes[size]} animate-pulse`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
