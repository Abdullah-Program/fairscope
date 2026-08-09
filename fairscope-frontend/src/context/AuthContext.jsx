import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      })
      .catch(() => {
        // Even if the session check fails (bad network, bad env vars),
        // we must stop showing a loading screen — fail open to "logged out".
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // --- Signup flow (email + password, then OTP-gated) ---
  const signUp = (email, password) => supabase.auth.signUp({ email, password });

  // Verifies the 6-digit code sent to email after signUp(). On success,
  // Supabase returns an active session — the user is now logged in.
  const verifySignupOtp = (email, token) =>
    supabase.auth.verifyOtp({ email, token, type: "signup" });

  // Resends the signup verification code if the user didn't get it / it expired.
  const resendSignupOtp = (email) =>
    supabase.auth.resend({ type: "signup", email });

  // --- Login flow ---
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });

  // --- Forgot password ---
  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

  const signOut = () => supabase.auth.signOut();

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    verifySignupOtp,
    resendSignupOtp,
    signIn,
    resetPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
