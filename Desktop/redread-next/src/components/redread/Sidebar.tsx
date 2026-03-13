"use client";

import React, { useState } from "react";
import { Home, Compass, BookOpen, PenLine, User, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Tab } from "./BottomNav";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  user: { email?: string; user_metadata?: { username?: string } } | null;
  onAvatarClick: () => void;
}

const NAV_ITEMS: {
  id: Tab;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
}[] = [
  { id: "home",    label: "Ana Sayfa",  Icon: Home },
  { id: "browse",  label: "Keşfet",     Icon: Compass },
  { id: "library", label: "Kütüphane",  Icon: BookOpen },
  { id: "write",   label: "Yaz",        Icon: PenLine },
  { id: "profile", label: "Profil",     Icon: User },
];

export function Sidebar({ activeTab, onTabChange, user, onAvatarClick }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<Tab | null>(null);
  const [themeHovered, setThemeHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  // Kullanıcı baş harfini hesapla
  const userInitial = (() => {
    const username = user?.user_metadata?.username;
    if (username) return username[0].toUpperCase();
    const email = user?.email;
    if (email) return email[0].toUpperCase();
    return "G";
  })();

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 240,
        height: "100vh",
        zIndex: 40,
        background: "var(--card)",
        borderRight: "1px solid var(--muted)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 32,
          paddingLeft: 4,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            R
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
          }}
        >
          Redread
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                width: "100%",
                marginBottom: 4,
                background: isActive
                  ? "rgba(255, 97, 34, 0.1)"
                  : isHovered
                  ? "var(--surface)"
                  : "transparent",
                transition: "background 0.15s",
              }}
            >
              <item.Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.6}
                color={isActive ? "var(--primary)" : "var(--muted-foreground)"}
              />
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  letterSpacing: "0.01em",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Alt kısım */}
      <div
        style={{
          borderTop: "1px solid var(--muted)",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Tema toggle butonu */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setThemeHovered(true)}
          onMouseLeave={() => setThemeHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            width: "100%",
            background: themeHovered ? "var(--surface)" : "transparent",
            transition: "background 0.15s",
          }}
        >
          {theme === "dark" ? (
            <Sun size={20} strokeWidth={1.6} color="var(--muted-foreground)" />
          ) : (
            <Moon size={20} strokeWidth={1.6} color="var(--muted-foreground)" />
          )}
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--muted-foreground)",
            }}
          >
            {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
          </span>
        </button>

        {/* Kullanıcı avatarı */}
        <button
          onClick={onAvatarClick}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            width: "100%",
            background: avatarHovered ? "var(--surface)" : "transparent",
            transition: "background 0.15s",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              {userInitial}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--foreground)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 130,
              }}
            >
              {user?.user_metadata?.username ?? user?.email ?? "Giriş Yap"}
            </span>
            {user && (
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 130,
                }}
              >
                {user.email}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
