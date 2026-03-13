import Link from "next/link";

export default function NotFound() {
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
      <div style={{ fontSize: 64, fontFamily: "'Lora', serif", fontWeight: 700, color: "var(--primary)" }}>
        404
      </div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
        Sayfa bulunamadı
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: 0, maxWidth: 300 }}>
        Aradığın sayfa kaldırılmış veya hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "10px 28px",
          background: "var(--primary)",
          color: "var(--background)",
          borderRadius: 24,
          fontSize: 14,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          textDecoration: "none",
          display: "inline-block"
        }}
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
