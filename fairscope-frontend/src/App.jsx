import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NewAuditPage from "./pages/NewAuditPage";
import AuditResultsPage from "./pages/AuditResultsPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/new" replace />}
          />
          <Route
            path="/dashboard/new"
            element={
              <ProtectedRoute>
                <NewAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/audit/:auditId"
            element={
              <ProtectedRoute>
                <AuditResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
