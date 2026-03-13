"use client";

import React, { useState, useEffect } from "react";
import { StoryFeed } from "./StoryFeed";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Profile } from "./Profile";
import { Library } from "./Library";
import { Onboarding } from "./Onboarding";
import { WriteEditor } from "./WriteEditor";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "./Auth";
import { AnimatePresence } from "motion/react";
import type { Tab } from "./BottomNav";
import { ErrorBoundary } from "./ErrorBoundary";

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
        return <Library />;
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
        return <Profile />;
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
