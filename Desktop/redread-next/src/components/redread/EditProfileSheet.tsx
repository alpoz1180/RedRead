"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  }, [open, profileUser]);

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
        social_links: {
          twitter: twitter.trim(),
          instagram: instagram.trim(),
          website: website.trim(),
        },
      };
      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", profileUser.id);
      if (updateError) throw updateError;
      onSaved({ ...profileUser, ...updates });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const usernameHint = {
    idle: null,
    checking: <span style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>Kontrol ediliyor...</span>,
    ok: <span style={{ color: "#22c55e", fontSize: 11, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 3 }}><Check size={11} /> Kullanılabilir</span>,
    taken: <span style={{ color: "#ef4444", fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>Bu kullanıcı adı alınmış</span>,
    invalid: <span style={{ color: "#ef4444", fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>3-30 karakter, sadece a-z 0-9 _</span>,
  }[usernameStatus];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid var(--muted)", background: "var(--background)",
    color: "var(--foreground)", fontFamily: "'Nunito', sans-serif",
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700,
    color: "var(--muted-foreground)", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 6, display: "block",
  };

  const displayInitial = (profileUser.display_name ?? profileUser.username).charAt(0).toUpperCase();

  const isSaveDisabled = saving
    || usernameStatus === "taken"
    || usernameStatus === "invalid"
    || usernameStatus === "checking";

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                Profili Düzenle
              </h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4, display: "flex" }}>
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
                  flexShrink: 0,
                }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : displayInitial
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Display Name */}
              <div>
                <label style={labelStyle}>İsim</label>
                <input
                  style={inputStyle}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Görünen ismin"
                />
              </div>

              {/* Username */}
              <div>
                <label style={labelStyle}>Kullanıcı Adı</label>
                <input
                  style={inputStyle}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  maxLength={30}
                  placeholder="kullanici_adi"
                />
                {usernameHint && <div style={{ marginTop: 4 }}>{usernameHint}</div>}
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  style={{ ...inputStyle, resize: "none", minHeight: 80 }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
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
                  {([
                    { label: "Twitter / X", value: twitter, setter: setTwitter, placeholder: "https://twitter.com/kullanici" },
                    { label: "Instagram", value: instagram, setter: setInstagram, placeholder: "https://instagram.com/kullanici" },
                    { label: "Website", value: website, setter: setWebsite, placeholder: "https://siteniz.com" },
                  ] as const).map(({ label, value, setter, placeholder }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", minWidth: 78, flexShrink: 0 }}>{label}</span>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                      />
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
                  disabled={isSaveDisabled}
                  style={{
                    flex: 2, padding: "12px 0", borderRadius: 10,
                    border: "none",
                    background: isSaveDisabled ? "rgba(255,97,34,0.45)" : "var(--primary)",
                    color: "white", fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800, fontSize: 14,
                    cursor: saving ? "wait" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "background 0.2s",
                  }}
                >
                  {saving && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </motion.div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </AnimatePresence>
  );
}
