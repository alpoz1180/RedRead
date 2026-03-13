"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthHeader } from "./auth/AuthHeader";
import { AuthSocialButtons } from "./auth/AuthSocialButtons";
import { AuthEmailForm } from "./auth/AuthEmailForm";

interface AuthProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

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

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [forgotEmail, resetPassword]
  );

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
    setShowForgotPassword(false);
    setForgotSuccess(false);
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setError("");
  };

  const handleHideForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotSuccess(false);
    setError("");
  };

  const handleBack = () => {
    setShowEmailForm(false);
    setError("");
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

        <AuthHeader mode={mode} onSwitchMode={switchMode} />

        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <AuthSocialButtons
              error={error}
              onGoogleSignIn={handleGoogle}
              onShowEmailForm={() => setShowEmailForm(true)}
            />
          ) : (
            <AuthEmailForm
              mode={mode}
              email={email}
              password={password}
              username={username}
              showPassword={showPassword}
              loading={loading}
              error={error}
              showForgotPassword={showForgotPassword}
              forgotEmail={forgotEmail}
              forgotSuccess={forgotSuccess}
              forgotLoading={forgotLoading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onUsernameChange={setUsername}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
              onSubmit={handleSubmit}
              onForgotPasswordSubmit={handleForgotPassword}
              onForgotEmailChange={setForgotEmail}
              onShowForgotPassword={handleShowForgotPassword}
              onHideForgotPassword={handleHideForgotPassword}
              onBack={handleBack}
            />
          )}
        </AnimatePresence>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
}
