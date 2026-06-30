import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import MainLayout from "./components/layout/MainLayout";
import { ProtectedRoute, AdminRoute } from "./components/layout/RouteGuards";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import PredictionResult from "./pages/PredictionResult";
import DiseaseLibrary from "./pages/DiseaseLibrary";
import DiseaseDetail from "./pages/DiseaseDetail";
import PredictionHistory from "./pages/PredictionHistory";
import Profile from "./pages/Profile";
import FAQ from "./pages/FAQ";
import Emergency from "./pages/Emergency";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDiseases from "./pages/admin/AdminDiseases";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminSystem from "./pages/admin/AdminSystem";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#fff",
                color: "#23262B",
                fontSize: "14px",
                boxShadow: "0 4px 16px rgba(11,47,80,0.12)",
              },
              success: { iconTheme: { primary: "#0B5FA5", secondary: "#fff" } },
            }}
          />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/diseases" element={<DiseaseLibrary />} />
              <Route path="/diseases/:diseaseId" element={<DiseaseDetail />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/emergency" element={<Emergency />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/symptom-checker"
                element={
                  <ProtectedRoute>
                    <SymptomChecker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prediction-result/:predictionId"
                element={
                  <ProtectedRoute>
                    <PredictionResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <PredictionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="diseases" element={<AdminDiseases />} />
                <Route path="predictions" element={<AdminPredictions />} />
                <Route path="system" element={<AdminSystem />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
