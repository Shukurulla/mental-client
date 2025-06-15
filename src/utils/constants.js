// API endpoints
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Game types and their configurations
export const GAME_TYPES = {
  numberMemory: {
    id: "numberMemory",
    name: "Raqamni Eslab Qolish",
    description: "Ketma-ket ko'rsatiladigan raqamlarni eslab qoling",
    category: "memory",
    maxLevel: 20,
    scoreMultiplier: 10,
    difficulty: "medium",
    estimatedTime: 5, // minutes
    skills: ["Qisqa muddatli xotira", "Diqqat", "Koncentratsiya"],
  },
  tileMemory: {
    id: "tileMemory",
    name: "Plitkalar",
    description: "3x3 katakchalarning joyini eslab qoling",
    category: "memory",
    maxLevel: 15,
    scoreMultiplier: 15,
    difficulty: "medium",
    estimatedTime: 7,
    skills: ["Fazoviy xotira", "Naqsh tanib olish", "Vizual xotira"],
  },
  alphaNumMemory: {
    id: "alphaNumMemory",
    name: "Raqam va Harflar",
    description: "Raqam va harflar aralash ketma-ketlikni eslab qoling",
    category: "memory",
    maxLevel: 18,
    scoreMultiplier: 12,
    difficulty: "hard",
    estimatedTime: 6,
    skills: ["Aralash xotira", "Alfanumerik kodlash", "Ketma-ketlik"],
  },
  schulteTable: {
    id: "schulteTable",
    name: "Schulte Jadvali",
    description: "1-25 raqamlarini tartib bo'yicha toping",
    category: "attention",
    maxLevel: 10,
    scoreMultiplier: 20,
    difficulty: "medium",
    estimatedTime: 8,
    skills: ["Periferik ko'rish", "Diqqat", "Tezkor qidirish"],
  },
  doubleSchulte: {
    id: "doubleSchulte",
    name: "Ikkilangan Schulte",
    description: "Ikkita rangda raqamlarni navbatma-navbat toping",
    category: "attention",
    maxLevel: 8,
    scoreMultiplier: 25,
    difficulty: "hard",
    estimatedTime: 10,
    skills: ["Multitasking", "Ranglarni ajratish", "Diqqatni bo'lish"],
  },
  mathSystems: {
    id: "mathSystems",
    name: "Hisoblash Tizimlari",
    description: "Logarifm, daraja va ildiz hisoblash",
    category: "calculation",
    maxLevel: 12,
    scoreMultiplier: 18,
    difficulty: "hard",
    estimatedTime: 12,
    skills: ["Matematik amallar", "Logarifm", "Daraja va ildiz"],
  },
  gcdLcm: {
    id: "gcdLcm",
    name: "EKUB va EKUK",
    description: "Eng katta umumiy bo'luvchi va karralini toping",
    category: "calculation",
    maxLevel: 10,
    scoreMultiplier: 16,
    difficulty: "medium",
    estimatedTime: 8,
    skills: ["EKUB", "EKUK", "Bo'linish qoidalari"],
  },
  fractions: {
    id: "fractions",
    name: "Kasrlar",
    description: "Kasrlarni solishtiring va hisoblang",
    category: "calculation",
    maxLevel: 12,
    scoreMultiplier: 14,
    difficulty: "medium",
    estimatedTime: 10,
    skills: ["Kasrlar", "Solishtirish", "Matematik amallar"],
  },
  percentages: {
    id: "percentages",
    name: "Foizlar",
    description: "Foiz masalalarini yeching",
    category: "calculation",
    maxLevel: 15,
    scoreMultiplier: 12,
    difficulty: "easy",
    estimatedTime: 8,
    skills: ["Foizlar", "Proporsiya", "Amaliy matematik"],
  },
  readingSpeed: {
    id: "readingSpeed",
    name: "O'qish Tezligi",
    description: "Matnni tez o'qing va tushunishni tekshiring",
    category: "speed",
    maxLevel: 20,
    scoreMultiplier: 8,
    difficulty: "medium",
    estimatedTime: 15,
    skills: ["O'qish tezligi", "Tushunish", "Matn tahlili"],
  },
  hideAndSeek: {
    id: "hideAndSeek",
    name: "Berkinchoq",
    description: "Yashiringan raqamlarning joyini toping",
    category: "logic",
    maxLevel: 15,
    scoreMultiplier: 13,
    difficulty: "medium",
    estimatedTime: 6,
    skills: ["Mantiqiy fikrlash", "Naqsh topish", "Qidiruv"],
  },
};

