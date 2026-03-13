import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0F0E0D",
      color: "#E8E6E1",
      fontFamily: "'Nunito', sans-serif",
      padding: 32,
      textAlign: "center",
      gap: 16
    }}>
      <div style={{ fontSize: 64, fontFamily: "'Lora', serif", fontWeight: 700, color: "#FF6122" }}>
        404
      </div>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
        Sayfa bulunamadı
      </h2>
      <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0, maxWidth: 300 }}>
        Aradığın sayfa kaldırılmış veya hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "10px 28px",
          background: "#FF6122",
          color: "#fff",
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
