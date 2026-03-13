# Wattpad Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ana projenin tüm ekranlarını (Onboarding, Home, Profile, BottomNav, TopBar) koyu dark temadan açık Wattpad light temasına taşı.

**Architecture:** Her component kendi dosyasında yerinde yeniden yazılır — dışarıdan API/veri bağlantısı yok, tüm data hardcoded mock. RedreadRoot activeTab tipini 5 sekmeye genişletir; her sekme ilgili component'i render eder.

**Tech Stack:** Next.js 16 (App Router), React, Tailwind v4, Framer Motion (`motion/react`), Lucide React, Nunito + Lora (Google Fonts)

**Renk Paleti:**
- Primary: `#FF6122` (turuncu)
- Primary Light: `#FFF0EB`
- Bg: `#FAFAF8`
- Text: `#1A1713`
- Muted: `#9A9490`
- Border: `#F0EDE8`

---

### Task 1: Onboarding.tsx — Light Tema

**Dosya:** `src/components/redread/Onboarding.tsx` (mevcut dosyayı değiştir)

**Step 1: Onboarding'i light temaya yeniden yaz**

```tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Mail } from "lucide-react";

const ORANGE = "#FF6122";

const genres = [
  "Romantizm", "Gotik", "Dram", "Gizem",
  "Fantastik", "Psikolojik", "Gerilim", "Macera",
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((i) => i !== g) : [...prev, g]
    );
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onComplete();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#FAFAF8",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "0 24px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Dekoratif arka plan daireler */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "#FFF0EB", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60,
        width: 200, height: 200, borderRadius: "50%",
        background: "#FFF0EB", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360 }}>
        <AnimatePresence mode="wait">

          {/* STEP 1: Karşılama */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              {/* Logo */}
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: ORANGE,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 700,
                color: "white", marginBottom: 24,
                boxShadow: "0 8px 24px rgba(255,97,34,0.3)",
              }}>R</div>

              <h1 style={{
                fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 700,
                color: "#1A1713", marginBottom: 12, letterSpacing: "-0.02em",
              }}>Redread</h1>

              <p style={{
                fontFamily: "'Lora', serif", fontSize: 16,
                color: "#9A9490", fontStyle: "italic",
                lineHeight: 1.6, marginBottom: 48,
              }}>
                Seveceğin hikayeleri keşfet.
              </p>

              <button
                onClick={nextStep}
                style={{
                  width: "100%", padding: "14px 24px",
                  borderRadius: 12, border: "none",
                  background: ORANGE, color: "white",
                  fontFamily: "'Nunito', sans-serif", fontWeight: 800,
                  fontSize: 15, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(255,97,34,0.3)",
                  transition: "transform 0.15s",
                }}
              >
                Başla
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Tür Seçimi */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              <h2 style={{
                fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 700,
                color: "#1A1713", marginBottom: 8,
              }}>Ruhunu ne besler?</h2>
              <p style={{
                fontFamily: "'Nunito', sans-serif", fontSize: 13,
                color: "#9A9490", marginBottom: 32,
              }}>En az bir tür seç</p>

              <div style={{
                display: "flex", flexWrap: "wrap",
                justifyContent: "center", gap: 10, marginBottom: 40,
              }}>
                {genres.map((g) => {
                  const isSelected = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      style={{
                        padding: "9px 18px", borderRadius: 999,
                        border: `1.5px solid ${isSelected ? ORANGE : "#E8E0D8"}`,
                        background: isSelected ? ORANGE : "white",
                        color: isSelected ? "white" : "#6B6560",
                        fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                        fontSize: 13, cursor: "pointer",
                        transition: "all 0.18s",
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextStep}
                disabled={selectedGenres.length === 0}
                style={{
                  width: "100%", padding: "14px 24px",
                  borderRadius: 12, border: "none",
                  background: selectedGenres.length > 0 ? ORANGE : "#E8E0D8",
                  color: selectedGenres.length > 0 ? "white" : "#9A9490",
                  fontFamily: "'Nunito', sans-serif", fontWeight: 800,
                  fontSize: 15, cursor: selectedGenres.length > 0 ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
              >
                Devam Et
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 3: Giriş */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: ORANGE,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 700,
                color: "white", marginBottom: 24,
                boxShadow: "0 8px 24px rgba(255,97,34,0.3)",
              }}>R</div>

              <h2 style={{
                fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 700,
                color: "#1A1713", marginBottom: 8,
              }}>Kütüphaneni oluştur</h2>
              <p style={{
                fontFamily: "'Nunito', sans-serif", fontSize: 13,
                color: "#9A9490", marginBottom: 32,
              }}>
                Giriş yap ve hikaye dünyasına katıl.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                <button
                  onClick={onComplete}
                  style={{
                    width: "100%", padding: "14px",
                    borderRadius: 12, border: "1.5px solid #E8E0D8",
                    background: "white", color: "#1A1713",
                    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.15s",
                  }}
                >
                  🍎 Apple ile Devam Et
                </button>
                <button
                  onClick={onComplete}
                  style={{
                    width: "100%", padding: "14px",
                    borderRadius: 12, border: "1.5px solid #E8E0D8",
                    background: "white", color: "#1A1713",
                    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.15s",
                  }}
                >
                  🌐 Google ile Devam Et
                </button>
                <button
                  onClick={onComplete}
                  style={{
                    width: "100%", padding: "14px",
                    borderRadius: 12, border: "1.5px solid #E8E0D8",
                    background: "white", color: "#9A9490",
                    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.15s",
                  }}
                >
                  <Mail size={16} />
                  E-posta ile Devam Et
                </button>
              </div>

              <button
                onClick={onComplete}
                style={{
                  marginTop: 16, background: "none", border: "none",
                  color: "#9A9490", fontFamily: "'Nunito', sans-serif",
                  fontSize: 12, cursor: "pointer", textDecoration: "underline",
                }}
              >
                Şimdilik atla
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 8, marginTop: 40,
        }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 8, height: 8,
                borderRadius: 999,
                background: i === step ? ORANGE : "#E8E0D8",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Dev server'da kontrol et** — `localhost:6500` onboarding görünür mü bak

**Step 3: Commit**
```bash
git add src/components/redread/Onboarding.tsx
git commit -m "feat: onboarding light tema - turuncu aksanlar, Nunito font"
```

---

### Task 2: TopBar.tsx — Wattpad Sticky Nav

**Dosya:** `src/components/redread/TopBar.tsx`

**Step 1: TopBar'ı yeniden yaz**

```tsx
"use client";

