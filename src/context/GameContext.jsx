import { createContext, useContext, useReducer, useEffect } from "react";
import { gamesAPI, resultsAPI } from "../utils/api";
import {
  GAME_TYPES,
  DEFAULT_GAME_SETTINGS,
  ERROR_MESSAGES,
} from "../utils/constants";
import { storage } from "../utils/helpers";
import toast from "react-hot-toast";

// Game context
const GameContext = createContext();

// Action types
const GAME_ACTIONS = {
  LOADING: "LOADING",
  SET_GAMES: "SET_GAMES",
  SET_CURRENT_GAME: "SET_CURRENT_GAME",
  SET_GAME_STATE: "SET_GAME_STATE",
  SET_GAME_SETTINGS: "SET_GAME_SETTINGS",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  SET_RESULTS: "SET_RESULTS",
  SET_LEADERBOARD: "SET_LEADERBOARD",
  SET_USER_STATS: "SET_USER_STATS",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  RESET_GAME: "RESET_GAME",
};

// Game states
export const GAME_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  PLAYING: "playing",
  PAUSED: "paused",
  FINISHED: "finished",
  ERROR: "error",
};

// Initial state
const initialState = {
  // Games list
  games: [],
  isLoadingGames: false,

  // Current game
  currentGame: null,
  gameState: GAME_STATES.IDLE,
  gameData: null,
  gameSettings: {},

  // Progress tracking
  score: 0,
  level: 1,
  lives: 3,
  correctAnswers: 0,
  totalQuestions: 0,
  startTime: null,
  endTime: null,
  duration: 0,

  // Results and stats
  results: [],
  leaderboard: [],
  userStats: null,
  isLoadingResults: false,

  // Error handling
  error: null,
};

// Game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.LOADING:
      return {
        ...state,
        isLoadingGames: action.payload,
      };

    case GAME_ACTIONS.SET_GAMES:
      return {
        ...state,
        games: action.payload,
        isLoadingGames: false,
        error: null,
      };

    case GAME_ACTIONS.SET_CURRENT_GAME:
      return {
        ...state,
        currentGame: action.payload.game,
        gameData: action.payload.gameData,
        gameState: GAME_STATES.IDLE,
        score: 0,
        level: action.payload.level || 1,
        lives: action.payload.lives || 3,
        correctAnswers: 0,
        totalQuestions: 0,
        startTime: null,
        endTime: null,
        duration: 0,
        error: null,
      };

    case GAME_ACTIONS.SET_GAME_STATE:
      return {
        ...state,
        gameState: action.payload,
        startTime:
          action.payload === GAME_STATES.PLAYING && !state.startTime
            ? Date.now()
            : state.startTime,
        endTime: action.payload === GAME_STATES.FINISHED ? Date.now() : null,
      };

    case GAME_ACTIONS.SET_GAME_SETTINGS:
      return {
        ...state,
        gameSettings: { ...state.gameSettings, ...action.payload },
      };

    case GAME_ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        ...action.payload,
        duration: state.startTime ? Date.now() - state.startTime : 0,
      };

    case GAME_ACTIONS.SET_RESULTS:
      return {
        ...state,
        results: action.payload,
        isLoadingResults: false,
      };

    case GAME_ACTIONS.SET_LEADERBOARD:
      return {
        ...state,
        leaderboard: action.payload,
      };

    case GAME_ACTIONS.SET_USER_STATS:
      return {
        ...state,
        userStats: action.payload,
      };

    case GAME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoadingGames: false,
        isLoadingResults: false,
      };

    case GAME_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case GAME_ACTIONS.RESET_GAME:
      return {
        ...state,
        currentGame: null,
        gameState: GAME_STATES.IDLE,
        gameData: null,
        score: 0,
        level: 1,
        lives: 3,
        correctAnswers: 0,
        totalQuestions: 0,
        startTime: null,
        endTime: null,
        duration: 0,
        error: null,
      };

    default:
      return state;
  }
};

