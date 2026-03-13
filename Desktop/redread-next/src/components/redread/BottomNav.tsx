"use client";

import React, { useState } from "react";
import { Home, Compass, BookOpen, PenLine, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";




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
    <div style={{
      position: "fixed", bottom: 0, zIndex: 50,
      width: "100%", maxWidth: 430,
      background: theme === "dark" ? "rgba(15,14,13,0.96)" : "rgba(250,250,248,0.96)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid var(--muted)",
      padding: "8px 8px 16px",
      display: "flex",
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
              padding: "8px 4px",
              borderRadius: 12, border: "none",
              background: hoveredTab === item.id ? "var(--secondary)" : "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={() => setHoveredTab(item.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <item.Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.6}
              color={isActive ? "var(--primary)" : "var(--muted-foreground)"}
            />
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 10, fontWeight: 700,
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
    </div>
  );
}
