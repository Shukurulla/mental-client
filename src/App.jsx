import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import GamePlay from "./pages/GamePlay";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";

// Admin Components
import AdminDashboard from "./components/admin/Dashboard";

// NEW: Flash Games Components
import FlashAnzanGame from "./components/games/FlashAnzanGame";
import FlashCardsGame from "./components/games/FlashCardsGame";

import "./styles/globals.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { user, isLoading, checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initial loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner size="large" text="Yuklanmoqda..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0ea5e9",
          colorSuccess: "#22c55e",
          colorWarning: "#f59e0b",
          colorError: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: 8,
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/games" replace /> : <Login />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/games" replace />
                ) : (
                  <Register />
                )
              }
            />

            {/* Protected routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route
                path="games"
                element={
                  <ProtectedRoute>
                    <Games />
                  </ProtectedRoute>
                }
              />
              <Route
                path="games/:gameType"
                element={
                  <ProtectedRoute>
                    <GamePlay />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* NEW: Flash Games Routes (without layout for full-screen experience) */}
            <Route
              path="/games/flashAnzan"
              element={
                <ProtectedRoute>
                  <FlashAnzanGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/flashCards"
              element={
                <ProtectedRoute>
                  <FlashCardsGame />
                </ProtectedRoute>
              }
            />

            {/* Admin routes - alohida layout siz */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#ffffff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
