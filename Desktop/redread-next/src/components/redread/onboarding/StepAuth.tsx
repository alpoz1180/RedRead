"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

interface StepAuthProps {
  onComplete: () => void;
}

const darkInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid rgba(240,237,232,0.15)",
  background: "rgba(240,237,232,0.05)",
  color: "#F0EDE8",
  fontFamily: "'Nunito', sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

/**
 * Step 3 — Auth screen.
 * Contains two sub-views managed internally:
 *   1. Auth options (Google OAuth + email button + skip link)
 *   2. Email form (sign-up / sign-in tabs with username, email, password fields)
 *
 * All auth state (loading, errors, form values) lives here so Onboarding.tsx
 * stays clean. onComplete is called when the user authenticates or skips.
 */
export function StepAuth({ onComplete }: StepAuthProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBack = () => {
    setShowEmailForm(false);
    setAuthError("");
    setAuthSuccess("");
  };

  const handleShowEmailForm = () => {
    setShowEmailForm(true);
    setAuthError("");
    setAuthSuccess("");
  };

  const handleTabSwitch = (signUp: boolean) => {
    setIsSignUp(signUp);
    setAuthError("");
    setAuthSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (
      isSignUp &&
      (password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password))
    ) {
      setAuthError(
        "Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir"
      );
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split("@")[0],
            },
          },
        });
        if (error) {
          setAuthError(
            error.message === "User already registered"
              ? "Bu e-posta zaten kayıtlı. Giriş yapmayı dene."
              : error.message
          );
        } else {
          setAuthSuccess("Kayıt başarılı! E-postanı kontrol et.");
          if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
          completeTimerRef.current = setTimeout(() => onComplete(), 2000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setAuthError(
            error.message === "Invalid login credentials"
              ? "E-posta veya şifre hatalı."
              : error.message
          );
        } else {
          onComplete();
        }
      }
    } catch (err) {
      logger.error("auth: email sign-in/sign-up failed", err);
      setAuthError("Bir hata oluştu. Tekrar dene.");
    }
    setAuthLoading(false);
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <AnimatePresence mode="wait">
        {!showEmailForm ? (
          /* ——— Auth options view ——— */
          <motion.div
            key="auth-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Logo */}
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: "linear-gradient(135deg, #FF6122, #E84010)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Lora', serif",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                marginBottom: 20,
                boxShadow: "0 10px 32px rgba(255,97,34,0.38)",
              }}
            >
              R
            </div>

            <h2
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#F0EDE8",
                marginBottom: 8,
                letterSpacing: "-0.01em",
              }}
            >
              Kütüphaneni oluştur
            </h2>
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 13,
                color: "rgba(240,237,232,0.42)",
                marginBottom: 32,
              }}
            >
              Giriş yap ve hikaye dünyasına katıl.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
              }}
            >
              {/* Google OAuth */}
              <button
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: window.location.origin },
                  });
                  // onComplete() is not called here — signInWithOAuth only starts a
                  // redirect. The session is established after the user returns.
                  // RedreadRoot watches userId via useAuthSafe and calls onComplete.
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(240,237,232,0.1)",
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
                  boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(240,237,232,0.1)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 11,
                    color: "rgba(240,237,232,0.28)",
                    fontWeight: 600,
                  }}
                >
                  ya da
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(240,237,232,0.1)",
                  }}
                />
              </div>

              {/* Email */}
              <button
                onClick={handleShowEmailForm}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(240,237,232,0.12)",
                  background: "rgba(240,237,232,0.05)",
                  color: "rgba(240,237,232,0.62)",
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
            </div>

            <button
              onClick={onComplete}
              style={{
                marginTop: 20,
                background: "none",
                border: "none",
                color: "rgba(240,237,232,0.28)",
                fontFamily: "'Nunito', sans-serif",
                fontSize: 12,
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "rgba(240,237,232,0.13)",
              }}
            >
              Şimdilik atla
            </button>
          </motion.div>
        ) : (
          /* ——— Email form view ——— */
          <motion.div
            key="email-form"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.28 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              style={{
                background: "none",
                border: "none",
                color: "rgba(240,237,232,0.42)",
                cursor: "pointer",
                padding: "4px 0",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Nunito', sans-serif",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={14} />
              Geri
            </button>

            {/* Sign-up / sign-in tab switcher */}
            <div
              style={{
                display: "flex",
                background: "rgba(240,237,232,0.06)",
                borderRadius: 12,
                padding: 4,
                marginBottom: 24,
                gap: 4,
                width: "100%",
              }}
            >
              {(["Kayıt Ol", "Giriş Yap"] as const).map((label, i) => {
                const active = i === 0 ? isSignUp : !isSignUp;
                return (
                  <button
                    key={label}
                    onClick={() => handleTabSwitch(i === 0)}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      borderRadius: 9,
                      border: "none",
                      background: active
                        ? "linear-gradient(135deg, #FF6122, #E84010)"
                        : "transparent",
                      color: active ? "white" : "rgba(240,237,232,0.38)",
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Auth form */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
              }}
            >
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    ...darkInputStyle,
                    borderColor:
                      focusedField === "username"
                        ? "var(--primary)"
                        : "rgba(240,237,232,0.15)",
                  }}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                />
              )}

              <input
                type="email"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  ...darkInputStyle,
                  borderColor:
                    focusedField === "email"
                      ? "var(--primary)"
                      : "rgba(240,237,232,0.15)",
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre (min 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    ...darkInputStyle,
                    paddingRight: 44,
                    borderColor:
                      focusedField === "password"
                        ? "var(--primary)"
                        : "rgba(240,237,232,0.15)",
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
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
                    color: "rgba(240,237,232,0.38)",
                    padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authError && (
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 12,
                    color: "#FF6B6B",
                    margin: 0,
                    textAlign: "left",
                  }}
                >
                  {authError}
                </p>
              )}

              {authSuccess && (
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 12,
                    color: "#4ADE80",
                    margin: 0,
                    textAlign: "left",
                  }}
                >
                  {authSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: authLoading
                    ? "rgba(255,97,34,0.45)"
                    : "linear-gradient(135deg, #FF6122, #E84010)",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: authLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                  marginTop: 4,
                  boxShadow: authLoading
                    ? "none"
                    : "0 6px 22px rgba(255,97,34,0.35)",
                }}
              >
                {authLoading && (
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {authLoading
                  ? isSignUp
                    ? "Kayıt olunuyor..."
                    : "Giriş yapılıyor..."
                  : isSignUp
                    ? "Kayıt Ol"
                    : "Giriş Yap"}
              </button>
            </form>

            <button
              onClick={onComplete}
              style={{
                marginTop: 16,
                background: "none",
                border: "none",
                color: "rgba(240,237,232,0.24)",
                fontFamily: "'Nunito', sans-serif",
                fontSize: 11,
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "rgba(240,237,232,0.1)",
                alignSelf: "center",
              }}
            >
              Şimdilik atla
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
