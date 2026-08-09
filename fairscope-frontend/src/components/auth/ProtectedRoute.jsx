import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but email not verified yet — send back to signup OTP screen.
  // email_confirmed_at is null when "Confirm email" is ON and user hasn't verified.
  if (!user.email_confirmed_at) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}
