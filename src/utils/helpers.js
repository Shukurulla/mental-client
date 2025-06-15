import { GAME_TYPES, USER_LEVELS, DIFFICULTY_LEVELS } from "./constants";

/**
 * Format score with thousand separators
 * @param {number} score - Score to format
 * @returns {string} Formatted score
 */
export const formatScore = (score) => {
  if (typeof score !== "number") return "0";
  return score.toLocaleString("uz-UZ");
};

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time
 */
export const formatTime = (seconds) => {
  if (typeof seconds !== "number" || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Format duration in human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Human readable duration
 */
export const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || seconds < 0) return "0 soniya";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} soat`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} daqiqa`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} soniya`);
  }

  return parts.join(" ");
};

/**
 * Format date to local string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date and time to local string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    if (diffDays === 1) return "Kecha";
    if (diffDays < 7) return `${diffDays} kun oldin`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} oy oldin`;
    return `${Math.floor(diffDays / 365)} yil oldin`;
  }

  if (diffHours > 0) {
    return `${diffHours} soat oldin`;
  }

  if (diffMinutes > 0) {
    return `${diffMinutes} daqiqa oldin`;
  }

  return "Hozir";
};

/**
 * Calculate user level based on total score
 * @param {number} totalScore - User's total score
 * @returns {object} Level information
 */
export const calculateUserLevel = (totalScore) => {
  const score = totalScore || 0;

  for (const [level, info] of Object.entries(USER_LEVELS)) {
    if (score >= info.minScore && score <= info.maxScore) {
      const progress =
        info.maxScore === Infinity
          ? 100
          : ((score - info.minScore) / (info.maxScore - info.minScore)) * 100;

      return {
        level: parseInt(level),
        name: info.name,
        progress: Math.round(progress),
        currentScore: score,
        minScore: info.minScore,
        maxScore: info.maxScore,
        scoreToNext: info.maxScore === Infinity ? 0 : info.maxScore - score + 1,
      };
    }
  }

  return {
    level: 1,
    name: USER_LEVELS[1].name,
    progress: 0,
    currentScore: score,
    minScore: 0,
    maxScore: USER_LEVELS[1].maxScore,
    scoreToNext: USER_LEVELS[1].maxScore - score + 1,
  };
};

/**
 * Get game information by ID
 * @param {string} gameId - Game ID
 * @returns {object|null} Game information
 */
export const getGameInfo = (gameId) => {
  return GAME_TYPES[gameId] || null;
};

/**
 * Calculate accuracy percentage
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} Accuracy percentage
 */
export const calculateAccuracy = (correct, total) => {
  if (!total || total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Calculate performance score based on time and accuracy
 * @param {number} baseScore - Base score
 * @param {number} timeBonus - Time bonus multiplier
 * @param {number} accuracy - Accuracy percentage
 * @returns {number} Final performance score
 */
export const calculatePerformanceScore = (
  baseScore,
  timeBonus = 1,
  accuracy = 100
) => {
  const accuracyMultiplier = accuracy / 100;
  return Math.round(baseScore * timeBonus * accuracyMultiplier);
};

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get device info
 * @returns {object} Device information
 */
export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    isMobile: isMobile(),
    platform: navigator.platform,
    language: navigator.language,
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate array of numbers
 * @param {number} start - Start number
 * @param {number} end - End number
 * @returns {Array} Array of numbers
 */
export const range = (start, end) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
export const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Get color by game difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {string} Color code
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: "#52c41a",
    medium: "#faad14",
    hard: "#f5222d",
    expert: "#722ed1",
  };
  return colors[difficulty] || colors.medium;
};

/**
 * Calculate reading speed (WPM)
 * @param {number} wordCount - Number of words
 * @param {number} timeInSeconds - Reading time in seconds
 * @returns {number} Words per minute
 */
export const calculateReadingSpeed = (wordCount, timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds === 0) return 0;
  return Math.round((wordCount / timeInSeconds) * 60);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== "number") return "0%";
  return `${value.toFixed(decimals)}%`;
};

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Safe JSON parse
 * @param {string} str - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export default {
  formatScore,
  formatTime,
  formatDuration,
  formatDate,
  formatDateTime,
  getRelativeTime,
  calculateUserLevel,
  getGameInfo,
  calculateAccuracy,
  calculatePerformanceScore,
  generateId,
  debounce,
  throttle,
  deepClone,
  isMobile,
  getDeviceInfo,
  isValidEmail,
  range,
  shuffleArray,
  getRandomElement,
  capitalize,
  toTitleCase,
  getDifficultyColor,
  calculateReadingSpeed,
  formatPercentage,
  isEmpty,
  safeJsonParse,
  storage,
};
