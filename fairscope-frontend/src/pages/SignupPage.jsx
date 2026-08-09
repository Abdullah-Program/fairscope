import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

// Supabase sends an 8-digit OTP when custom SMTP is configured.
// We accept 6–8 digits so this works regardless of Supabase project settings.
const OTP_MIN = 6;
const OTP_MAX = 8;

export default function SignupPage() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signUp, verifySignupOtp, resendSignupOtp } = useAuth();
  const navigate = useNavigate();
  const cooldownRef = useRef(null);

  // Auto-submit when OTP reaches max expected length
  useEffect(() => {
    if (step === "otp" && otp.length === OTP_MAX && !submitting) {
      handleVerifyOtp();
    }
  }, [otp]);

  async function handleCreateAccount(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await signUp(email, password);
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If Supabase already returned a session, "Confirm email" is OFF —
    // no verification needed, navigate straight to dashboard.
    if (data.session) {
      navigate("/dashboard");
      return;
    }

    setStep("otp");
    startCooldown();
  }

  async function handleVerifyOtp(e) {
    if (e) e.preventDefault();
    setError("");
    if (otp.length < OTP_MIN) {
      setError(`Enter the ${OTP_MIN}–${OTP_MAX}-digit code from your email.`);
      return;
    }
    setSubmitting(true);
    const { error } = await verifySignupOtp(email, otp);
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Verification succeeded — Supabase issues a session,
    // onAuthStateChange in AuthContext picks it up automatically.
    navigate("/dashboard");
  }

  function startCooldown() {
    setResendCooldown(30);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    const { error } = await resendSignupOtp(email);
    if (error) setError(error.message);
    else {
      setOtp("");
      startCooldown();
    }
  }

  if (step === "otp") {
    return (
      <AuthLayout>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="w-12 h-12 rounded-full bg-accent-blue/10 border border-accent-blue/25 flex items-center justify-center mb-5">
            <ShieldCheck size={22} className="text-accent-blue" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink-primary mb-2">Verify your email</h1>
          <p className="text-sm text-ink-secondary mb-8">
            We sent a verification code to{" "}
            <span className="text-ink-primary">{email}</span>.
            Enter it below — you'll only be able to run audits once it's confirmed.
          </p>

          {error && (
            <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm rounded-lg px-3.5 py-3 mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_MAX}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder={`${"•".repeat(OTP_MAX)}`}
                className="w-full bg-base-700 border border-base-border rounded-lg px-4 py-2.5 text-xl tracking-[0.5em] text-center font-mono text-ink-primary placeholder:text-ink-muted placeholder:tracking-normal placeholder:text-sm focus:border-accent-blue transition-colors outline-none"
              />
              <p className="text-xs text-ink-muted mt-1.5 text-center">
                {otp.length}/{OTP_MAX} digits
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || otp.length < OTP_MIN}
              className="w-full group flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-all"
            >
              {submitting ? "Verifying…" : "Verify & continue"}
              {!submitting && <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-ink-secondary hover:text-ink-primary disabled:text-ink-muted disabled:cursor-not-allowed transition-colors mt-6 mx-auto block"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
          </button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-bold text-2xl text-ink-primary mb-2">Open a case</h1>
        <p className="text-sm text-ink-secondary mb-8">Create an account to start auditing your models.</p>

        {error && (
          <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm rounded-lg px-3.5 py-3 mb-5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ink-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-base-700 border border-base-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-ink-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-base-700 border border-base-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue transition-colors outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full group flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-all mt-2"
          >
            {submitting ? "Creating account…" : "Create account"}
            {!submitting && <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        <p className="text-sm text-ink-secondary text-center mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-blue hover:text-accent-blue/80 font-medium">Log in</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
