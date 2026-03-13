"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { inputStyle, primaryButtonStyle } from "./authStyles";

interface AuthResetFormProps {
  forgotEmail: string;
  forgotSuccess: boolean;
  forgotLoading: boolean;
  error: string;
  onForgotEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function AuthResetForm({
  forgotEmail,
  forgotSuccess,
  forgotLoading,
  error,
  onForgotEmailChange,
  onSubmit,
  onBack,
}: AuthResetFormProps) {
  return (
    <>
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 14,
          color: "var(--foreground)",
          fontWeight: 600,
          margin: 0,
        }}
      >
        Şifre Sıfırlama
      </p>
      <p
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "var(--muted-foreground)",
          margin: "0 0 4px",
        }}
      >
        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
      </p>

      {forgotSuccess ? (
        <p
          role="status"
          aria-live="polite"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            color: "#22c55e",
            margin: 0,
            textAlign: "center",
          }}
        >
          Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
        </p>
      ) : (
        <>
          <input
            type="email"
            placeholder="E-posta"
            value={forgotEmail}
            onChange={(e) => onForgotEmailChange(e.target.value)}
            required
            aria-label="Şifre sıfırlama için e-posta adresi"
            autoComplete="email"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--muted)")}
          />

          {error && (
            <p
              role="alert"
              aria-live="assertive"
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
            disabled={forgotLoading}
            aria-busy={forgotLoading}
            style={{
              ...primaryButtonStyle,
              opacity: forgotLoading ? 0.7 : 1,
              cursor: forgotLoading ? "wait" : "pointer",
            }}
          >
            {forgotLoading && (
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            )}
            Bağlantı Gönder
          </button>
        </>
      )}

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
  );
}
