"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Sun, Moon, X, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Auth } from "./Auth";
import { AnimatePresence } from "motion/react";

interface SearchStory {
  id: string;
  title: string;
  genre: string | null;
  cover_gradient: string | null;
  author: { username: string } | null;
}

export function TopBar({ isMobile = true }: { isMobile?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { user: authUser } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchStory[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("stories")
        .select("id, title, genre, cover_gradient, author:users!author_id(username)")
        .eq("published", true)
        .ilike("title", `%${query}%`)
        .limit(8)
        .returns<SearchStory[]>();
      setResults(data || []);
      setSearching(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const closeSearch = () => { setSearchOpen(false); setQuery(""); setResults([]); };

  const barStyle = isMobile
    ? { position: "fixed" as const, top: 0, zIndex: 50, width: "100%", maxWidth: 430 }
    : { position: "sticky" as const, top: 0, zIndex: 40, width: "100%" };

  return (
    <>
      <div style={{
        ...barStyle,
        background: theme === "dark" ? "rgba(15,14,13,0.95)" : "rgba(250,250,248,0.95)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--muted)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 18, color: "white" }}>R</div>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 18, color: "var(--foreground)", letterSpacing: "-0.02em" }}>Redread</span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={toggleTheme} style={{ width: 36, height: 36, background: theme === "dark" ? "#2A2725" : "var(--muted)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}>
            {theme === "dark" ? <Sun size={18} strokeWidth={2} color="#FFB86C" /> : <Moon size={18} strokeWidth={2} color="var(--muted-foreground)" />}
          </button>

          <button onClick={() => setSearchOpen(true)} style={{ width: 36, height: 36, background: theme === "dark" ? "#2A2725" : "var(--muted)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}>
            <Search size={18} strokeWidth={2} color="var(--muted-foreground)" />
          </button>

          <div style={{ position: "relative" }}>
            <div style={{ width: 36, height: 36, background: "var(--muted)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Bell size={18} strokeWidth={2} color="var(--muted-foreground)" />
            </div>
            <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "var(--primary)", borderRadius: "50%", border: "2px solid var(--background)" }} />
          </div>

          <button
            onClick={() => { if (!authUser) setShowAuth(true); }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary), var(--primary-mid))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "white",
              fontFamily: "'Nunito', sans-serif", cursor: "pointer", border: "none",
            }}
          >
            {authUser
              ? (authUser.user_metadata?.username?.[0] || authUser.email?.[0] || "U").toUpperCase()
              : "R"}
          </button>
        </div>
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <Auth onSuccess={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />
        )}
      </AnimatePresence>

      {/* Search overlay */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={closeSearch}>
          <div
            style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--background)", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--muted)" }}>
              <Search size={18} strokeWidth={2} color="var(--primary)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hikaye ara..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}
              />
              {searching
                ? <Loader2 size={18} color="var(--muted-foreground)" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                : <button onClick={closeSearch} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", padding: 4 }}><X size={18} /></button>
              }
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            {results.length > 0 && (
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {results.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid var(--muted)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: s.cover_gradient || "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "'Lora', serif", fontSize: 18, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>{s.title?.charAt(0)}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>{s.title}</div>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                        @{s.author?.username || "anonim"}
                        {s.genre && <span style={{ marginLeft: 6, color: "var(--primary)" }}>· {s.genre}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query && !searching && results.length === 0 && (
              <div style={{ padding: "24px 20px", textAlign: "center", fontFamily: "'Lora', serif", fontSize: 14, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                &quot;{query}&quot; için sonuç bulunamadı.
              </div>
            )}

            {!query && (
              <div style={{ padding: "20px", textAlign: "center", fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>
                Başlık, yazar veya tür ara...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
