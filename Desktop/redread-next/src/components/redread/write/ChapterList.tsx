"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Clock, Hash, ChevronDown, Trash2,
  Plus, GripVertical, BookOpen, Layers,
  Send,
} from "lucide-react";
import {
  Story, Chapter, GENRES,
  loadStories, saveStories, storyWordCount, uploadImage, gid,
} from "./types";
import { ChapterListCover } from "./ChapterListCover";

/* ─── Props ───────────────────────────────────────────────────── */

export interface ChapterListProps {
  story: Story;
  onBack: () => void;
  onEditChapter: (chapterId: string) => void;
  onUpdateStory: (updated: Story) => void;
  isSupabase?: boolean;
  userId?: string | null;
}

/* ─── Component ───────────────────────────────────────────────── */

export function ChapterList({
  story, onBack, onEditChapter, onUpdateStory, isSupabase, userId,
}: ChapterListProps) {
  const [s, setS] = useState<Story>(story);
  const [showMeta, setShowMeta] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const supabaseSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((updated: Story) => {
    // Local persist
    if (!isSupabase) {
      const all = loadStories();
      const idx = all.findIndex((x) => x.id === updated.id);
      if (idx >= 0) all[idx] = updated; else all.push(updated);
      saveStories(all);
    }
    setS(updated);
    onUpdateStory(updated);

    // Debounced Supabase sync for meta updates
    if (isSupabase) {
      if (supabaseSaveRef.current) clearTimeout(supabaseSaveRef.current);
      supabaseSaveRef.current = setTimeout(async () => {
        try {
          const { writeService } = await import("@/services/write.service");
          await writeService.updateStoryMeta(updated.id, userId!, {
            title: updated.title,
            description: updated.description,
            genres: updated.genres,
            status: updated.status,
            coverGradient: updated.coverGradient,
          });
        } catch (err) {
          console.error("Supabase meta sync failed:", err);
        }
      }, 800);
    }
  }, [onUpdateStory, isSupabase, userId]);

  const addChapter = async () => {
    const num = s.chapters.length + 1;

    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        const ch = await writeService.addChapter(s.id, userId!, s.chapters.length);
        if (ch) {
          const updated = { ...s, chapters: [...s.chapters, ch], updatedAt: Date.now() };
          setS(updated);
          onUpdateStory(updated);
          onEditChapter(ch.id);
          return;
        }
      } catch (err) {
        console.error("Supabase addChapter failed:", err);
      }
    }

    // Local fallback
    const ch: Chapter = { id: gid(), title: `Bölüm ${num}`, content: "" };
    const updated = { ...s, chapters: [...s.chapters, ch], updatedAt: Date.now() };
    persist(updated);
    onEditChapter(ch.id);
  };

  const deleteChapter = async (chId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (s.chapters.length <= 1) return;

    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        await writeService.deleteChapter(chId, s.id, userId!);
      } catch (err) {
        console.error("Supabase deleteChapter failed:", err);
      }
    }

    const updated = { ...s, chapters: s.chapters.filter((c) => c.id !== chId), updatedAt: Date.now() };
    persist(updated);
  };

  const toggleGenre = (g: string) => {
    const next = s.genres.includes(g)
      ? s.genres.filter((x) => x !== g)
      : s.genres.length < 3 ? [...s.genres, g] : s.genres;
    persist({ ...s, genres: next, updatedAt: Date.now() });
  };

  const togglePublish = () => {
    persist({ ...s, status: s.status === "published" ? "draft" : "published", updatedAt: Date.now() });
  };

  const handleCoverImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCoverUploading(true);
    try {
      const url = await uploadImage(file, "story-covers");
      persist({ ...s, coverImage: url, updatedAt: Date.now() });
      setShowCoverPicker(false);
    } finally {
      setCoverUploading(false);
    }
  };

  const totalWords = storyWordCount(s);

  // Cleanup debounced Supabase meta sync timeout on unmount
  useEffect(() => {
    return () => {
      if (supabaseSaveRef.current) clearTimeout(supabaseSaveRef.current);
    };
  }, []);

  return (
    <div style={{ paddingTop: 0, paddingBottom: 40, background: "var(--background)", minHeight: "100vh" }}>
      {/* TopBar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "color-mix(in srgb, var(--background) 95%, transparent)", backdropFilter: "blur(12px)",
        padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--muted)",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)",
        }}>
          <ArrowLeft size={20} strokeWidth={2} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700 }}>Yazılarım</span>
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={togglePublish} style={{
            background: s.status === "published" ? "var(--surface)" : `linear-gradient(135deg, var(--primary), var(--primary-mid))`,
            color: s.status === "published" ? "var(--muted-foreground)" : "var(--card)",
            border: s.status === "published" ? "1.5px solid var(--muted)" : "none",
            padding: "7px 14px", borderRadius: 8,
            fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s",
          }}>
            <Send size={13} strokeWidth={2.5} />
            {s.status === "published" ? "Taslağa Al" : "Yayınla"}
          </button>
          <button onClick={addChapter} style={{
            background: "var(--primary)", color: "var(--primary-foreground)", border: "none",
            padding: "7px 14px", borderRadius: 8,
            fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            <Plus size={14} strokeWidth={2.5} /> Yeni Bölüm
          </button>
        </div>
      </div>

      <ChapterListCover
        story={s}
        showCoverPicker={showCoverPicker}
        coverUploading={coverUploading}
        coverFileRef={coverFileRef}
        onTogglePicker={() => setShowCoverPicker(!showCoverPicker)}
        onTitleChange={(title) => persist({ ...s, title, updatedAt: Date.now() })}
        onSelectGradient={(g) => { persist({ ...s, coverGradient: g, coverImage: undefined, updatedAt: Date.now() }); setShowCoverPicker(false); }}
        onCoverFileChange={handleCoverImageFile}
      />

      {/* Meta toggle */}
      <div style={{ padding: "12px 20px 0" }}>
        <button onClick={() => setShowMeta(!showMeta)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--primary)",
        }}>
          {s.genres.length > 0 ? s.genres.join(", ") : "Tür & Özet ekle"}
          <ChevronDown size={14} style={{ transform: showMeta ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Collapsible meta */}
      <AnimatePresence>
        {showMeta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Kategoriler ({s.genres.length}/3)
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {GENRES.map((g) => {
                    const sel = s.genres.includes(g);
                    const dis = !sel && s.genres.length >= 3;
                    return (
                      <button key={g} onClick={() => toggleGenre(g)} disabled={dis} style={{
                        padding: "6px 14px", borderRadius: 999,
                        border: `1.5px solid ${sel ? "var(--primary)" : "var(--muted)"}`,
                        background: sel ? "var(--primary)" : "var(--card)",
                        color: sel ? "white" : dis ? "var(--muted)" : "var(--muted-foreground)",
                        fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12,
                        cursor: dis ? "default" : "pointer", opacity: dis ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}>
                        {sel && "✓ "}{g}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Özet (opsiyonel)
                </span>
                <textarea
                  value={s.description}
                  onChange={(e) => persist({ ...s, description: e.target.value, updatedAt: Date.now() })}
                  placeholder="Okuyucuyu çekecek kısa bir özet..."
                  maxLength={300} rows={2}
                  style={{
                    width: "100%", marginTop: 8, padding: "10px 14px",
                    border: "1.5px solid var(--muted)", borderRadius: 10,
                    background: "var(--card)", resize: "none",
                    fontFamily: "'Lora', serif", fontSize: 13, lineHeight: 1.6,
                    color: "var(--foreground)", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; }}
                />
                <div style={{ textAlign: "right", fontFamily: "'Nunito', sans-serif", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                  {s.description.length}/300
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div style={{
        margin: "16px 20px 0", padding: "10px 14px", borderRadius: 10,
        background: "var(--surface)", display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)" }}>
          <Layers size={13} strokeWidth={2} /> {s.chapters.length} bölüm
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)" }}>
          <Hash size={13} strokeWidth={2} /> {totalWords} kelime
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)" }}>
          <Clock size={13} strokeWidth={2} /> {Math.max(1, Math.ceil(totalWords / 200))} dk
        </span>
        <span style={{
          marginLeft: "auto",
          fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800,
          color: s.status === "published" ? "#22c55e" : "var(--muted-foreground)",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {s.status === "published" ? "● Yayında" : "○ Taslak"}
        </span>
      </div>

      {/* Chapter list */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Bölümler
          </span>
        </div>

        {s.chapters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <BookOpen size={32} color="var(--muted)" strokeWidth={1.5} style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
              Henüz bölüm eklenmemiş.
            </p>
            <button onClick={addChapter} style={{
              background: "var(--primary)", color: "var(--primary-foreground)", border: "none",
              padding: "10px 22px", borderRadius: 8,
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer",
            }}>
              İlk Bölümü Ekle
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {s.chapters.map((ch, i) => {
              const words = ch.content.trim().split(/\s+/).filter(Boolean).length;
              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onEditChapter(ch.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 14px", borderRadius: 10,
                    background: "var(--card)", border: "1px solid var(--muted)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px rgba(255,97,34,0.1)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--muted)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.03)"; }}
                >
                  <GripVertical size={16} color="var(--muted)" strokeWidth={1.5} style={{ flexShrink: 0 }} />

                  <div style={{
                    width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                    background: ch.content.length > 0 ? `linear-gradient(135deg, var(--primary), var(--primary-mid))` : "var(--muted)",
                    color: ch.content.length > 0 ? "white" : "var(--muted-foreground)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800,
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                      {ch.title}
                    </div>
                    {ch.content ? (
                      <p style={{
                        fontFamily: "'Lora', serif", fontSize: 11, color: "var(--muted-foreground)",
                        fontStyle: "italic", marginTop: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {ch.content.slice(0, 60)}...
                      </p>
                    ) : (
                      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Henüz yazılmadı
                      </p>
                    )}
                  </div>

                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>
                    {words > 0 ? `${words} kel.` : "—"}
                  </span>

                  {s.chapters.length > 1 && (
                    <button onClick={(e) => deleteChapter(ch.id, e)} style={{
                      background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
                      padding: 4, flexShrink: 0, transition: "color 0.15s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  )}
                </motion.div>
              );
            })}

            <button onClick={addChapter} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "14px 0", borderRadius: 10,
              border: "1.5px dashed var(--muted)", background: "transparent",
              fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700,
              color: "var(--muted-foreground)", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
            >
              <Plus size={16} strokeWidth={2} /> Yeni Bölüm Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