import React from "react";

const ORANGE = "#FF6122";
const ORANGE_MID = "#FF8A5B";

export function TopBar({ activeTab }: { activeTab: string }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(250,250,248,0.95)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: "14px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid #F0EDE8",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, background: ORANGE, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 18, color: "white",
        }}>R</div>
        <span style={{
          fontFamily: "'Lora', serif", fontWeight: 700,
          fontSize: 18, color: "#1A1713", letterSpacing: "-0.02em",
        }}>Redread</span>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {/* Arama */}
        <div style={{
          width: 36, height: 36, background: "#F0EDE8", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 16, color: "#6B6560",
        }}>🔍</div>

        {/* Bildirim */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: 36, height: 36, background: "#F0EDE8", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#6B6560",
          }}>🔔</div>
          <div style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8,
            background: ORANGE, borderRadius: "50%",
            border: "2px solid #FAFAF8",
          }} />
        </div>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_MID})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "white",
          fontFamily: "'Nunito', sans-serif", cursor: "pointer",
        }}>A</div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/redread/TopBar.tsx
git commit -m "feat: topbar light tema - blur nav, logo, search, notifications"
```

---

### Task 3: BottomNav.tsx — 5 Tab

**Dosya:** `src/components/redread/BottomNav.tsx`

**Step 1: BottomNav'ı 5 sekmeye genişlet**

```tsx
"use client";

import React from "react";

