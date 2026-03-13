# Profile Edit & Settings Sheets Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Profile.tsx'teki "Profili Düzenle" ve Settings butonlarına işlevsel bottom sheet'ler bağlamak.

**Architecture:** İki bağımsız sheet component (EditProfileSheet, SettingsSheet) + Service Worker. Her ikisi de motion/react ile alttan animasyonlu açılır. Profile.tsx'e sadece state ve onClick eklenir.

**Tech Stack:** Next.js App Router, motion/react, Supabase (DB + Storage), Web Push API, ThemeContext, AuthContext

---

## Chunk 1: EditProfileSheet

### Task 1: SQL migration — social_links kolonu

**Files:**
- Create: `supabase/migrations/20260313000000_users_social_links.sql`

- [ ] **Step 1: Migration dosyasını yaz**

```sql
alter table public.users
  add column if not exists social_links jsonb default '{}';
```

- [ ] **Step 2: Supabase Dashboard → SQL Editor'da çalıştır**

Supabase Dashboard → SQL Editor → yukarıdaki SQL'i yapıştır → Run.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260313000000_users_social_links.sql
git commit -m "feat: add social_links column to users"
```

---

### Task 2: EditProfileSheet component

**Files:**
- Create: `src/components/redread/EditProfileSheet.tsx`

- [ ] **Step 1: Component iskeletini oluştur**

```tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileUser {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  social_links?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
  profileUser: ProfileUser;
  onSaved: (updated: ProfileUser) => void;
}
```

- [ ] **Step 2: State ve validasyon logic'ini yaz**

```tsx
export function EditProfileSheet({ open, onClose, profileUser, onSaved }: EditProfileSheetProps) {
  const [displayName, setDisplayName] = useState(profileUser.display_name ?? "");
  const [username, setUsername] = useState(profileUser.username);
  const [bio, setBio] = useState(profileUser.bio ?? "");
  const [twitter, setTwitter] = useState(profileUser.social_links?.twitter ?? "");
  const [instagram, setInstagram] = useState(profileUser.social_links?.instagram ?? "");
  const [website, setWebsite] = useState(profileUser.social_links?.website ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profileUser.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setDisplayName(profileUser.display_name ?? "");
      setUsername(profileUser.username);
      setBio(profileUser.bio ?? "");
      setTwitter(profileUser.social_links?.twitter ?? "");
      setInstagram(profileUser.social_links?.instagram ?? "");
      setWebsite(profileUser.social_links?.website ?? "");
      setAvatarPreview(profileUser.avatar_url);
      setAvatarFile(null);
      setError("");
      setUsernameStatus("idle");
    }
  }, [open]);

  // Username debounce check
  useEffect(() => {
    if (username === profileUser.username) { setUsernameStatus("idle"); return; }
    const valid = /^[a-z0-9_]{3,30}$/.test(username);
    if (!valid) { setUsernameStatus("invalid"); return; }
    setUsernameStatus("checking");
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    usernameTimerRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();
      setUsernameStatus(data ? "taken" : "ok");
    }, 500);
    return () => { if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current); };
  }, [username, profileUser.username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Dosya 2MB'dan büyük olamaz."); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "checking") return;
    setSaving(true);
    setError("");
    try {
      let avatarUrl = profileUser.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profileUser.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = publicUrl;
      }
      const updates = {
        display_name: displayName.trim() || null,
        username,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        social_links: { twitter: twitter.trim(), instagram: instagram.trim(), website: website.trim() },
      };
      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", profileUser.id);
      if (updateError) throw updateError;
      onSaved({ ...profileUser, ...updates });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };
```

- [ ] **Step 3: JSX render'ı yaz**

```tsx
  const usernameHint = {
    idle: null,
    checking: <span style={{ color: "var(--muted-foreground)", fontSize: 11 }}>Kontrol ediliyor...</span>,
    ok: <span style={{ color: "#22c55e", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}><Check size={11} /> Kullanılabilir</span>,
    taken: <span style={{ color: "#ef4444", fontSize: 11 }}>Bu kullanıcı adı alınmış</span>,
    invalid: <span style={{ color: "#ef4444", fontSize: 11 }}>3-30 karakter, sadece a-z, 0-9, _</span>,
  }[usernameStatus];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid var(--muted)", background: "var(--card)",
    color: "var(--foreground)", fontFamily: "'Nunito', sans-serif",
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700,
    color: "var(--muted-foreground)", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 6, display: "block",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
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
          {/* Sheet */}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                Profili Düzenle
              </h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
                  background: "linear-gradient(135deg, var(--primary), #FF8A5B)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 700, color: "white",
                  position: "relative",
                }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (profileUser.display_name ?? profileUser.username).charAt(0).toUpperCase()
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 8,
                    border: "1.5px solid var(--muted)", background: "var(--card)",
                    color: "var(--foreground)", fontFamily: "'Nunito', sans-serif",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <Camera size={13} /> Fotoğraf Değiştir
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>

              {/* Display Name */}
              <div>
                <label style={labelStyle}>İsim</label>
                <input style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} placeholder="Görünen ismin" />
              </div>

              {/* Username */}
              <div>
                <label style={labelStyle}>Kullanıcı Adı</label>
                <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} maxLength={30} placeholder="kullanici_adi" />
                {usernameHint && <div style={{ marginTop: 4 }}>{usernameHint}</div>}
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  style={{ ...inputStyle, resize: "none", minHeight: 80 }}
                  value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160}
                  placeholder="Kendinden bahset..."
                />
                <div style={{ textAlign: "right", fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                  {bio.length}/160
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label style={labelStyle}>Sosyal Linkler</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Twitter / X", value: twitter, setter: setTwitter, placeholder: "https://twitter.com/kullanici" },
                    { label: "Instagram", value: instagram, setter: setInstagram, placeholder: "https://instagram.com/kullanici" },
                    { label: "Website", value: website, setter: setWebsite, placeholder: "https://siteniz.com" },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", minWidth: 72 }}>{label}</span>
                      <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444", fontFamily: "'Nunito', sans-serif", fontSize: 12 }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 10,
                    border: "1.5px solid var(--muted)", background: "var(--card)",
                    color: "var(--muted-foreground)", fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "checking"}
                  style={{
                    flex: 2, padding: "12px 0", borderRadius: 10,
                    border: "none",
                    background: (saving || usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "checking")
                      ? "rgba(255,97,34,0.5)" : "var(--primary)",
                    color: "white", fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800, fontSize: 14,
                    cursor: saving ? "wait" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {saving && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Supabase Storage'da `avatars` bucket oluştur**

Supabase Dashboard → Storage → New bucket → Name: `avatars` → Public: ✅ → Create.
Sonra Storage → Policies → `avatars` bucket → New policy:
```sql
-- INSERT: authenticated users can upload to their own folder
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- SELECT: public read
create policy "Public avatar read"
on storage.objects for select
using (bucket_id = 'avatars');
```

- [ ] **Step 5: Commit**

```bash
git add src/components/redread/EditProfileSheet.tsx
git commit -m "feat: add EditProfileSheet component"
```

---

## Chunk 2: SettingsSheet

### Task 3: Service Worker

**Files:**
- Create: `public/sw.js`

- [ ] **Step 1: Service Worker dosyasını oluştur**

```js
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      data: { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

- [ ] **Step 2: Commit**

```bash
git add public/sw.js
git commit -m "feat: add service worker for push notifications"
```

---

### Task 4: SettingsSheet component

**Files:**
- Create: `src/components/redread/SettingsSheet.tsx`

- [ ] **Step 1: Imports ve types**

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Moon, Sun, Globe, Lock, Bell, FileText, LogOut, Trash2, ChevronRight, Loader2, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  userEmail: string | undefined;
  onDeleteRequest: () => void; // Profile.tsx'teki delete dialog'u tetikler
}
```

- [ ] **Step 2: Push notification helper fonksiyonları**

```tsx
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function registerPush(userId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    subscription: sub.toJSON(),
  }, { onConflict: "user_id" });
  return !error;
}

async function unregisterPush(userId: string): Promise<void> {
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  await sub?.unsubscribe();
}
```

- [ ] **Step 3: Component state ve logic**

```tsx
export function SettingsSheet({ open, onClose, userEmail, onDeleteRequest }: SettingsSheetProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, resetPassword, user } = useAuth();
  const [notifLike, setNotifLike] = useState(false);
  const [notifFollow, setNotifFollow] = useState(false);
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
    supabase.from("push_subscriptions").select("id").eq("user_id", user.id).single()
      .then(({ data }) => {
        const active = !!data;
        setNotifLike(active);
        setNotifFollow(active);
      });
  }, [open, user?.id]);

  const handleNotifToggle = async (type: "like" | "follow", value: boolean) => {
    if (!user) return;
    setNotifLoading(true);
    if (value) {
      const ok = await registerPush(user.id);
      if (ok) { setNotifLike(true); setNotifFollow(true); }
    } else {
      await unregisterPush(user.id);
      setNotifLike(false); setNotifFollow(false);
    }
    setNotifLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    await resetPassword(userEmail);
    setPasswordSent(true);
    setTimeout(() => setPasswordSent(false), 4000);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    onClose();
  };
```

- [ ] **Step 4: JSX render**

```tsx
  const sheetStyle: React.CSSProperties = {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480, zIndex: 301,
    background: "var(--card)", borderRadius: "20px 20px 0 0",
    maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800,
    color: "var(--muted-foreground)", textTransform: "uppercase",
    letterSpacing: "0.1em", padding: "16px 20px 8px",
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

  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <div
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, cursor: disabled ? "wait" : "pointer",
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={sheetStyle}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--muted)" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 4px" }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Ayarlar</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Görünüm */}
            <p style={sectionTitle}>Görünüm</p>
            <div style={rowStyle} onClick={toggleTheme}>
              <span style={rowLabel}>{theme === "dark" ? <Moon size={16} /> : <Sun size={16} />} Tema</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 }}>
                {theme === "dark" ? "Karanlık" : "Aydınlık"}
              </span>
            </div>

            <div style={{ height: 1, background: "var(--muted)", margin: "0 20px" }} />

            {/* Hesap */}
            <p style={sectionTitle}>Hesap</p>
            <div style={rowStyle}>
              <span style={rowLabel}><Globe size={16} /> Dil</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                Türkçe <ChevronRight size={14} />
              </span>
            </div>
            <div style={rowStyle} onClick={handlePasswordReset}>
              <span style={rowLabel}><Lock size={16} /> Şifre Değiştir</span>
              {passwordSent
                ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#22c55e", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700 }}><Check size={13} /> Gönderildi</span>
                : <ChevronRight size={16} color="var(--muted-foreground)" />
              }
            </div>

            <div style={{ height: 1, background: "var(--muted)", margin: "0 20px" }} />

            {/* Bildirimler */}
            <p style={sectionTitle}>Bildirimler</p>
            <div style={rowStyle}>
              <span style={rowLabel}><Bell size={16} /> Yeni beğeni</span>
              <Toggle value={notifLike} onChange={(v) => handleNotifToggle("like", v)} disabled={notifLoading} />
            </div>
            <div style={rowStyle}>
              <span style={rowLabel}><Bell size={16} /> Yeni takipçi</span>
              <Toggle value={notifFollow} onChange={(v) => handleNotifToggle("follow", v)} disabled={notifLoading} />
            </div>

            <div style={{ height: 1, background: "var(--muted)", margin: "0 20px" }} />

            {/* Diğer */}
            <p style={sectionTitle}>Diğer</p>
            <div style={rowStyle} onClick={() => window.open("/privacy", "_blank")}>
              <span style={rowLabel}><FileText size={16} /> Gizlilik Politikası</span>
              <ChevronRight size={16} color="var(--muted-foreground)" />
            </div>

            {/* Çıkış */}
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
                {signingOut ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <LogOut size={14} />}
                Çıkış Yap
              </button>
            </div>

            {/* Hesabı Sil */}
            <div style={{ padding: "0 20px 40px" }}>
              <button
                onClick={() => { onClose(); onDeleteRequest(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#ef4444", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700, fontSize: 13, display: "flex",
                  alignItems: "center", gap: 6, padding: "8px 0",
                }}
              >
                <Trash2 size={14} /> Hesabı Sil
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add public/sw.js src/components/redread/SettingsSheet.tsx
git commit -m "feat: add SettingsSheet with push notification support"
```

---

## Chunk 3: Profile.tsx entegrasyonu

### Task 5: Profile.tsx'e sheet'leri bağla

**Files:**
- Modify: `src/components/redread/Profile.tsx`

- [ ] **Step 1: Import'ları ekle**

Mevcut import bloğunun sonuna:
```tsx
import { EditProfileSheet } from "./EditProfileSheet";
import { SettingsSheet } from "./SettingsSheet";
```

- [ ] **Step 2: State'leri ekle**

`showDeleteDialog` state'inin hemen ardına:
```tsx
const [showEditSheet, setShowEditSheet] = useState(false);
const [showSettingsSheet, setShowSettingsSheet] = useState(false);
```

- [ ] **Step 3: "Profili Düzenle" butonuna onClick ekle**

```tsx
// Eski:
<button style={{ ... }}>
  Profili Düzenle
</button>

// Yeni:
<button
  onClick={() => setShowEditSheet(true)}
  style={{ ... }}
>
  Profili Düzenle
</button>
```

- [ ] **Step 4: Settings butonuna onClick ekle**

```tsx
// Eski:
<button style={{ ... }}>
  <Settings size={16} strokeWidth={1.5} />
</button>

// Yeni:
<button
  onClick={() => setShowSettingsSheet(true)}
  style={{ ... }}
>
  <Settings size={16} strokeWidth={1.5} />
</button>
```

- [ ] **Step 5: Sheet component'lerini render'a ekle**

`return` içindeki en dıştaki `<div>` kapanış tag'ından hemen önce, `showDeleteDialog` bloğunun altına:

```tsx
{/* Edit Profile Sheet */}
{!initialUser && profileUser && (
  <EditProfileSheet
    open={showEditSheet}
    onClose={() => setShowEditSheet(false)}
    profileUser={profileUser}
    onSaved={(updated) => {
      setProfileUser(updated);
      setShowEditSheet(false);
    }}
  />
)}

{/* Settings Sheet */}
{!initialUser && (
  <SettingsSheet
    open={showSettingsSheet}
    onClose={() => setShowSettingsSheet(false)}
    userEmail={authUser?.email}
    onDeleteRequest={() => {
      setShowSettingsSheet(false);
      setShowDeleteDialog(true);
    }}
  />
)}
```

- [ ] **Step 6: Build kontrolü**

```bash
npm run build
```

Hata yoksa devam.

- [ ] **Step 7: Commit**

```bash
git add src/components/redread/Profile.tsx
git commit -m "feat: wire EditProfileSheet and SettingsSheet to Profile"
```

---

## Chunk 4: VAPID key & env

### Task 6: VAPID key oluştur ve .env.local'e ekle

- [ ] **Step 1: VAPID key üret**

```bash
npx web-push generate-vapid-keys
```

Çıktı şöyle görünür:
```
Public Key: Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- [ ] **Step 2: .env.local'e ekle**

```
NEXT_PUBLIC_VAPID_KEY=<Public Key>
```

- [ ] **Step 3: Supabase secrets ekle (backend agent tamamlandıktan sonra)**

```bash
supabase secrets set VAPID_PUBLIC_KEY=<Public Key> VAPID_PRIVATE_KEY=<Private Key>
```

- [ ] **Step 4: Final build + push**

```bash
npm run build
git add .env.example   # public key'i example'a ekle, private'ı ekleme
git commit -m "feat: profile edit and settings sheets complete"
git push
```
