import { createContext, useContext, useReducer, useEffect } from "react";
import api from "../utils/api";
import { storage } from "../utils/helpers";
import {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/constants";
import toast from "react-hot-toast";

// Auth context
const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOADING: "LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_ERROR: "SET_ERROR",
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Set auth header when token changes
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
      storage.set(STORAGE_KEYS.AUTH_TOKEN, state.token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    }
  }, [state.token]);

  // Check if user is authenticated
  const checkAuth = async () => {
    dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });

    try {
      const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOADING, payload: false });
        return;
      }

      // Set auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Verify token with server
      const response = await api.get("/auth/me");

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token,
        },
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      // Token is invalid, clear it
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      delete api.defaults.headers.common["Authorization"];

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const response = await api.post("/auth/login", credentials);
      const { user, token } = response.data;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const response = await api.post("/auth/register", userData);
      const { user, token } = response.data;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    // Clear storage
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_PREFERENCES);

    // Clear auth header
    delete api.defaults.headers.common["Authorization"];

    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success("Tizimdan muvaffaqiyatli chiqdingiz");
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      const { user } = response.data;

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: user,
      });

      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: message,
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await api.post("/auth/change-password", passwordData);

      toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;

      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: message,
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  // Update user stats after game
  const updateUserStats = (newStats) => {
    if (state.user) {
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: newStats,
      });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    updateUserStats,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
