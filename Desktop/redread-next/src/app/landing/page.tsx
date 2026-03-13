"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Intersection Observer hook ──────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Stagger word reveal ─────────────────────────────────── */
function RevealWords({
  text,
  delay = 0,
  className = "",
  style = {},
}: {
  text: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView();
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} style={{ display: "block", ...style }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.28em",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.6s ease ${delay + i * 0.06}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay + i * 0.06}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

/* ─── Feature card data ───────────────────────────────────── */
const features = [
  {
    icon: "✦",
    title: "Hikayeler, Sonsuz Akış",
    body: "Her gün yeni sesler, yeni dünyalar. Algoritmamız sana gerçekten uyan hikayeleri öğrenir — türüne, tempoña, ruh haline göre.",
    accent: "#FF6122",
  },
  {
    icon: "◈",
    title: "Yaz, Paylaş, Var Ol",
    body: "Kelimeler sadece okunmak için değil. Kendi sesini bul, kısa ama güçlü hikayelerini topluluğa sun.",
    accent: "#D4945B",
  },
  {
    icon: "❧",
    title: "Kütüphanen, Sığınağın",
    body: "Beğendiğin satırları sakla, favorilerini listele, sevilenlere geri dön. Kütüphanen seninle büyür.",
    accent: "#C47842",
  },
];

const genres = [
  "Romantizm", "Gotik", "Dram", "Gizem",
  "Fantastik", "Psikolojik", "Gerilim", "Macera",
];

/* ─────────────────────────────────────────────────────────── */
/*  LANDING PAGE                                               */
/* ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 80, 1);

  return (
    <div
      style={{
        background: "#0C0A08",
        color: "#F0EDE8",
        fontFamily: "'Nunito', sans-serif",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* ═══ GRAIN OVERLAY ═══════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.032,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "512px 512px",
        }}
      />

      {/* ═══ NAV ══════════════════════════════════════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 clamp(20px, 5vw, 80px)",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `rgba(12,10,8,${navOpacity * 0.92})`,
          backdropFilter: navOpacity > 0.1 ? "blur(20px)" : "none",
          borderBottom: navOpacity > 0.5 ? "1px solid rgba(240,237,232,0.06)" : "none",
          transition: "border-color 0.3s",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg, #FF6122, #E84010)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: 18,
              color: "white",
              boxShadow: "0 4px 16px rgba(255,97,34,0.35)",
              flexShrink: 0,
            }}
          >
            R
          </div>
          <span
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: 19,
              color: "#F0EDE8",
              letterSpacing: "-0.02em",
            }}
          >
            Redread
          </span>
        </div>

        {/* Desktop nav links */}
        <div
          style={{
            display: "flex",
            gap: 36,
            alignItems: "center",
          }}
          className="desktop-nav"
        >
          {[
            ["Özellikler", "#features"],
            ["Türler", "#genres"],
            ["Nasıl Çalışır", "#how"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "rgba(240,237,232,0.55)",
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0EDE8")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(240,237,232,0.55)")
              }
            >
              {label}
            </a>
          ))}
          <Link
            href="/app"
            style={{
              padding: "9px 20px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #FF6122, #E84010)",
              color: "white",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
              letterSpacing: "0.01em",
              boxShadow: "0 4px 16px rgba(255,97,34,0.3)",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 24px rgba(255,97,34,0.45)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 16px rgba(255,97,34,0.3)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Uygulamayı Aç →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: "none",
            border: "none",
            color: "#F0EDE8",
            cursor: "pointer",
            padding: 6,
            display: "none",
          }}
        >
          <div style={{ width: 22, height: 2, background: "#F0EDE8", marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: "#F0EDE8", marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 14, height: 2, background: "#F0EDE8", borderRadius: 2 }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 68,
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(12,10,8,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(240,237,232,0.08)",
            padding: "20px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {[
            ["Özellikler", "#features"],
            ["Türler", "#genres"],
            ["Nasıl Çalışır", "#how"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 600,
                fontSize: 18,
                color: "rgba(240,237,232,0.8)",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
          <Link
            href="/app"
            style={{
              padding: "13px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg, #FF6122, #E84010)",
              color: "white",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Uygulamayı Aç
          </Link>
        </div>
      )}

      {/* ═══ HERO ═════════════════════════════════════════════════ */}
      <section
        className="hero-section"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px clamp(24px, 6vw, 100px) 80px",
          overflow: "hidden",
        }}
      >
        {/* Hero glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 60% at 30% 50%, rgba(255,97,34,0.13) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Big background R */}
        <div
          style={{
            position: "absolute",
            fontFamily: "'Lora', serif",
            fontSize: "clamp(280px, 50vw, 600px)",
            fontWeight: 700,
            color: "rgba(255,97,34,0.025)",
            userSelect: "none",
            pointerEvents: "none",
            lineHeight: 1,
            top: "50%",
            left: "0%",
            transform: `translateY(-50%) translateY(${scrollY * 0.1}px)`,
            letterSpacing: "-0.05em",
          }}
        >
          R
        </div>

        {/* Two-column layout */}
        <div
          className="hero-grid"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 1200,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px, 6vw, 100px)",
            alignItems: "center",
          }}
        >
          {/* LEFT — Text */}
          <div>
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,97,34,0.25)",
                background: "rgba(255,97,34,0.08)",
                marginBottom: 32,
                animation: "fadeInUp 0.7s ease 0.1s both",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#FF6122",
                  animation: "pulse 2s ease infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FF6122",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Türk Edebiyatının Dijital Evidir
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 700,
                fontSize: "clamp(44px, 5.5vw, 80px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                marginBottom: 24,
                color: "#F0EDE8",
              }}
            >
              <span
                style={{
                  display: "block",
                  animation: "fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both",
                }}
              >
                Hikayeler
              </span>
              <span
                style={{
                  display: "block",
                  animation: "fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both",
                }}
              >
                burada
              </span>
              <span
                style={{
                  display: "block",
                  fontStyle: "italic",
                  color: "#FF6122",
                  animation: "fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s both",
                }}
              >
                nefes alır.
              </span>
            </h1>

            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "clamp(15px, 1.5vw, 18px)",
                color: "rgba(240,237,232,0.5)",
                fontStyle: "italic",
                lineHeight: 1.8,
                marginBottom: 44,
                maxWidth: 420,
                animation: "fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.55s both",
              }}
            >
              Kısa, güçlü hikayeler oku. Kendi sesini bul.
              Bir kütüphane kur. Redread, kelimelerin yaşadığı yerdir.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                animation: "fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.7s both",
              }}
            >
              <Link
                href="/app"
                style={{
                  padding: "14px 32px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #FF6122, #E84010)",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(255,97,34,0.38)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(255,97,34,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(255,97,34,0.38)";
                }}
              >
                Okumaya Başla →
              </Link>
              <a
                href="#features"
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  border: "1.5px solid rgba(240,237,232,0.15)",
                  color: "rgba(240,237,232,0.7)",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,237,232,0.4)";
                  (e.currentTarget as HTMLElement).style.color = "#F0EDE8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,237,232,0.15)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(240,237,232,0.7)";
                }}
              >
                Daha Fazla ↓
              </a>
            </div>
          </div>

          {/* RIGHT — Mockup */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              animation: "fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup.png"
              alt="Redread uygulama ekranı"
              style={{
                width: "min(100%, 420px)",
                filter:
                  "drop-shadow(0 48px 96px rgba(0,0,0,0.65)) drop-shadow(0 0 60px rgba(255,97,34,0.15))",
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════════ */}
      <section
        id="features"
        style={{
          padding: "100px clamp(20px, 6vw, 100px)",
          position: "relative",
        }}
      >
        {/* Section divider */}
        <div
          className="features-divider"
          style={{
            width: 1,
            height: 80,
            background: "linear-gradient(to bottom, transparent, rgba(255,97,34,0.4), transparent)",
            margin: "0 auto 80px",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <SectionLabel>Özellikler</SectionLabel>
          <h2
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 6vw, 62px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#F0EDE8",
            }}
          >
            <RevealWords text="Her şey kelimeler" delay={0} />
            <RevealWords
              text="için tasarlandı."
              delay={0.1}
              style={{ fontStyle: "italic", color: "rgba(240,237,232,0.6)" }}
            />
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ═══ GENRES ════════════════════════════════════════════════ */}
      <section
        id="genres"
        style={{
          padding: "100px clamp(20px, 6vw, 100px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background text */}
        <div
          style={{
            position: "absolute",
            fontFamily: "'Lora', serif",
            fontSize: "clamp(100px, 22vw, 240px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: "rgba(255,97,34,0.025)",
            whiteSpace: "nowrap",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          TÜRLER
        </div>

        <div style={{ textAlign: "center", marginBottom: 64, position: "relative" }}>
          <SectionLabel>Koleksiyon</SectionLabel>
          <h2
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5.5vw, 58px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#F0EDE8",
              fontStyle: "italic",
            }}
          >
            <RevealWords text="Ruhuna göre bir tür var." delay={0} />
          </h2>
        </div>

        <GenreScroller />
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════ */}
      <section
        id="how"
        style={{
          padding: "100px clamp(20px, 6vw, 100px)",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <SectionLabel>Süreç</SectionLabel>
          <h2
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5.5vw, 56px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#F0EDE8",
            }}
          >
            <RevealWords text="Üç adım," delay={0} />
            <RevealWords
              text="sonsuz hikaye."
              delay={0.15}
              style={{ fontStyle: "italic", color: "#FF6122" }}
            />
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            {
              number: "01",
              title: "Zevklerini Seç",
              body: "Onboarding'de sevdiğin türleri işaretle. Algoritmamız sana özel bir akış oluşturmaya başlasın.",
            },
            {
              number: "02",
              title: "Oku, Beğen, Kaydet",
              body: "Sonsuz akışta hikayeleri keşfet. Beğendiklerini kütüphanene ekle, sonraya bırak.",
            },
            {
              number: "03",
              title: "Yaz ve Paylaş",
              body: "Kendi sesini bul. Kısa ama etkileyici hikayelerini topluluğa sun, okuyucularını bul.",
            },
          ].map((step, i) => (
            <HowStep key={i} {...step} isLast={i === 2} />
          ))}
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px clamp(20px, 6vw, 100px)",
          borderTop: "1px solid rgba(240,237,232,0.06)",
          borderBottom: "1px solid rgba(240,237,232,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 48,
            maxWidth: 860,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {[
            { value: "∞", label: "Hikaye akışı" },
            { value: "8", label: "Farklı edebiyat türü" },
            { value: "24/7", label: "Yeni içerik" },
            { value: "🔥", label: "Tam atmosfer" },
          ].map((stat, i) => (
            <StatItem key={i} {...stat} />
          ))}
        </div>
      </section>

      {/* ═══ QUOTE ══════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "120px clamp(20px, 6vw, 100px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,97,34,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(60px, 12vw, 120px)",
              color: "rgba(255,97,34,0.2)",
              lineHeight: 0.8,
              marginBottom: 20,
              userSelect: "none",
            }}
          >
            ❝
          </div>
          <blockquote>
            <RevealWords
              text="Bir hikaye, okuyucusuna ulaştığı an tamamlanır."
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "clamp(22px, 4vw, 40px)",
                fontStyle: "italic",
                lineHeight: 1.4,
                color: "#F0EDE8",
                letterSpacing: "-0.01em",
              }}
              delay={0}
            />
          </blockquote>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(240,237,232,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 28,
            }}
          >
            — Redread Manifestosu
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px clamp(20px, 6vw, 100px) 120px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "64px 40px",
            borderRadius: 32,
            background:
              "linear-gradient(135deg, rgba(255,97,34,0.1) 0%, rgba(232,64,16,0.05) 100%)",
            border: "1px solid rgba(255,97,34,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner glow */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 200,
              background: "rgba(255,97,34,0.12)",
              filter: "blur(60px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, #FF6122, #E84010)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Lora', serif",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                margin: "0 auto 28px",
                boxShadow: "0 10px 32px rgba(255,97,34,0.4)",
              }}
            >
              R
            </div>

            <h2
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 700,
                fontSize: "clamp(28px, 5vw, 46px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#F0EDE8",
                marginBottom: 16,
              }}
            >
              Kütüphaneni oluştur.
            </h2>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "clamp(15px, 2vw, 18px)",
                color: "rgba(240,237,232,0.5)",
                fontStyle: "italic",
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              Binlerce hikaye seni bekliyor. Hemen başla, ücretsiz.
            </p>

            <Link
              href="/app"
              style={{
                display: "inline-block",
                padding: "16px 44px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #FF6122, #E84010)",
                color: "white",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: "0.02em",
                boxShadow:
                  "0 8px 32px rgba(255,97,34,0.42), 0 1px 0 rgba(255,255,255,0.12) inset",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 14px 44px rgba(255,97,34,0.52)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 32px rgba(255,97,34,0.42)";
              }}
            >
              Okumaya Başla — Ücretsiz →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid rgba(240,237,232,0.06)",
          padding: "40px clamp(20px, 6vw, 100px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "linear-gradient(135deg, #FF6122, #E84010)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: 14,
              color: "white",
            }}
          >
            R
          </div>
          <span
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: 15,
              color: "rgba(240,237,232,0.5)",
            }}
          >
            Redread
          </span>
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 12,
              color: "rgba(240,237,232,0.2)",
              marginLeft: 8,
            }}
          >
            © 2025 — Kelimeler için bir yer.
          </span>
        </div>
        <Link
          href="/app"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#FF6122",
            textDecoration: "none",
          }}
        >
          Uygulamayı Aç →
        </Link>
      </footer>

      {/* ═══ GLOBAL STYLES ═══════════════════════════════════════════ */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInCard {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            gap: 40px !important;
          }
          .hero-grid > div:first-child {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-grid img {
            width: min(85vw, 360px) !important;
          }
          .hero-section {
            min-height: unset !important;
            padding-top: 100px !important;
            padding-bottom: 60px !important;
          }
          .features-divider {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 20,
          height: 1,
          background: "#FF6122",
        }}
      />
      <span
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 11,
          fontWeight: 800,
          color: "#FF6122",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <div
        style={{
          width: 20,
          height: 1,
          background: "#FF6122",
        }}
      />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
  index,
}: {
  icon: string;
  title: string;
  body: string;
  accent: string;
  index: number;
}) {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "36px 32px",
        borderRadius: 24,
        background: hovered ? "rgba(26,24,21,0.95)" : "rgba(26,24,21,0.6)",
        border: `1px solid ${hovered ? `${accent}40` : "rgba(240,237,232,0.07)"}`,
        cursor: "default",
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateY(0)"
          : "translateY(30px)",
        transitionDelay: `${index * 0.1}s`,
        boxShadow: hovered ? `0 20px 60px ${accent}15` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner glow on hover */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: accent,
          opacity: hovered ? 0.06 : 0,
          filter: "blur(30px)",
          transition: "opacity 0.35s",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 28,
          color: accent,
          marginBottom: 20,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#F0EDE8",
          marginBottom: 12,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14,
          color: "rgba(240,237,232,0.52)",
          lineHeight: 1.75,
          fontWeight: 600,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function GenreScroller() {
  const genreColors: Record<string, string> = {
    Romantizm: "#FF6B9D",
    Gotik: "#9B59B6",
    Dram: "#E74C3C",
    Gizem: "#4A90D9",
    Fantastik: "#27AE60",
    Psikolojik: "#8E44AD",
    Gerilim: "#C0392B",
    Macera: "#F39C12",
  };

  const doubled = [...genres, ...genres];

  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 100,
          background:
            "linear-gradient(to right, #0C0A08, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 100,
          background:
            "linear-gradient(to left, #0C0A08, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 14,
          animation: "marquee 22s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((g, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 999,
              border: `1.5px solid ${genreColors[g]}30`,
              background: `${genreColors[g]}0D`,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: genreColors[g],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 600,
                fontSize: 15,
                color: genreColors[g],
                letterSpacing: "0.01em",
              }}
            >
              {g}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowStep({
  number,
  title,
  body,
  isLast,
}: {
  number: string;
  title: string;
  body: string;
  isLast: boolean;
}) {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: 28,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-20px)",
        transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Left: number + line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            border: "1.5px solid rgba(255,97,34,0.3)",
            background: "rgba(255,97,34,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Lora', serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#FF6122",
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            style={{
              width: 1,
              height: 72,
              background:
                "linear-gradient(to bottom, rgba(255,97,34,0.3), rgba(255,97,34,0.05))",
              marginTop: 0,
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: isLast ? 0 : 48, paddingTop: 12 }}>
        <h3
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 700,
            fontSize: "clamp(18px, 2.5vw, 24px)",
            color: "#F0EDE8",
            marginBottom: 10,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 14,
            color: "rgba(240,237,232,0.5)",
            lineHeight: 1.75,
            fontWeight: 600,
            maxWidth: 500,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 700,
          fontSize: "clamp(36px, 5vw, 52px)",
          color: "#FF6122",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(240,237,232,0.38)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