const ORANGE = "#FF6122";
const ORANGE_LIGHT = "#FFF0EB";

type Tab = "home" | "browse" | "library" | "write" | "profile";

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "home",    icon: "🏠", label: "Ana Sayfa" },
  { id: "browse",  icon: "🔍", label: "Keşfet" },
  { id: "library", icon: "📚", label: "Kütüphane" },
  { id: "write",   icon: "✏️", label: "Yaz" },
  { id: "profile", icon: "👤", label: "Profil" },
];

export function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(250,250,248,0.96)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid #F0EDE8",
      padding: "8px 8px 16px",
      display: "flex",
    }}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3,
            padding: "8px 4px",
            borderRadius: 12, border: "none",
            background: "transparent",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = ORANGE_LIGHT)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{
            fontSize: 20,
            filter: activeTab === item.id ? "none" : "grayscale(60%)",
          }}>{item.icon}</span>
          <span style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.04em",
            color: activeTab === item.id ? ORANGE : "#9A9490",
          }}>{item.label}</span>
          {activeTab === item.id && (
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: ORANGE, marginTop: 1,
            }} />
          )}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/redread/BottomNav.tsx
git commit -m "feat: bottomnav 5 sekme - home/browse/library/write/profile"
```

---

### Task 4: StoryFeed.tsx → StoryCardGrid

**Dosya:** `src/components/redread/StoryFeed.tsx` (içeriği tamamen değiştir)

**Step 1: StoryFeed'i kart grid'ine dönüştür**

```tsx
"use client";

import { useState } from "react";

const ORANGE = "#FF6122";
const ORANGE_LIGHT = "#FFF0EB";

const featured = {
  title: "Bırakmanın Sanatı",
  author: "ayhankara",
  reads: "34.1M", votes: "2.1M", chapters: 84,
  desc: "Sofia, balo gecesinden sonra Liam'la bir daha konuşmayacağına ant içmişti. Sonra o, üniversitedeki oda arkadaşının en yakın dostu olarak ortaya çıktı.",
  bg: "linear-gradient(135deg, #FF6122 0%, #ff9a3c 50%, #ffcd6b 100%)",
};

const stories = [
  { id: 1, title: "Fırtınanın Ardından", author: "ellakara", genre: "Romantizm", reads: "14.2M", votes: "892K", chapters: 42, isNew: false, isHot: true,  bg: "linear-gradient(160deg,#667eea,#764ba2)", initial: "F" },
  { id: 2, title: "Neon Rekviyem",       author: "gece99",    genre: "Bilim Kurgu", reads: "3.7M",  votes: "210K", chapters: 18, isNew: true,  isHot: false, bg: "linear-gradient(160deg,#0f2027,#203a43,#2c5364)", initial: "N" },
  { id: 3, title: "Yanlış Kardeş",       author: "mrekkep",   genre: "Romantizm",  reads: "22.8M", votes: "1.4M", chapters: 67, isNew: false, isHot: true,  bg: "linear-gradient(160deg,#f953c6,#b91d73)", initial: "Y" },
  { id: 4, title: "Kor ve Kül",          author: "fantasya",  genre: "Fantastik",  reads: "8.1M",  votes: "540K", chapters: 33, isNew: false, isHot: false, bg: "linear-gradient(160deg,#f46b45,#eea849)", initial: "K" },
  { id: 5, title: "Ölü Sinyal",          author: "karanlik",  genre: "Korku",      reads: "5.5M",  votes: "320K", chapters: 29, isNew: true,  isHot: false, bg: "linear-gradient(160deg,#1a1a2e,#16213e)", initial: "Ö" },
  { id: 6, title: "Uydulara Koşmak",     author: "kadife",    genre: "Gençlik",    reads: "11.3M", votes: "780K", chapters: 55, isNew: false, isHot: true,  bg: "linear-gradient(160deg,#56ccf2,#2f80ed)", initial: "U" },
];

