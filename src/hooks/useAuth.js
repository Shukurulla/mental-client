import { useAuthStore } from "../stores/authStore";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";

/**
 * Custom hook for authentication functionality
 * Provides auth state and methods with additional utilities
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authStore.isAuthenticated && !authStore.isLoading) {
        await authStore.checkAuth();
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [authStore]);

  // Enhanced login with redirect handling
  const loginWithRedirect = async (credentials, redirectTo = null) => {
    try {
      const result = await authStore.login(credentials);

      if (result.success) {
        const from = location.state?.from?.pathname || redirectTo || "/games";
        navigate(from, { replace: true });
        return result;
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login xatosi yuz berdi" };
    }
  };

  // Enhanced register with redirect
  const registerWithRedirect = async (userData, redirectTo = null) => {
    try {
      const result = await authStore.register(userData);

      if (result.success) {
        const to = redirectTo || "/games";
        navigate(to, { replace: true });
        return result;
      }

      return result;
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Ro'yxatdan o'tishda xato yuz berdi" };
    }
  };

  // Logout with redirect
  const logoutWithRedirect = (redirectTo = "/") => {
    authStore.logout();
    navigate(redirectTo, { replace: true });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return authStore.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole("admin");
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!authStore.user) return false;

    // Admin has all permissions
    if (isAdmin()) return true;

    // Check user permissions (if implemented)
    return authStore.user.permissions?.includes(permission) || false;
  };

  // Require authentication (redirect if not authenticated)
  const requireAuth = (redirectTo = "/login") => {
    useEffect(() => {
      if (isInitialized && !authStore.isAuthenticated && !authStore.isLoading) {
        navigate(redirectTo, {
          replace: true,
          state: { from: location },
        });
      }
    }, [isInitialized, authStore.isAuthenticated, authStore.isLoading]);
  };

  // Require specific role
  const requireRole = (role, redirectTo = "/") => {
    useEffect(() => {
      if (isInitialized && authStore.isAuthenticated && !hasRole(role)) {
        message.error("Bu sahifaga kirish huquqingiz yo'q");
        navigate(redirectTo, { replace: true });
      }
    }, [isInitialized, authStore.isAuthenticated, authStore.user?.role]);
  };

  // Require admin role
  const requireAdmin = (redirectTo = "/") => {
    requireRole("admin", redirectTo);
  };

  // Get user info
  const getUserInfo = () => {
    if (!authStore.user) return null;

    return {
      ...authStore.user,
      isAdmin: isAdmin(),
      initials:
        authStore.user.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "U",
    };
  };

  // Update user profile with optimistic updates
  const updateProfileOptimistic = async (profileData) => {
    // Optimistic update
    const previousUser = authStore.user;
    authStore.updateUserStats(profileData);

    try {
      const result = await authStore.updateProfile(profileData);

      if (!result.success) {
        // Revert on failure
        authStore.updateUserStats(previousUser);
      }

      return result;
    } catch (error) {
      // Revert on error
      authStore.updateUserStats(previousUser);
      throw error;
    }
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!authStore.user) return false;

    const requiredFields = ["name", "email"];
    return requiredFields.every(
      (field) => authStore.user[field] && authStore.user[field].trim() !== ""
    );
  };

  // Get user level information
  const getUserLevel = () => {
    if (!authStore.user) return null;

    const totalScore = authStore.user.totalScore || 0;
    const level = authStore.user.level || 1;

    // Calculate next level requirements
    const nextLevelScore = level * 1000;
    const currentLevelScore = (level - 1) * 1000;
    const progressToNext = Math.max(
      0,
      Math.min(
        100,
        ((totalScore - currentLevelScore) /
          (nextLevelScore - currentLevelScore)) *
          100
      )
    );

    return {
      current: level,
      totalScore,
      progressToNext: Math.round(progressToNext),
      scoreToNext: Math.max(0, nextLevelScore - totalScore),
      nextLevelScore,
      currentLevelScore,
    };
  };

  // Auth loading state
  const isAuthLoading = authStore.isLoading || !isInitialized;

  return {
    // Basic auth state
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: isAuthLoading,
    error: authStore.error,

    // Enhanced auth methods
    login: loginWithRedirect,
    register: registerWithRedirect,
    logout: logoutWithRedirect,
    updateProfile: updateProfileOptimistic,
    changePassword: authStore.changePassword,

    // Permission checking
    hasRole,
    isAdmin,
    hasPermission,

    // Route protection
    requireAuth,
    requireRole,
    requireAdmin,

    // User utilities
    getUserInfo,
    getUserLevel,
    isProfileComplete,

    // State management
    updateUserStats: authStore.updateUserStats,
    checkAuth: authStore.checkAuth,
    clearError: authStore.clearError,

    // Initialization state
    isInitialized,
  };
};

export default useAuth;
