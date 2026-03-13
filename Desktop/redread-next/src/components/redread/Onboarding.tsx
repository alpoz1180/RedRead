"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Mail, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GENRES } from "@/constants/genres";
import { logger } from "@/lib/logger";

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

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (completeTimerRef.current !== null) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((i) => i !== g) : [...prev, g]
    );
  };

  const nextStep = () => {
    if (step === 2 && selectedGenres.length > 0) {
      try {
        localStorage.setItem("user_genres", JSON.stringify(selectedGenres));
      } catch (err) {
        console.error("nextStep: failed to save user_genres to localStorage", err);
      }
    }
    if (step < 3) setStep(step + 1);
    else onComplete();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0F0C09",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 24px",
        fontFamily: "'Nunito', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Radial warm glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 38%, rgba(255,97,34,0.13) 0%, rgba(180,60,20,0.05) 40%, transparent 68%)",
        }}
      />

      {/* Decorative large R in background */}
      <div
        style={{
          position: "absolute",
          fontFamily: "'Lora', serif",
          fontSize: "clamp(200px, 48vw, 340px)",
          fontWeight: 700,
          color: "rgba(255,97,34,0.035)",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          animation: "floatBgR 7s ease-in-out infinite",
        }}
      >
        R
      </div>

      <style>{`
        @keyframes floatBgR {
          0%, 100% { transform: translate(-50%, -52%) translateY(0px); }
          50% { transform: translate(-50%, -52%) translateY(-18px); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(0.5deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360 }}>
        <AnimatePresence mode="wait">

          {/* ——— STEP 1: Welcome ——— */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.45 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {/* Animated logo */}
              <motion.div
                initial={{ scale: 0.65, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  background: "linear-gradient(135deg, #FF6122 0%, #E84010 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Lora', serif",
                  fontSize: 38,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 30,
                  boxShadow:
                    "0 14px 48px rgba(255,97,34,0.4), 0 0 0 1px rgba(255,97,34,0.25), 0 1px 0 rgba(255,255,255,0.12) inset",
                  animation: "floatLogo 4s ease-in-out infinite",
                  flexShrink: 0,
                }}
              >
                R
              </motion.div>

              {/* Title — staggered reveal */}
              <h1
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#F0EDE8",
                  marginBottom: 18,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  overflow: "hidden",
                }}
              >
                {["R", "e", "d", "r", "e", "a", "d"].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.28 + i * 0.045,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 15,
                  color: "rgba(240,237,232,0.48)",
                  fontStyle: "italic",
                  lineHeight: 1.75,
                  marginBottom: 52,
                  maxWidth: 240,
                }}
              >
                Seveceğin hikayeler seni bekliyor.
              </motion.p>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.88 }}
                onClick={nextStep}
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #FF6122 0%, #E84010 100%)",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow:
                    "0 8px 28px rgba(255,97,34,0.38), 0 1px 0 rgba(255,255,255,0.12) inset",
                  letterSpacing: "0.01em",
                }}
              >
                Başla
                <ChevronRight size={18} strokeWidth={2.5} />
              </motion.button>
            </motion.div>
          )}

          {/* ——— STEP 2: Genre Selection ——— */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#F0EDE8",
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                  fontStyle: "italic",
                }}
              >
                Ruhunu ne besler?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 11,
                  color: "rgba(240,237,232,0.38)",
                  marginBottom: 32,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                En az bir tür seç
              </motion.p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 40,
                }}
              >
                {GENRES.map((g, i) => {
                  const isSelected = selectedGenres.includes(g.name);
                  return (
                    <motion.button
                      key={g.name}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 + i * 0.04 }}
                      onClick={() => toggleGenre(g.name)}
                      style={{
                        padding: "9px 16px",
                        borderRadius: 999,
                        border: `1.5px solid ${
                          isSelected ? g.color : "rgba(240,237,232,0.14)"
                        }`,
                        background: isSelected
                          ? `${g.color}20`
                          : "rgba(240,237,232,0.04)",
                        color: isSelected ? g.color : "rgba(240,237,232,0.62)",
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transform: isSelected ? "scale(1.04)" : "scale(1)",
                        boxShadow: isSelected ? `0 0 14px ${g.color}30` : "none",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: g.color,
                          flexShrink: 0,
                          opacity: isSelected ? 1 : 0.35,
                          transition: "opacity 0.2s",
                        }}
                      />
                      {g.name}
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={nextStep}
                disabled={selectedGenres.length === 0}
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  borderRadius: 14,
                  border: "none",
                  background:
                    selectedGenres.length > 0
                      ? "linear-gradient(135deg, #FF6122, #E84010)"
                      : "rgba(240,237,232,0.07)",
                  color:
                    selectedGenres.length > 0 ? "white" : "rgba(240,237,232,0.25)",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: selectedGenres.length > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.28s",
                  boxShadow:
                    selectedGenres.length > 0
                      ? "0 8px 28px rgba(255,97,34,0.38)"
                      : "none",
                }}
              >
                Devam Et
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* ——— STEP 3: Auth ——— */}
          {step === 3 && (
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
                {/* Auth options view */}
                {!showEmailForm ? (
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
                      {/* Google */}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
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
                        onClick={() => {
                          setShowEmailForm(true);
                          setAuthError("");
                          setAuthSuccess("");
                        }}
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
                  /* Email form view */
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
                    <button
                      onClick={() => {
                        setShowEmailForm(false);
                        setAuthError("");
                        setAuthSuccess("");
                      }}
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

                    {/* Mode tab switcher */}
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
                      {["Kayıt Ol", "Giriş Yap"].map((label, i) => {
                        const active = i === 0 ? isSignUp : !isSignUp;
                        return (
                          <button
                            key={label}
                            onClick={() => {
                              setIsSignUp(i === 0);
                              setAuthError("");
                              setAuthSuccess("");
                            }}
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

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAuthError("");
                        setAuthSuccess("");
                        if (isSignUp && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
                          setAuthError("Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir");
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
                            const { error } =
                              await supabase.auth.signInWithPassword({
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
                      }}
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
                          style={darkInputStyle}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "var(--primary)")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor =
                              "rgba(240,237,232,0.15)")
                          }
                        />
                      )}
                      <input
                        type="email"
                        placeholder="E-posta adresi"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={darkInputStyle}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "var(--primary)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(240,237,232,0.15)")
                        }
                      />
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Şifre (min 6 karakter)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          style={{ ...darkInputStyle, paddingRight: 44 }}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "var(--primary)")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor =
                              "rgba(240,237,232,0.15)")
                          }
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
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 44,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: i === step ? 26 : 8,
                height: 8,
                borderRadius: 999,
                background:
                  i === step
                    ? "linear-gradient(90deg, #FF6122, #E84010)"
                    : "rgba(240,237,232,0.14)",
                transition: "all 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow:
                  i === step ? "0 0 10px rgba(255,97,34,0.45)" : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