const categories = ["Sana Özel", "Romantizm", "Fantastik", "Kurt Adam", "Gençlik", "Gizem", "Korku", "Bilim Kurgu"];
const trendingTags = ["#YavaşYanma", "#DüşmandanSevgiliye", "#MagicSchool", "#YeniYetişkin", "#Gerilim"];

export function StoryFeed() {
  const [activeCategory, setActiveCategory] = useState("Sana Özel");
  const [libraryIds, setLibraryIds] = useState<Set<number>>(new Set([3]));

  const toggleLibrary = (id: number) => {
    setLibraryIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{
      paddingTop: 65, paddingBottom: 80,
      background: "#FAFAF8", minHeight: "100vh",
      overflowY: "auto",
    }}>
      <style>{`
        .story-card {
          border-radius: 12px; overflow: hidden; cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s;
          background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        }
        .story-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.13); }
        .cat-pill {
          padding: 7px 16px; border-radius: 999px;
          border: 1.5px solid #E8E0D8; background: white; color: #6B6560;
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 12px;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: all 0.18s;
        }
        .cat-pill.active { background: ${ORANGE}; border-color: ${ORANGE}; color: white; }
        .cat-pill:hover:not(.active) { border-color: ${ORANGE}; color: ${ORANGE}; }
        .tag-chip {
          padding: 5px 12px; border-radius: 999px;
          background: ${ORANGE_LIGHT}; color: ${ORANGE};
          font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: background 0.15s;
        }
        .tag-chip:hover { background: #ffd9c9; }
        .lib-btn {
          width: 30px; height: 30px; border-radius: 50%; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: all 0.18s; flex-shrink: 0;
        }
        .lib-btn.inactive { background: rgba(255,255,255,0.85); color: #aaa; }
        .lib-btn.active   { background: ${ORANGE}; color: white; }
        .lib-btn:hover { transform: scale(1.1); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.3s ease both; }
      `}</style>

      {/* FEATURED */}
      <div className="fade-up" style={{ margin: "20px 16px 0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(255,97,34,0.25)", cursor: "pointer" }}>
        <div style={{ background: featured.bg, padding: "28px 20px 24px", position: "relative", minHeight: 200 }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", right: 20, bottom: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "white", padding: "4px 10px", borderRadius: 6, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 12 }}>
              ⭐ EDİTÖRÜN SEÇİMİ
            </div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 10, textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
              {featured.title}
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 16, maxWidth: 280 }}>
              {featured.desc}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>@{featured.author}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{featured.chapters} bölüm</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button style={{ background: "white", color: ORANGE, border: "none", padding: "10px 20px", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                Şimdi Oku
              </button>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>📖 {featured.reads}</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>⭐ {featured.votes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRENDING TAGS */}
      <div className="fade-up-2" style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {trendingTags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="fade-up-2" style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`cat-pill ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* STORY GRID */}
      <div className="fade-up-3" style={{ padding: "24px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "#1A1713" }}>🔥 Trend Hikayeler</span>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: ORANGE, cursor: "pointer" }}>Tümü</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {stories.map((s) => (
            <div key={s.id} className="story-card">
              <div style={{ height: 160, background: s.bg, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: 56, color: "rgba(255,255,255,0.15)", fontStyle: "italic", fontWeight: 700 }}>{s.initial}</span>

                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  {s.isHot && <span style={{ background: ORANGE_LIGHT, color: ORANGE, fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>🔥 HOT</span>}
                  {s.isNew && <span style={{ background: "#E8F5E9", color: "#2E7D32", fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>✨ YENİ</span>}
                </div>

                <button
                  className={`lib-btn ${libraryIds.has(s.id) ? "active" : "inactive"}`}
                  style={{ position: "absolute", top: 8, right: 8 }}
                  onClick={(e) => { e.stopPropagation(); toggleLibrary(s.id); }}
                >
                  {libraryIds.has(s.id) ? "♥" : "♡"}
                </button>

                <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                  <span style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 4, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {s.genre}
                  </span>
                </div>
              </div>

              <div style={{ padding: "12px 12px 14px" }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "#1A1713", lineHeight: 1.25, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#9A9490", fontWeight: 600, marginBottom: 8 }}>@{s.author}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#9A9490", fontWeight: 600 }}>📖 {s.reads}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#9A9490", fontWeight: 600 }}>⭐ {s.votes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WRITE BANNER */}
      <div className="fade-up-4" style={{ margin: "28px 16px 24px", background: "linear-gradient(135deg, #FFF0EB, #FFF8F5)", border: "1.5px solid #FFD0BC", borderRadius: 16, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>✍️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 700, color: "#1A1713", marginBottom: 4 }}>Hikayeni paylaş</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#9A9490", fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>
              90 milyondan fazla okuyucu seni bekliyor.
            </div>
            <button style={{ background: ORANGE, color: "white", border: "none", padding: "9px 18px", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              Yazmaya Başla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/redread/StoryFeed.tsx
git commit -m "feat: storyfeed -> kart grid - featured, kategoriler, hikaye kartları"
```

---

### Task 5: Profile.tsx — Light Tema

**Dosya:** `src/components/redread/Profile.tsx`

**Step 1: Profile'ı light temaya çevir**

```tsx
"use client";

import React, { useState } from "react";
import { Settings, AlignLeft, Bookmark } from "lucide-react";
import { motion } from "motion/react";

const ORANGE = "#FF6122";

const myStories = [
  { id: "p1", title: "Küller ve Şarap", date: "12 Eki", reads: "1.2K", snippet: "Bir zamanlar tüm kelimeleri ezbere bildiğimizi sanırdık. Oysa sadece susmayı öğrenmiştik." },
  { id: "p2", title: "Geceyarısı Kütüphanesi", date: "05 Eki", reads: "876", snippet: "Kitapların tozlu sayfalarında aradığım şey bir kahraman değildi, sadece kendi yansımamdı." },
  { id: "p3", title: "Eksik Cümleler", date: "28 Eyl", reads: "2.1K", snippet: "Bana yarım bıraktığın o cümlenin sonunu getirmeyeceğim. Bırak o boşluk, senin anıtın olsun." },
];

export function Profile() {
  const [activeProfileTab, setActiveProfileTab] = useState<"stories" | "saved">("stories");

  return (
    <div style={{
      paddingTop: 65, paddingBottom: 80,
      background: "#FAFAF8", minHeight: "100vh",
      overflowY: "auto",
    }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
      >
        {/* Avatar */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: `linear-gradient(135deg, ${ORANGE}, #FF8A5B)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 700,
          color: "white", marginBottom: 16,
          boxShadow: "0 4px 20px rgba(255,97,34,0.25)",
        }}>A</div>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "#1A1713", marginBottom: 4 }}>
          Aylin Karaca
        </h1>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: ORANGE, fontWeight: 700, marginBottom: 8 }}>
          @aylin.yazar
        </p>
        <p style={{ fontFamily: "'Lora', serif", fontSize: 13, color: "#9A9490", fontStyle: "italic", maxWidth: 260, lineHeight: 1.6, marginBottom: 20 }}>
          "Kelimelerin arasına saklanmış bir sessizlik avcısı."
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 0, width: "100%",
          borderTop: "1px solid #F0EDE8", borderBottom: "1px solid #F0EDE8",
          padding: "16px 0", marginBottom: 20,
          justifyContent: "center",
        }}>
          {[
            { value: "12", label: "Eser" },
            { value: "1.4K", label: "Okur" },
            { value: "84", label: "Takip" },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              borderRight: i < 2 ? "1px solid #F0EDE8" : "none",
            }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "#1A1713" }}>{stat.value}</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: "#9A9490", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 280 }}>
          <button style={{
            flex: 1, padding: "10px 16px", borderRadius: 10,
            border: `1.5px solid ${ORANGE}`, background: "white",
            color: ORANGE, fontFamily: "'Nunito', sans-serif", fontWeight: 800,
            fontSize: 13, cursor: "pointer",
          }}>
            Profili Düzenle
          </button>
          <button style={{
            width: 42, height: 42, borderRadius: 10,
            border: "1.5px solid #E8E0D8", background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#9A9490",
          }}>
            <Settings size={16} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px", marginTop: 24, borderBottom: "1px solid #F0EDE8", position: "relative" }}>
        {(["stories", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProfileTab(tab)}
            style={{
              flex: 1, padding: "12px 8px",
              border: "none", background: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer",
              color: activeProfileTab === tab ? ORANGE : "#9A9490",
              fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12,
              borderBottom: activeProfileTab === tab ? `2px solid ${ORANGE}` : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab === "stories" ? <AlignLeft size={14} /> : <Bookmark size={14} />}
            {tab === "stories" ? "Satırlarım" : "Kütüphane"}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeProfileTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ padding: "16px 16px 24px" }}
      >
        {activeProfileTab === "stories" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myStories.map((story) => (
              <div key={story.id} style={{
                padding: "16px", borderRadius: 12,
                background: "white", border: "1px solid #F0EDE8",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "#1A1713" }}>{story.title}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#9A9490", fontWeight: 600 }}>{story.date}</span>
                </div>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 12, color: "#6B6560", lineHeight: 1.6, marginBottom: 10, fontStyle: "italic" }}>
                  "{story.snippet}"
                </p>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#9A9490", fontWeight: 600 }}>📖 {story.reads} okuma</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center", padding: "48px 16px",
            fontFamily: "'Lora', serif", fontSize: 14,
            color: "#9A9490", fontStyle: "italic",
          }}>
            Kütüphane sessiz. Henüz saklanmış bir hikaye yok.
          </div>
        )}
      </motion.div>
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/redread/Profile.tsx
git commit -m "feat: profile light tema - avatar, stats, satırlarım/kütüphane"
```

---

### Task 6: RedreadRoot.tsx — 5 Tab Routing

**Dosya:** `src/components/redread/RedreadRoot.tsx`

**Step 1: RedreadRoot'u 5 sekmeye genişlet**

```tsx
"use client";

