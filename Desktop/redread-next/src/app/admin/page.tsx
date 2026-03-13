"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type AdminTab = "stories" | "users" | "flags";

interface PendingStory {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  word_count: number;
  created_at: string;
  author: { username: string; display_name: string | null } | null;
}

interface AppUser {
  id: string;
  username: string;
  email: string;
  role: "reader" | "writer" | "admin";
  created_at: string;
}

interface FeatureFlag {
  id: string;
  flag_name: string;
  description: string | null;
  is_enabled: boolean;
}

export default function AdminPage() {
  const { user, role } = useAuth();
  const [tab, setTab] = useState<AdminTab>("stories");

  // Stories state
  const [stories, setStories] = useState<PendingStory[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Flags state
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  useEffect(() => {
    if (role !== "admin") return;
    if (tab === "stories") loadStories();
    else if (tab === "users") loadUsers();
    else loadFlags();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, role]);

  // Guard — must come AFTER all hook calls
  if (!user || role !== "admin") redirect("/");

  async function loadStories() {
    setStoriesLoading(true);
    const { data } = await supabase
      .from("stories")
      .select("id, title, description, genre, word_count, created_at, author:users!author_id(username, display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .returns<PendingStory[]>();
    setStories(data || []);
    setStoriesLoading(false);
  }

  async function approveStory(id: string) {
    await supabase
      .from("stories")
      .update({ status: "published", published: true, published_at: new Date().toISOString() })
      .eq("id", id);
    setStories(prev => prev.filter(s => s.id !== id));
  }

  async function rejectStory(id: string) {
    await supabase
      .from("stories")
      .update({ status: "rejected", published: false })
      .eq("id", id);
    setStories(prev => prev.filter(s => s.id !== id));
  }

  async function loadUsers() {
    setUsersLoading(true);
    const { data } = await supabase
      .from("users")
      .select("id, username, email, role, created_at")
      .order("created_at", { ascending: false });
    setUsers((data as AppUser[]) || []);
    setUsersLoading(false);
  }

  async function updateUserRole(userId: string, newRole: "reader" | "writer" | "admin") {
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  async function loadFlags() {
    setFlagsLoading(true);
    const { data } = await supabase
      .from("feature_flags")
      .select("*")
      .order("flag_name", { ascending: true });
    setFlags((data as FeatureFlag[]) || []);
    setFlagsLoading(false);
  }

  async function toggleFlag(id: string, current: boolean) {
    await supabase.from("feature_flags").update({ is_enabled: !current }).eq("id", id);
    setFlags(prev => prev.map(f => f.id === id ? { ...f, is_enabled: !current } : f));
  }

  const tabStyle = (t: AdminTab): React.CSSProperties => ({
    padding: "8px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    background: tab === t ? "var(--primary)" : "var(--muted)",
    color: tab === t ? "#fff" : "var(--foreground)",
    transition: "background 0.2s",
  });

  const btnStyle = (variant: "approve" | "reject"): React.CSSProperties => ({
    padding: "6px 14px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    background: variant === "approve" ? "var(--primary)" : "var(--muted)",
    color: variant === "approve" ? "#fff" : "var(--muted-foreground)",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      color: "var(--foreground)",
      padding: "40px 24px",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, margin: 0, color: "var(--primary)" }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "4px 0 0" }}>
            {user.email}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          <button style={tabStyle("stories")} onClick={() => setTab("stories")}>
            Hikayeler {stories.length > 0 && `(${stories.length})`}
          </button>
          <button style={tabStyle("users")} onClick={() => setTab("users")}>Kullanıcılar</button>
          <button style={tabStyle("flags")} onClick={() => setTab("flags")}>Özellikler</button>
        </div>

        {/* Stories tab */}
        {tab === "stories" && (
          <div>
            {storiesLoading && <p style={{ color: "var(--muted-foreground)" }}>Yükleniyor...</p>}
            {!storiesLoading && stories.length === 0 && (
              <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Bekleyen hikaye yok.</p>
            )}
            {stories.map(s => (
              <div key={s.id} style={{
                background: "var(--card)",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{s.title || "(Başlıksız)"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted-foreground)" }}>
                      @{s.author?.username ?? "?"} · {s.genre ?? "tür yok"} · {s.word_count} kelime
                    </p>
                    {s.description && (
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                        {s.description.slice(0, 120)}{s.description.length > 120 ? "…" : ""}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button style={btnStyle("approve")} onClick={() => approveStory(s.id)}>Yayınla</button>
                    <button style={btnStyle("reject")} onClick={() => rejectStory(s.id)}>Reddet</button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>
                  Gönderildi: {new Date(s.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div>
            {usersLoading && <p style={{ color: "var(--muted-foreground)" }}>Yükleniyor...</p>}
            {users.map(u => (
              <div key={u.id} style={{
                background: "var(--card)",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>@{u.username}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>{u.email}</p>
                </div>
                <select
                  disabled={u.id === user.id}
                  value={u.role}
                  onChange={e => updateUserRole(u.id, e.target.value as AppUser["role"])}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--muted)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: u.id === user.id ? "not-allowed" : "pointer",
                    opacity: u.id === user.id ? 0.5 : 1,
                  }}
                >
                  <option value="reader">reader</option>
                  <option value="writer">writer</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Flags tab */}
        {tab === "flags" && (
          <div>
            {flagsLoading && <p style={{ color: "var(--muted-foreground)" }}>Yükleniyor...</p>}
            {flags.map(f => (
              <div key={f.id} style={{
                background: "var(--card)",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{f.flag_name}</p>
                  {f.description && (
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>{f.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleFlag(f.id, f.is_enabled)}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    cursor: "pointer",
                    background: f.is_enabled ? "var(--primary)" : "var(--muted)",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: f.is_enabled ? 25 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                  }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
