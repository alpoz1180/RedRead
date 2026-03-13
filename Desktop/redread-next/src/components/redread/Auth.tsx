"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--muted)",
  background: "var(--background)",
  color: "var(--foreground)",
  fontFamily: "'Nunito', sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

export function Auth({ onSuccess, onClose }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        if (mode === "register") {
          if (!username.trim()) {
            setError("Kullanıcı adı gerekli.");
            setLoading(false);
            return;
          }
          const { error: err } = await signUp(email, password, username);
          if (err) {
            setError(
              err.message === "User already registered"
                ? "Bu e-posta zaten kayıtlı."
                : err.message
            );
          } else {
            onSuccess?.();
          }
        } else {
          const { error: err } = await signIn(email, password);
          if (err) {
            setError(
              err.message === "Invalid login credentials"
                ? "E-posta veya şifre hatalı."
                : err.message
            );
          } else {
            onSuccess?.();
          }
        }
      } catch {
        setError("Bir hata oluştu. Tekrar dene.");
      }
      setLoading(false);
    },
    [mode, email, password, username, signIn, signUp, onSuccess]
  );

  const handleGoogle = useCallback(async () => {
    setError("");
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message);
    // onSuccess is NOT called here — signInWithOAuth only starts a redirect.
    // The caller detects sign-in via onAuthStateChange after the user returns.
  }, [signInWithGoogle]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error: err } = await resetPassword(forgotEmail);
    setForgotLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setForgotSuccess(true);
      setError("");
    }
  }, [forgotEmail, resetPassword]);

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
    setShowForgotPassword(false);
    setForgotSuccess(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--card)",
          border: "1px solid var(--muted)",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "var(--muted)",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--muted-foreground)",
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #FF6122, #E84010)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Lora', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "white",
              margin: "0 auto 12px",
              boxShadow: "0 6px 20px rgba(255,97,34,0.3)",
            }}
          >
            R
          </div>
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 14,
              color: "var(--muted-foreground)",
              fontStyle: "italic",
            }}
          >
            Kütüphaneni oluştur
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            background: "var(--background)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            gap: 4,
          }}
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background:
                  mode === m
                    ? "linear-gradient(135deg, #FF6122, #E84010)"
                    : "transparent",
                color: mode === m ? "white" : "var(--muted-foreground)",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {m === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <motion.div
              key="social"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Google */}
              <button
                onClick={handleGoogle}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "1.5px solid var(--muted)",
                  background: "white",
                  color: "#1a1a1a",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google ile Devam Et
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--muted)" }} />
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    fontWeight: 600,
                  }}
                >
                  ya da
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--muted)" }} />
              </div>

              {/* Email button */}
              <button
                onClick={() => setShowEmailForm(true)}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "1.5px solid var(--muted)",
                  background: "var(--card)",
                  color: "var(--muted-foreground)",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Mail size={16} />
                E-posta ile Devam Et
              </button>

              {error && (
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 12,
                    color: "var(--destructive)",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {showForgotPassword ? (
                /* ── Forgot-password view ── */
                <>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: 14, color: "var(--foreground)", fontWeight: 600, margin: 0 }}>
                    Şifre Sıfırlama
                  </p>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 4px" }}>
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                  </p>
                  {forgotSuccess ? (
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#22c55e", margin: 0, textAlign: "center" }}>
                      Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                    </p>
                  ) : (
                    <>
                      <input
                        type="email"
                        placeholder="E-posta"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
                      />
                      {error && (
                        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "var(--destructive)", margin: 0 }}>
                          {error}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        style={{
                          width: "100%", padding: "13px", borderRadius: 12, border: "none",
                          background: forgotLoading ? "var(--primary)" : "linear-gradient(135deg, #FF6122, #E84010)",
                          color: "white", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14,
                          cursor: forgotLoading ? "wait" : "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 8, opacity: forgotLoading ? 0.7 : 1,
                          transition: "opacity 0.2s", marginTop: 4,
                          boxShadow: "0 4px 16px rgba(255,97,34,0.3)",
                        }}
                      >
                        {forgotLoading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                        Bağlantı Gönder
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); setError(""); }}
                    style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontFamily: "'Nunito', sans-serif", fontSize: 12, cursor: "pointer", padding: "4px 0", textAlign: "center" }}
                  >
                    ← Geri dön
                  </button>
                </>
              ) : (
                /* ── Normal login/register form ── */
                <>
              {mode === "register" && (
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
                />
              )}
              <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
              />
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre (min 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted-foreground)",
                    padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Forgot password link — login mode only */}
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setError(""); }}
                  style={{
                    background: "none", border: "none", color: "var(--primary)",
                    fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", padding: "0", textAlign: "right", alignSelf: "flex-end",
                  }}
                >
                  Şifremi Unuttum
                </button>
              )}

              {error && (
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 12,
                    color: "var(--destructive)",
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "none",
                  background: loading
                    ? "var(--primary)"
                    : "linear-gradient(135deg, #FF6122, #E84010)",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: loading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                  transition: "opacity 0.2s",
                  marginTop: 4,
                  boxShadow: "0 4px 16px rgba(255,97,34,0.3)",
                }}
              >
                {loading && (
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                )}
                {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted-foreground)",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "4px 0",
                  textAlign: "center",
                }}
              >
                ← Geri dön
              </button>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
}