import React, { useState } from "react";
import { StoryFeed } from "./StoryFeed";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Profile } from "./Profile";
import { Onboarding } from "./Onboarding";

type Tab = "home" | "browse" | "library" | "write" | "profile";

export function RedreadRoot() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":    return <StoryFeed />;
      case "browse":  return <StoryFeed />;   // ileride ayrı Browse ekranı olacak
      case "library": return (
        <div style={{ paddingTop: 65, paddingBottom: 80, background: "#FAFAF8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#9A9490", fontStyle: "italic" }}>Kütüphane yakında...</p>
        </div>
      );
      case "write":   return (
        <div style={{ paddingTop: 65, paddingBottom: 80, background: "#FAFAF8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#9A9490", fontStyle: "italic" }}>Yazı editörü yakında...</p>
        </div>
      );
      case "profile": return <Profile />;
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: "#FAFAF8", minHeight: "100vh", position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.08)" }}>
      <TopBar activeTab={activeTab} />
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/redread/RedreadRoot.tsx
git commit -m "feat: redreadroot 5 tab routing, light bg, wattpad layout"
```

---

### Task 7: Son Kontrol

**Step 1:** Dev server çalışıyorsa URL'yi aç: `http://localhost:6500/tr`

**Step 2:** Kontrol listesi:
- [ ] Onboarding açılıyor, 3 adım geçilebiliyor
- [ ] Ana ekranda featured kart, tag'ler, kategori pill'leri, hikaye grid'i görünüyor
- [ ] Kalp butonu toggle çalışıyor
- [ ] BottomNav'da 5 sekme var, turuncu aktif state var
- [ ] Profile sekmesine geçince profil ekranı açılıyor
- [ ] Nunito + Lora fontları yüklenmiş (round font)
- [ ] Konsol'da hata yok

**Step 3: Final commit**
```bash
git add -A
git commit -m "feat: wattpad light tema entegrasyonu tamamlandı"
```