// Game categories
export const GAME_CATEGORIES = {
  memory: {
    name: "Xotira o'yinlari",
    description: "Xotira qobiliyatini rivojlantirish",
    icon: "🧠",
    color: "blue",
  },
  attention: {
    name: "Diqqat mashqlari",
    description: "Diqqat va konsentratsiyani oshirish",
    icon: "🎯",
    color: "green",
  },
  calculation: {
    name: "Matematik amallar",
    description: "Hisoblash qobiliyatini oshirish",
    icon: "🧮",
    color: "purple",
  },
  logic: {
    name: "Mantiq masalalari",
    description: "Mantiqiy fikrlashni rivojlantirish",
    icon: "🧩",
    color: "orange",
  },
  speed: {
    name: "Tezlik mashqlari",
    description: "Fikrlash va ijro etish tezligini oshirish",
    icon: "⚡",
    color: "red",
  },
};

// User levels and experience
export const USER_LEVELS = {
  1: { name: "Yangi boshlovchi", minScore: 0, maxScore: 999 },
  2: { name: "O'rganuvchi", minScore: 1000, maxScore: 2999 },
  3: { name: "Harakat qiluvchi", minScore: 3000, maxScore: 5999 },
  4: { name: "Rivojlanuvchi", minScore: 6000, maxScore: 9999 },
  5: { name: "Tajribali", minScore: 10000, maxScore: 14999 },
  6: { name: "Malakali", minScore: 15000, maxScore: 19999 },
  7: { name: "Ekspert", minScore: 20000, maxScore: 29999 },
  8: { name: "Usta", minScore: 30000, maxScore: 49999 },
  9: { name: "Ustoz", minScore: 50000, maxScore: 99999 },
  10: { name: "Chempion", minScore: 100000, maxScore: Infinity },
};

// Achievement types
export const ACHIEVEMENT_TYPES = {
  SCORE: "score",
  LEVEL: "level",
  GAMES: "games",
  STREAK: "streak",
  TIME: "time",
  SPECIAL: "special",
};

// Achievement definitions
export const ACHIEVEMENTS = {
  // Score achievements
  FIRST_THOUSAND: {
    id: "FIRST_THOUSAND",
    name: "Birinchi ming",
    description: "1000 ball to'plang",
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 1000,
    icon: "🥉",
    color: "bronze",
  },
  FIVE_THOUSAND: {
    id: "FIVE_THOUSAND",
    name: "Besh ming",
    description: "5000 ball to'plang",
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 5000,
    icon: "🥈",
    color: "silver",
  },
  TEN_THOUSAND: {
    id: "TEN_THOUSAND",
    name: "O'n ming",
    description: "10000 ball to'plang",
    type: ACHIEVEMENT_TYPES.SCORE,
    requirement: 10000,
    icon: "🥇",
    color: "gold",
  },
  // Level achievements
  LEVEL_5: {
    id: "LEVEL_5",
    name: "5-daraja",
    description: "5-darajaga yeting",
    type: ACHIEVEMENT_TYPES.LEVEL,
    requirement: 5,
    icon: "⭐",
    color: "blue",
  },
  LEVEL_10: {
    id: "LEVEL_10",
    name: "10-daraja",
    description: "10-darajaga yeting",
    type: ACHIEVEMENT_TYPES.LEVEL,
    requirement: 10,
    icon: "🌟",
    color: "purple",
  },
  // Game achievements
  FIRST_GAME: {
    id: "FIRST_GAME",
    name: "Birinchi o'yin",
    description: "Birinchi o'yiningizni o'ynang",
    type: ACHIEVEMENT_TYPES.GAMES,
    requirement: 1,
    icon: "🎮",
    color: "green",
  },
  HUNDRED_GAMES: {
    id: "HUNDRED_GAMES",
    name: "Yuz o'yin",
    description: "100 ta o'yin o'ynang",
    type: ACHIEVEMENT_TYPES.GAMES,
    requirement: 100,
    icon: "🏆",
    color: "gold",
  },
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: {
    name: "Oson",
    multiplier: 0.8,
    color: "green",
    description: "Yangi boshlovchilar uchun",
  },
  MEDIUM: {
    name: "O'rta",
    multiplier: 1.0,
    color: "orange",
    description: "Standart qiyinlik",
  },
  HARD: {
    name: "Qiyin",
    multiplier: 1.3,
    color: "red",
    description: "Tajribali o'yinchilar uchun",
  },
  EXPERT: {
    name: "Ekspert",
    multiplier: 1.5,
    color: "purple",
    description: "Eng qiyin daraja",
  },
};

