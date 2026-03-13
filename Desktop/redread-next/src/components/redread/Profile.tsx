"use client";

import React, { useState, useEffect } from "react";
import { Settings, AlignLeft, Bookmark, Eye, Heart, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Auth } from "./Auth";
import { EditProfileSheet } from "./EditProfileSheet";
import { SettingsSheet } from "./SettingsSheet";

interface ProfileUser {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface ProfileStory {
  id: string;
  title: string;
  description: string | null;
  word_count: number;
  likes_count: number;
  created_at: string;
  cover_gradient: string | null;
}

function isProfileStory(value: unknown): value is ProfileStory {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v["id"] === "string" && typeof v["title"] === "string";
}

interface ProfileProps {
  initialUser?: ProfileUser | null;
  initialStories?: ProfileStory[];
}

export function Profile({ initialUser, initialStories }: ProfileProps = {}) {
  const { user: authUser, deleteAccount } = useAuth();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(initialUser ?? null);
  const [stories, setStories] = useState<ProfileStory[]>(initialStories ?? []);
  const [bookmarks, setBookmarks] = useState<ProfileStory[]>([]);
  const [loading, setLoading] = useState(initialUser === undefined && !initialStories);
  const [activeProfileTab, setActiveProfileTab] = useState<"stories" | "saved">("stories");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    const { error } = await deleteAccount();
    setDeleteLoading(false);
    if (error) {
      setDeleteError(error.message);
    } else {
      // deleteAccount already calls signOut internally; redirect to home
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (initialUser !== undefined) return;
    if (!authUser) { setLoading(false); return; }

    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      const { data: userData } = await supabase
        .from("users")
        .select("id, username, display_name, bio, avatar_url")
        .eq("id", authUser!.id)
        .single();
      if (cancelled) return;
      if (userData) setProfileUser(userData as ProfileUser);

      const { data: storiesData } = await supabase
        .from("stories")
        .select("id, title, description, word_count, likes_count, created_at, cover_gradient")
        .eq("author_id", authUser!.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (storiesData) setStories(storiesData as ProfileStory[]);
      setLoading(false);
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [authUser, initialUser]);

  useEffect(() => {
    if (activeProfileTab !== "saved" || !profileUser || bookmarks.length > 0) return;
    let cancelled = false;
    supabase
      .from("bookmarks")
      .select("story:stories!story_id(id, title, description, word_count, likes_count, created_at, cover_gradient)")
      .eq("user_id", profileUser.id)
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setBookmarks(data.map((b) => b.story).filter(isProfileStory));
      });
    return () => { cancelled = true; };
  }, [activeProfileTab, profileUser?.id]);