// Game provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load games on mount
  useEffect(() => {
    loadGames();
    loadUserStats();
  }, []);

  // Load available games
  const loadGames = async () => {
    dispatch({ type: GAME_ACTIONS.LOADING, payload: true });

    try {
      const response = await gamesAPI.getGames();
      dispatch({
        type: GAME_ACTIONS.SET_GAMES,
        payload: response.data.games,
      });
    } catch (error) {
      console.error("Failed to load games:", error);
      dispatch({
        type: GAME_ACTIONS.SET_ERROR,
        payload: ERROR_MESSAGES.NETWORK_ERROR,
      });
    }
  };

  // Start a game
  const startGame = async (gameType, options = {}) => {
    try {
      dispatch({ type: GAME_ACTIONS.LOADING, payload: true });

      // Get game info
      const gameInfo = GAME_TYPES[gameType];
      if (!gameInfo) {
        throw new Error(ERROR_MESSAGES.GAME_NOT_FOUND);
      }

      // Load user settings for this game
      const userSettings = storage.get(
        `game_settings_${gameType}`,
        DEFAULT_GAME_SETTINGS[gameType] || {}
      );

      // Merge with provided options
      const gameSettings = { ...userSettings, ...options };

      // Start game session
      const response = await gamesAPI.startGame(gameType, {
        level: options.level || 1,
        settings: gameSettings,
      });

      dispatch({
        type: GAME_ACTIONS.SET_CURRENT_GAME,
        payload: {
          game: { ...gameInfo, id: gameType },
          gameData: response.data.gameContent,
          level: options.level || 1,
          lives: options.lives || 3,
        },
      });

      dispatch({
        type: GAME_ACTIONS.SET_GAME_SETTINGS,
        payload: gameSettings,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to start game:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: GAME_ACTIONS.SET_ERROR,
        payload: message,
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Update game progress
  const updateProgress = (progressData) => {
    dispatch({
      type: GAME_ACTIONS.UPDATE_PROGRESS,
      payload: progressData,
    });
  };

  // Set game state
  const setGameState = (newState) => {
    dispatch({
      type: GAME_ACTIONS.SET_GAME_STATE,
      payload: newState,
    });
  };

  // Submit game result
  const submitResult = async (gameType, resultData) => {
    try {
      const response = await gamesAPI.submitResult(gameType, {
        ...resultData,
        duration: state.duration / 1000, // Convert to seconds
        startTime: state.startTime,
        endTime: Date.now(),
      });

      // Update local stats
      await loadUserStats();

      toast.success("Natija muvaffaqiyatli saqlandi!");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to submit result:", error);
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: GAME_ACTIONS.SET_ERROR,
        payload: message,
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Load user results
  const loadResults = async (gameType, limit = 20) => {
    try {
      dispatch({ type: GAME_ACTIONS.LOADING, payload: true });

      const response = await resultsAPI.getUserResults(gameType, limit);

      dispatch({
        type: GAME_ACTIONS.SET_RESULTS,
        payload: response.data.data,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Failed to load results:", error);
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: GAME_ACTIONS.SET_ERROR,
        payload: message,
      });

      return { success: false, message };
    }
  };

  // Load leaderboard
  const loadLeaderboard = async (gameType, limit = 10) => {
    try {
      const response = await resultsAPI.getLeaderboard(gameType, limit);

      dispatch({
        type: GAME_ACTIONS.SET_LEADERBOARD,
        payload: response.data.data,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: GAME_ACTIONS.SET_ERROR,
        payload: message,
      });

      return { success: false, message };
    }
  };

  // Load user stats
  const loadUserStats = async () => {
    try {
      const response = await resultsAPI.getUserStats();

      dispatch({
        type: GAME_ACTIONS.SET_USER_STATS,
        payload: response.data.data,
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Failed to load user stats:", error);
      // Don't show error for stats, it's not critical
      return { success: false };
    }
  };

  // Save game settings
  const saveGameSettings = (gameType, settings) => {
    const key = `game_settings_${gameType}`;
    storage.set(key, settings);

    dispatch({
      type: GAME_ACTIONS.SET_GAME_SETTINGS,
      payload: settings,
    });
  };

  // Get game settings
  const getGameSettings = (gameType) => {
    const key = `game_settings_${gameType}`;
    return storage.get(key, DEFAULT_GAME_SETTINGS[gameType] || {});
  };

  // Reset current game
  const resetGame = () => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: GAME_ACTIONS.CLEAR_ERROR });
  };

  // Calculate accuracy
  const calculateAccuracy = () => {
    if (state.totalQuestions === 0) return 0;
    return Math.round((state.correctAnswers / state.totalQuestions) * 100);
  };

  // Get current progress
  const getProgress = () => {
    return {
      score: state.score,
      level: state.level,
      lives: state.lives,
      correctAnswers: state.correctAnswers,
      totalQuestions: state.totalQuestions,
      accuracy: calculateAccuracy(),
      duration: state.duration,
      startTime: state.startTime,
      endTime: state.endTime,
    };
  };

  // Context value
  const value = {
    // State
    games: state.games,
    currentGame: state.currentGame,
    gameState: state.gameState,
    gameData: state.gameData,
    gameSettings: state.gameSettings,
    results: state.results,
    leaderboard: state.leaderboard,
    userStats: state.userStats,
    isLoadingGames: state.isLoadingGames,
    isLoadingResults: state.isLoadingResults,
    error: state.error,

    // Game progress
    score: state.score,
    level: state.level,
    lives: state.lives,
    correctAnswers: state.correctAnswers,
    totalQuestions: state.totalQuestions,
    duration: state.duration,
    startTime: state.startTime,
    endTime: state.endTime,

    // Actions
    loadGames,
    startGame,
    updateProgress,
    setGameState,
    submitResult,
    loadResults,
    loadLeaderboard,
    loadUserStats,
    saveGameSettings,
    getGameSettings,
    resetGame,
    clearError,

    // Utilities
    calculateAccuracy,
    getProgress,
    GAME_STATES,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
};

export default GameContext;
