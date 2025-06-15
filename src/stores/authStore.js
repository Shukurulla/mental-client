import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../utils/api";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", credentials);
          const { user, token } = response.data;

          // Set auth header for future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Muvaffaqiyatli kiritdingiz!");
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || "Login xatosi";
          set({ isLoading: false });
          toast.error(message);
          return { success: false, message };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/register", userData);
          const { user, token } = response.data;

          // Set auth header for future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
          return { success: true };
        } catch (error) {
          const message =
            error.response?.data?.message || "Ro'yxatdan o'tishda xato";
          set({ isLoading: false });
          toast.error(message);
          return { success: false, message };
        }
      },

      // Logout action
      logout: () => {
        // Remove auth header
        delete api.defaults.headers.common["Authorization"];

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        toast.success("Tizimdan muvaffaqiyatli chiqdingiz");
      },

      // Check authentication on app load
      checkAuth: async () => {
        const { token } = get();

        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          // Set auth header
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const response = await api.get("/auth/me");
          const { user } = response.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.log("Token verification failed:", error);
          // Token is invalid, clear auth data
          delete api.defaults.headers.common["Authorization"];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await api.put("/auth/profile", profileData);
          const { user } = response.data;

          set({ user });
          toast.success("Profil muvaffaqiyatli yangilandi");
          return { success: true };
        } catch (error) {
          const message =
            error.response?.data?.message || "Profil yangilashda xato";
          toast.error(message);
          return { success: false, message };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          await api.post("/auth/change-password", passwordData);
          toast.success("Parol muvaffaqiyatli o'zgartirildi");
          return { success: true };
        } catch (error) {
          const message =
            error.response?.data?.message || "Parol o'zgartirishda xato";
          toast.error(message);
          return { success: false, message };
        }
      },

      // Update user stats after game
      updateUserStats: (newStats) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...newStats,
              totalScore:
                (currentUser.totalScore || 0) + (newStats.totalScore || 0),
              gamesPlayed:
                (currentUser.gamesPlayed || 0) + (newStats.gamesPlayed || 0),
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // version 1 ni qo'shdik localStorage clear qilish uchun
      version: 1,
      migrate: (persistedState, version) => {
        // Agar version eski bo'lsa, state-ni tozalash
        if (version < 1) {
          return {
            user: null,
            token: null,
            isAuthenticated: false,
          };
        }
        return persistedState;
      },
      // Hydration completed callback
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.log("Auth rehydration xatosi:", error);
          } else if (state?.token) {
            // Auth headerini qayta o'rnatish
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${state.token}`;
          }
        };
      },
    }
  )
);

export { useAuthStore };
