"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Moon, Sun, Globe, Lock, Bell, FileText, LogOut, Trash2, ChevronRight, Loader2, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  userEmail: string | undefined;
  onDeleteRequest: () => void;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

async function registerPush(userId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (!VAPID_PUBLIC_KEY) {
    console.error("NEXT_PUBLIC_VAPID_KEY is not set");
    return false;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    const { error } = await supabase.from("push_subscriptions").upsert(
      { user_id: userId, subscription: sub.toJSON() },
      { onConflict: "user_id" }
    );
    return !error;
  } catch (err) {
    console.error("Push registration failed:", err);
    return false;
  }
}

async function unregisterPush(userId: string): Promise<void> {
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  await sub?.unsubscribe();
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13,
        cursor: disabled ? "wait" : "pointer",
        background: value ? "var(--primary)" : "var(--muted)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%", background: "white",
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

export function SettingsSheet({ open, onClose, userEmail, onDeleteRequest }: SettingsSheetProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, resetPassword, user } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // SW kayıt
  useEffect(() => {
    if (!open || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, [open]);

  // Mevcut subscription durumunu kontrol et
  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setNotifEnabled(!!data));
  }, [open, user?.id]);

  const handleNotifToggle = async (value: boolean) => {
    if (!user) return;
    setNotifLoading(true);
    if (value) {
      const ok = await registerPush(user.id);
      setNotifEnabled(ok);
    } else {
      await unregisterPush(user.id);
      setNotifEnabled(false);
    }
    setNotifLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    const { error } = await resetPassword(userEmail);
    if (!error) {
      setPasswordSent(true);
      setTimeout(() => setPasswordSent(false), 4000);
    } else {
      console.error("Password reset failed:", error.message);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      onClose();
    } catch (err) {
      // sign out başarısız olsa da spinner'ı kaldır
      logger.error("Sign out failed:", err);
    } finally {
      setSigningOut(false);
    }
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800,
    color: "var(--muted-foreground)", textTransform: "uppercase",
    letterSpacing: "0.1em", padding: "16px 20px 8px", margin: 0,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px", cursor: "pointer",
  };

  const rowLabel: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 600,
    color: "var(--foreground)",
  };

  const divider = <div style={{ height: 1, background: "var(--muted)", margin: "0 20px" }} />;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 300,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 480, zIndex: 301,
              background: "var(--card)", borderRadius: "20px 20px 0 0",
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--muted)" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 4px" }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                Ayarlar
              </h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, display: "flex" }}>
                <X size={20} />
              </button>
            </div>

            {/* Görünüm */}
            <p style={sectionTitle}>Görünüm</p>
            <div style={rowStyle} onClick={toggleTheme}>
              <span style={rowLabel}>
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                Tema
              </span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 }}>
                {theme === "dark" ? "Karanlık" : "Aydınlık"}
              </span>
            </div>

            {divider}

            {/* Hesap */}
            <p style={sectionTitle}>Hesap</p>
            <div style={{ ...rowStyle, cursor: "default" }}>
              <span style={rowLabel}>
                <Globe size={16} /> Dil
              </span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                Türkçe <ChevronRight size={14} />
              </span>
            </div>
            <div style={rowStyle} onClick={handlePasswordReset}>
              <span style={rowLabel}>
                <Lock size={16} /> Şifre Değiştir
              </span>
              {passwordSent
                ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#22c55e", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700 }}>
                    <Check size={13} /> Gönderildi
                  </span>
                : <ChevronRight size={16} color="var(--muted-foreground)" />
              }
            </div>

            {divider}

            {/* Bildirimler */}
            <p style={sectionTitle}>Bildirimler</p>
            <div style={{ ...rowStyle, cursor: "default" }}>
              <span style={rowLabel}>
                <Bell size={16} /> Yeni beğeni
              </span>
              <Toggle value={notifEnabled} onChange={handleNotifToggle} disabled={notifLoading} />
            </div>
            <div style={{ ...rowStyle, cursor: "default" }}>
              <span style={rowLabel}>
                <Bell size={16} /> Yeni takipçi
              </span>
              <Toggle value={notifEnabled} onChange={handleNotifToggle} disabled={notifLoading} />
            </div>

            {divider}

            {/* Diğer */}
            <p style={sectionTitle}>Diğer</p>
            <div style={rowStyle} onClick={() => window.open("/privacy", "_blank")}>
              <span style={rowLabel}>
                <FileText size={16} /> Gizlilik Politikası
              </span>
              <ChevronRight size={16} color="var(--muted-foreground)" />
            </div>

            {/* Çıkış Yap */}
            <div style={{ padding: "16px 20px 8px" }}>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 10,
                  border: "1.5px solid var(--primary)", background: "transparent",
                  color: "var(--primary)", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {signingOut
                  ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                  : <LogOut size={14} />
                }
                Çıkış Yap
              </button>
            </div>

            {/* Hesabı Sil */}
            <div style={{ padding: "4px 20px 40px" }}>
              <button
                onClick={() => { onClose(); onDeleteRequest(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#ef4444", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 0",
                }}
              >
                <Trash2 size={14} /> Hesabı Sil
              </button>
            </div>
          </motion.div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </AnimatePresence>
  );
}
