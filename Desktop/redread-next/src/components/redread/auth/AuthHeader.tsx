"use client";

import React from "react";

interface AuthHeaderProps {
  mode: "login" | "register";
  onSwitchMode: (mode: "login" | "register") => void;
}

export function AuthHeader({ mode, onSwitchMode }: AuthHeaderProps) {
  return (
    <>
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
            onClick={() => onSwitchMode(m)}
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
    </>
  );
}
