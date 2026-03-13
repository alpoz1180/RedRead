"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import { StoryFeed } from "./StoryFeed";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Onboarding } from "./Onboarding";

import { WriteEditor } from "./WriteEditor";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "./Auth";
import { AnimatePresence } from "motion/react";
import type { Tab } from "./BottomNav";
import { ErrorBoundary } from "./ErrorBoundary";

// Lazy-loaded heavy tab components — only fetched when the user first navigates there
const Profile = lazy(() =>
  import("./Profile").then((m) => ({ default: m.Profile }))
);
const Library = lazy(() =>
  import("./Library").then((m) => ({ default: m.Library }))
);

/** Skeleton shown while a lazy tab chunk is being fetched */
function TabSkeleton() {
  return (
    <div
      style={{
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--background)",
      }}
    >
      {/* Avatar + name row (profile-like) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--card)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ height: 14, width: "40%", borderRadius: 6, background: "var(--muted)" }} />
          <div style={{ height: 12, width: "60%", borderRadius: 6, background: "var(--muted)" }} />
        </div>
      </div>
      {/* Content rows */}
      {[100, 80, 90].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            width: `${w}%`,
            borderRadius: 6,
            background: "var(--muted)",
          }}
        />
      ))}
      {/* Card block */}
      <div
        style={{
          height: 120,
          borderRadius: 12,
          background: "var(--card)",
          marginTop: 8,
        }}
      />
    </div>
  );
}

// Layout breakpoint & sizing constants
const DESKTOP_BREAKPOINT = 768;
const MAX_MOBILE_WIDTH = 430;
const SIDEBAR_WIDTH = 240;
const CONTENT_MAX_WIDTH = 900;

export function RedreadRoot() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isMobile, setIsMobile] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, role } = useAuth();

  const handleOnboardingComplete = () => {
    localStorage.setItem("rr_onboarding_done", "1");
    setShowOnboarding(false);
  };

  // Client'a geçince gerçek değerleri oku
  useEffect(() => {
    setShowOnboarding(localStorage.getItem("rr_onboarding_done") !== "1");
    setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    setHydrated(true);
  }, []);

  // Ekran boyutu değişince isMobile güncelle
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // OAuth sonrası onboarding kapat
  useEffect(() => {
    if (user && showOnboarding) {
      localStorage.setItem("rr_onboarding_done", "1");
      setShowOnboarding(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!hydrated) return null;

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const isWriteTab = activeTab === "write";

  const renderContent = () => {
    switch (activeTab) {
      case "home":
      case "browse":
        return <StoryFeed />;
      case "library":
        return (
          <Suspense fallback={<TabSkeleton />}>
            <Library />
          </Suspense>
        );
      case "write":
        if (role !== 'writer' && role !== 'admin') {
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              padding: '40px 24px',
              textAlign: 'center',
              gap: 16,
            }}>
              <span style={{ fontSize: 48 }}>✍️</span>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Yazar Hesabı Gerekiyor
              </h2>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, color: 'var(--muted-foreground)', maxWidth: 280, lineHeight: 1.6, margin: 0 }}>
                Hikaye yazmak için yazar hesabına ihtiyacın var. Başvurunu{' '}
                <strong>redread@gmail.com</strong> adresine gönder.
              </p>
            </div>
          );
        }
        return <WriteEditor onExit={() => setActiveTab("home")} userId={user?.id ?? null} />;
      case "profile":
        return (
          <Suspense fallback={<TabSkeleton />}>
            <Profile />
          </Suspense>
        );
    }
  };

  // ── Desktop layout (768px+) ──
  if (!isMobile) {
    return (
      <ErrorBoundary>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
        }}>
          {/* Sol sidebar */}
          {!isWriteTab && (
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              user={user}
              onAvatarClick={() => { if (!user) setShowAuth(true); }}
            />
          )}

          {/* İçerik alanı */}
          <div style={{
            marginLeft: isWriteTab ? 0 : SIDEBAR_WIDTH,
            flex: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}>
            {!isWriteTab && <TopBar isMobile={false} />}
            <div style={{
              maxWidth: isWriteTab ? "100%" : CONTENT_MAX_WIDTH,
              width: "100%",
              margin: "0 auto",
              flex: 1,
            }}>
              {renderContent()}
            </div>
          </div>

          <AnimatePresence>
            {showAuth && (
              <Auth onSuccess={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
    );
  }

  // ── Mobil layout (mevcut) ──
  return (
    <ErrorBoundary>
      <div style={{
        maxWidth: MAX_MOBILE_WIDTH, margin: "0 auto",
        background: "var(--background)", color: "var(--foreground)",
        minHeight: "100vh",
        position: "relative",
        boxShadow: "0 0 60px rgba(0,0,0,0.08)",
      }}>
        {!isWriteTab && <TopBar isMobile={true} />}
        {renderContent()}
        {!isWriteTab && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} isMobile={true} />}
      </div>
    </ErrorBoundary>
  );
}