// Time periods for statistics
export const TIME_PERIODS = {
  TODAY: { name: "Bugun", days: 1 },
  WEEK: { name: "Bu hafta", days: 7 },
  MONTH: { name: "Bu oy", days: 30 },
  QUARTER: { name: "Bu chorak", days: 90 },
  YEAR: { name: "Bu yil", days: 365 },
  ALL_TIME: { name: "Barcha vaqt", days: null },
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PREFERENCES: "user_preferences",
  GAME_SETTINGS: "game_settings",
  THEME: "theme",
  LANGUAGE: "language",
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    UPDATE_PROFILE: "/auth/profile",
  },
  GAMES: {
    LIST: "/games",
    GET: (gameType) => `/games/${gameType}`,
    START: (gameType) => `/games/${gameType}/start`,
    SUBMIT: (gameType) => `/games/${gameType}/submit`,
  },
  RESULTS: {
    USER: (gameType) => `/results/user/${gameType}`,
    LEADERBOARD: (gameType) => `/results/leaderboard/${gameType}`,
    STATS: "/results/stats",
    PROGRESS: (gameType) => `/results/progress/${gameType}`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    ANALYTICS: (gameType) => `/admin/analytics/${gameType}`,
  },
};

// Default game settings
export const DEFAULT_GAME_SETTINGS = {
  numberMemory: {
    difficulty: "medium",
    displayTime: 1000,
    maxLevel: 20,
  },
  tileMemory: {
    difficulty: "medium",
    displayTime: 800,
    gridSize: 3,
  },
  schulteTable: {
    gridSize: 5,
    showNumbers: true,
    timeLimit: 120,
  },
  mathSystems: {
    difficulty: "medium",
    timeLimit: 60,
    problemTypes: ["power", "root", "log"],
  },
  percentages: {
    difficulty: "medium",
    timeLimit: 90,
    problemTypes: ["find_percent", "find_whole", "find_rate"],
  },
  readingSpeed: {
    difficulty: "medium",
    textLength: "medium",
    showTimer: true,
  },
};

// Animation variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  stagger: {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Color themes
export const THEMES = {
  LIGHT: {
    name: "Yorug'",
    primary: "#0ea5e9",
    secondary: "#8b5cf6",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1f2937",
  },
  DARK: {
    name: "Qorong'i",
    primary: "#3b82f6",
    secondary: "#a855f7",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
  },
};

// Responsive breakpoints
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Tarmoq xatosi. Iltimos, qaytadan urinib ko'ring.",
  AUTH_REQUIRED: "Iltimos, tizimga kiring.",
  PERMISSION_DENIED: "Bu amalni bajarish huquqingiz yo'q.",
  INVALID_INPUT: "Noto'g'ri ma'lumot kiritildi.",
  SERVER_ERROR: "Server xatosi yuz berdi.",
  GAME_NOT_FOUND: "O'yin topilmadi.",
  VALIDATION_ERROR: "Ma'lumotlar to'g'ri emas.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Muvaffaqiyatli kiritdingiz!",
  REGISTER_SUCCESS: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
  GAME_COMPLETED: "O'yin muvaffaqiyatli yakunlandi!",
  PROFILE_UPDATED: "Profil muvaffaqiyatli yangilandi!",
  PASSWORD_CHANGED: "Parol muvaffaqiyatli o'zgartirildi!",
};

// Validation rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\u0400-\u04FF\u0100-\u017F]+$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
};

export default {
  GAME_TYPES,
  GAME_CATEGORIES,
  USER_LEVELS,
  ACHIEVEMENTS,
  DIFFICULTY_LEVELS,
  TIME_PERIODS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  DEFAULT_GAME_SETTINGS,
  ANIMATION_VARIANTS,
  THEMES,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
};
