import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [view, setView] = useState("login"); // "login" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      // Supabase returns this specific message when "Confirm email" is ON
      // and the user hasn't verified yet — surface it clearly.
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("This email hasn't been verified yet. Check your inbox for the 6-digit code, or sign up again to get a new one.");
      } else {
        setError(error.message);
      }
      return;
    }
    navigate("/dashboard");
  }

  async function handleResetRequest(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }
    setResetSent(true);
  }

  if (view === "forgot") {
    return (
      <AuthLayout>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {resetSent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent-green/10 border border-accent-green/25 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={22} className="text-accent-green" />
              </div>
              <h1 className="font-display font-bold text-xl text-ink-primary mb-2">Check your inbox</h1>
              <p className="text-sm text-ink-secondary">
                We sent a password reset link to <span className="text-ink-primary">{email}</span>.
              </p>
              <button onClick={() => { setView("login"); setResetSent(false); }} className="inline-block mt-6 text-sm text-accent-blue hover:text-accent-blue/80 font-medium">
                Back to log in
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl text-ink-primary mb-2">Reset your password</h1>
              <p className="text-sm text-ink-secondary mb-8">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm rounded-lg px-3.5 py-3 mb-5">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-medium text-ink-secondary mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-base-700 border border-base-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full group flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-all">
                  {submitting ? "Sending…" : "Send reset link"}
                  {!submitting && <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </form>

              <button onClick={() => setView("login")} className="text-sm text-ink-secondary hover:text-ink-primary transition-colors mt-6 mx-auto block">
                Back to log in
              </button>
            </>
          )}
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-bold text-2xl text-ink-primary mb-2">Welcome back</h1>
        <p className="text-sm text-ink-secondary mb-8">Log in to pick up your audits where you left off.</p>

        {error && (
          <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm rounded-lg px-3.5 py-3 mb-5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ink-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-base-700 border border-base-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-ink-secondary">Password</label>
              <button type="button" onClick={() => setView("forgot")} className="text-xs text-accent-blue hover:text-accent-blue/80 font-medium">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-base-700 border border-base-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full group flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-all mt-2">
            {submitting ? "Logging in…" : "Log in"}
            {!submitting && <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        <p className="text-sm text-ink-secondary text-center mt-8">
          Don't have an account? <Link to="/signup" className="text-accent-blue hover:text-accent-blue/80 font-medium">Sign up</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