  if (loading) {
    return (
      <div style={{ paddingTop: 65, paddingBottom: 80, background: "var(--background)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} color="var(--primary)" style={{ animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profileUser) {
    // Own profile tab but not logged in — prompt auth
    if (initialUser === undefined && !authUser) {
      // onSuccess'e gerek yok: authUser değişince yukarıdaki useEffect zaten fetchProfile'i tetikler
      return <Auth onSuccess={() => {}} />;
    }
    return (
      <div style={{ paddingTop: 65, paddingBottom: 80, background: "var(--background)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Lora', serif", fontSize: 15, color: "var(--muted-foreground)", fontStyle: "italic" }}>
          Profil bulunamadı.
        </p>
      </div>
    );
  }

  const displayName = profileUser.display_name || profileUser.username;
  const initial = displayName.charAt(0).toUpperCase();
  const totalLikes = stories.reduce((sum, s) => sum + (s.likes_count || 0), 0);
  const likesDisplay = totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}K` : String(totalLikes);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <div style={{ paddingTop: 65, paddingBottom: 80, background: "var(--background)", minHeight: "100vh", overflowY: "auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
      >
        {/* Avatar */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: profileUser.avatar_url ? "transparent" : "linear-gradient(135deg, var(--primary), #FF8A5B)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 700, color: "white",
          marginBottom: 16, boxShadow: "0 4px 20px rgba(255,97,34,0.25)", overflow: "hidden",
        }}>
          {profileUser.avatar_url
            ? <img src={profileUser.avatar_url} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initial}
        </div>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
          {displayName}
        </h1>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "var(--primary)", fontWeight: 700, marginBottom: 8 }}>
          @{profileUser.username}
        </p>
        {profileUser.bio && (
          <p style={{ fontFamily: "'Lora', serif", fontSize: 13, color: "var(--muted-foreground)", fontStyle: "italic", maxWidth: 260, lineHeight: 1.6, marginBottom: 20 }}>
            &quot;{profileUser.bio}&quot;
          </p>
        )}

        {/* Stats */}
        <div style={{ display: "flex", width: "100%", borderTop: "1px solid var(--muted)", borderBottom: "1px solid var(--muted)", padding: "16px 0", marginTop: profileUser.bio ? 0 : 20, marginBottom: 20, justifyContent: "center" }}>
          {[
            { value: String(stories.length), label: "Eser" },
            { value: likesDisplay, label: "Beğeni" },
            { value: "0", label: "Takip" },
          ].map((stat, i) => (
            <div key={stat.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRight: i < 2 ? "1px solid var(--muted)" : "none" }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>{stat.value}</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: "var(--muted-foreground)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Edit button — only for own profile */}
        {!initialUser && (
          <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 280 }}>
            <button
              onClick={() => setShowEditSheet(true)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "1.5px solid var(--primary)", background: "var(--card)", color: "var(--primary)", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              Profili Düzenle
            </button>
            <button
              onClick={() => setShowSettingsSheet(true)}
              style={{ width: 42, height: 42, borderRadius: 10, border: "1.5px solid var(--muted)", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted-foreground)" }}
            >
              <Settings size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px", marginTop: 24, borderBottom: "1px solid var(--muted)" }}>
        {(["stories", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProfileTab(tab)}
            style={{
              flex: 1, padding: "12px 8px", border: "none", background: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer",
              color: activeProfileTab === tab ? "var(--primary)" : "var(--muted-foreground)",
              fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12,
              borderBottom: activeProfileTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
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
          stories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", fontFamily: "'Lora', serif", fontSize: 14, color: "var(--muted-foreground)", fontStyle: "italic" }}>
              Henüz yayınlanmış hikaye yok.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stories.map((story) => (
                <div key={story.id} style={{ padding: "16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--muted)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{story.title}</span>
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{formatDate(story.created_at)}</span>
                  </div>
                  {story.description && (
                    <p style={{ fontFamily: "'Lora', serif", fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 10, fontStyle: "italic" }}>
                      &quot;{story.description}&quot;
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                      <Eye size={12} strokeWidth={2} /> {story.word_count || 0} kelime
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                      <Heart size={12} strokeWidth={2} /> {story.likes_count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          bookmarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", fontFamily: "'Lora', serif", fontSize: 14, color: "var(--muted-foreground)", fontStyle: "italic" }}>
              Kütüphane sessiz. Henüz saklanmış bir hikaye yok.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bookmarks.map((story) => (
                <div key={story.id} style={{ padding: "16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--muted)", cursor: "pointer" }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>{story.title}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                      <Eye size={12} strokeWidth={2} /> {story.word_count || 0} kelime
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                      <Heart size={12} strokeWidth={2} /> {story.likes_count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </motion.div>

      {/* Danger Zone — only for own profile */}
      {!initialUser && (
        <div style={{ padding: "0 16px 40px" }}>
          <div style={{
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12,
            padding: "16px",
            background: "rgba(239,68,68,0.04)",
          }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>
              Tehlikeli Bölge
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12, lineHeight: 1.5 }}>
              Hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              style={{
                padding: "9px 16px", borderRadius: 10, border: "1.5px solid #ef4444",
                background: "transparent", color: "#ef4444",
                fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13,
                cursor: "pointer",
              }}
            >
              Hesabı Sil
            </button>
          </div>
        </div>
      )}

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

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 20px",
          }}
          onClick={() => { if (!deleteLoading) setShowDeleteDialog(false); }}
        >
          <div
            style={{
              width: "100%", maxWidth: 340,
              background: "var(--card)", border: "1px solid var(--muted)",
              borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>
              Hesabı Sil
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 20 }}>
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
            </p>
            {deleteError && (
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#ef4444", marginBottom: 12 }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteError(""); }}
                disabled={deleteLoading}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 10,
                  border: "1.5px solid var(--muted)", background: "var(--card)",
                  color: "var(--muted-foreground)", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 10,
                  border: "none", background: deleteLoading ? "rgba(239,68,68,0.6)" : "#ef4444",
                  color: "white", fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800, fontSize: 13,
                  cursor: deleteLoading ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "opacity 0.2s",
                }}
              >
                {deleteLoading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                {deleteLoading ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
