import React from "react";

export const inputStyle: React.CSSProperties = {
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

export const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #FF6122, #E84010)",
  color: "white",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "opacity 0.2s",
  marginTop: 4,
  boxShadow: "0 4px 16px rgba(255,97,34,0.3)",
};
