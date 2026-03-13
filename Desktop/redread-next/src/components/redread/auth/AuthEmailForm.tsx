"use client";

import React from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { inputStyle, primaryButtonStyle } from "./authStyles";
import { AuthResetForm } from "./AuthResetForm";

interface AuthEmailFormProps {
  mode: "login" | "register";
  email: string;
  password: string;
  username: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  showForgotPassword: boolean;
  forgotEmail: string;
  forgotSuccess: boolean;
  forgotLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPasswordSubmit: (e: React.FormEvent) => void;
  onForgotEmailChange: (value: string) => void;
  onShowForgotPassword: () => void;
  onHideForgotPassword: () => void;
  onBack: () => void;
}

export function AuthEmailForm({
  mode,
  email,
  password,
  username,
  showPassword,
  loading,
  error,
  showForgotPassword,
  forgotEmail,
  forgotSuccess,
  forgotLoading,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onTogglePassword,
  onSubmit,
  onForgotPasswordSubmit,
  onForgotEmailChange,
  onShowForgotPassword,
  onHideForgotPassword,
  onBack,
}: AuthEmailFormProps) {
  return (
    <motion.form
      key="email-form"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25 }}
      onSubmit={showForgotPassword ? onForgotPasswordSubmit : onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      {showForgotPassword ? (
        <AuthResetForm
          forgotEmail={forgotEmail}
          forgotSuccess={forgotSuccess}
          forgotLoading={forgotLoading}
          error={error}
          onForgotEmailChange={onForgotEmailChange}
          onSubmit={onForgotPasswordSubmit}
          onBack={onHideForgotPassword}
        />
      ) : (
        <>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
            />
          )}

          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
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
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={6}
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
            />
            <button
              type="button"
              onClick={onTogglePassword}
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
              onClick={onShowForgotPassword}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontFamily: "'Nunito', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                padding: "0",
                textAlign: "right",
                alignSelf: "flex-end",
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
              ...primaryButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading && (
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            )}
            {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </button>

          <button
            type="button"
            onClick={onBack}
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
  );
}
