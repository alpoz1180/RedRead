"use client";
import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
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
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
            Bir şeyler ters gitti
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: 0, maxWidth: 300 }}>
            {this.state.error?.message || "Beklenmeyen bir hata oluştu."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 8,
              padding: "10px 24px",
              background: "var(--primary)",
              color: "#fff",
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
    return this.props.children;
  }
}
