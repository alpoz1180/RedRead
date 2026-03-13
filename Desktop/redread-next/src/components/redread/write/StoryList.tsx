"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Plus, Layers, Hash, Trash2, Type, Sparkles,
} from "lucide-react";
import { COVER_GRADIENTS } from "@/constants/gradients";
import { Story, loadStories, saveStories, storyWordCount, fmtDate } from "./types";

/* ─── Props ───────────────────────────────────────────────────── */

export interface StoryListProps {
  onSelect: (s: Story) => void;
  onCreate: () => void;
  onExit?: () => void;
  isSupabase?: boolean;
  userId?: string | null;
}

/* ─── Component ───────────────────────────────────────────────── */

export function StoryList({ onSelect, onCreate, onExit, isSupabase, userId }: StoryListProps) {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => { setStories(loadStories()); }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        await writeService.deleteStory(id, userId!);
      } catch (err) {
        console.error("Supabase delete failed:", err);
      }
    }
    const next = stories.filter((s) => s.id !== id);
    saveStories(next);
    setStories(next);
  };

  return (
    <div style={{ paddingTop: 65, paddingBottom: 80, background: "var(--background)", minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onExit && (
              <button onClick={onExit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}>
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
            )}
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>
              Yazılarım
            </h2>
          </div>
          <button onClick={onCreate} style={{
            background: "var(--primary)", color: "var(--primary-foreground)", border: "none",
            padding: "10px 20px", borderRadius: 10,
            fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 12px rgba(255,97,34,0.25)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,97,34,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(255,97,34,0.25)"; }}
          >
            <Plus size={15} strokeWidth={2.5} /> Yeni Hikaye
          </button>
        </div>

        {/* Empty state */}
        {stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 20, margin: "0 auto 20px",
              background: `linear-gradient(135deg, var(--secondary), var(--secondary-light))`,
              border: `1.5px solid var(--primary-border)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Type size={32} color={"var(--primary)"} strokeWidth={1.5} />
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 18, color: "var(--foreground)", fontWeight: 700, marginBottom: 8 }}>
              Henüz bir hikaye yok
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 28, lineHeight: 1.6 }}>
              Kelimeler seni bekliyor. İlk hikayeni yaz.
            </p>
            <button onClick={onCreate} style={{
              background: `linear-gradient(135deg, var(--primary), var(--primary-mid))`,
              color: "var(--primary-foreground)", border: "none",
              padding: "14px 32px", borderRadius: 12,
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255,97,34,0.3)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <Sparkles size={16} strokeWidth={2} />
              Yazmaya Başla
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stories.sort((a, b) => b.updatedAt - a.updatedAt).map((s, i) => {
              const words = storyWordCount(s);
              const chCount = s.chapters.length;
              const preview = s.chapters[0]?.content?.slice(0, 100) ?? "";
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  onClick={() => onSelect(s)}
                  style={{
                    borderRadius: 14, overflow: "hidden",
                    background: "var(--card)", border: "1px solid var(--muted)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    cursor: "pointer", position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
                >
                  {/* Cover gradient strip */}
                  <div style={{ height: 6, background: s.coverGradient || COVER_GRADIENTS[0] }} />

                  <div style={{ padding: "14px 16px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                            {s.title || "Başlıksız Hikaye"}
                          </span>
                          <span style={{
                            fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 800,
                            color: s.status === "published" ? "#22c55e" : "var(--muted-foreground)",
                            background: s.status === "published" ? "var(--secondary)" : "var(--surface)",
                            padding: "2px 8px", borderRadius: 4,
                            textTransform: "uppercase", letterSpacing: "0.06em",
                          }}>
                            {s.status === "published" ? "Yayında" : "Taslak"}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                          {fmtDate(s.updatedAt)}
                        </span>
                      </div>
                      <button onClick={(e) => handleDelete(s.id, e)} style={{
                        background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4,
                        transition: "color 0.15s",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    {preview && (
                      <p style={{
                        fontFamily: "'Lora', serif", fontSize: 12, color: "var(--muted-foreground)",
                        lineHeight: 1.6, fontStyle: "italic",
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                        marginBottom: 10,
                      }}>
                        &quot;{preview}&quot;
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      {s.genres.length > 0 && (
                        <span style={{
                          fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 700,
                          color: "var(--primary)", background: "var(--secondary)", padding: "2px 8px", borderRadius: 4,
                        }}>
                          {s.genres[0]}
                        </span>
                      )}
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <Layers size={11} /> {chCount} bölüm
                      </span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <Hash size={11} /> {words} kelime
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
