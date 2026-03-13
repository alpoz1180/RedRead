"use client";

import React, { useState } from "react";
import { Home, Compass, BookOpen, PenLine, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Layout & style constants
const MAX_MOBILE_WIDTH = 430;
const NAV_BLUR_PX = 16;
const NAV_PADDING_TOP = 8;
const NAV_PADDING_BOTTOM = 16;
const NAV_ITEM_BORDER_RADIUS = 12;
const NAV_ICON_SIZE = 22;
const NAV_ICON_STROKE_ACTIVE = 2.2;
const NAV_ICON_STROKE_INACTIVE = 1.6;
const NAV_LABEL_FONT_SIZE = 10;


export type Tab = "home" | "browse" | "library" | "write" | "profile";

const NAV_ITEMS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }> }[] = [
  { id: "home",    label: "Ana Sayfa",  Icon: Home },
  { id: "browse",  label: "Keşfet",     Icon: Compass },
  { id: "library", label: "Kütüphane",  Icon: BookOpen },
  { id: "write",   label: "Yaz",        Icon: PenLine },
  { id: "profile", label: "Profil",     Icon: User },
];

export function BottomNav({
  activeTab,
  onTabChange,
  isMobile = true,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isMobile?: boolean;
}) {
  const { theme } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);
  if (!isMobile) return null;
  return (
    <nav
      aria-label="Alt gezinme"
      style={{
      position: "fixed", bottom: 0, zIndex: 50,
      width: "100%", maxWidth: MAX_MOBILE_WIDTH,
      background: theme === "dark" ? "rgba(15,14,13,0.96)" : "rgba(250,250,248,0.96)",
      backdropFilter: `blur(${NAV_BLUR_PX}px)`,
      WebkitBackdropFilter: `blur(${NAV_BLUR_PX}px)`,
      borderTop: "1px solid var(--muted)",
      padding: `${NAV_PADDING_TOP}px ${NAV_PADDING_TOP}px ${NAV_PADDING_BOTTOM}px`,
      display: "flex",
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
              padding: "8px 4px",
              borderRadius: NAV_ITEM_BORDER_RADIUS, border: "none",
              background: hoveredTab === item.id ? "var(--secondary)" : "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={() => setHoveredTab(item.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <item.Icon
              size={NAV_ICON_SIZE}
              strokeWidth={isActive ? NAV_ICON_STROKE_ACTIVE : NAV_ICON_STROKE_INACTIVE}
              color={isActive ? "var(--primary)" : "var(--muted-foreground)"}
            />
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: NAV_LABEL_FONT_SIZE, fontWeight: 700,
              letterSpacing: "0.04em",
              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
            }}>{item.label}</span>
            {isActive && (
              <div style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "var(--primary)", marginTop: 1,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
