"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "'Nunito', sans-serif",
      padding: 32,
      textAlign: "center",
      gap: 16
    }}>
      <div style={{ fontSize: 48 }}>📖</div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 700, margin: 0 }}>
        Bir şeyler ters gitti
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: 0, maxWidth: 320 }}>
        Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 8,
          padding: "10px 28px",
          background: "var(--primary)",
          color: "var(--background)",
          border: "none",
          borderRadius: 24,
          fontSize: 14,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
