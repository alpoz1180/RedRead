"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Check, Loader2, Type, AlignLeft,
  Clock, Hash, ChevronDown, Trash2, Save,
  Plus, GripVertical, BookOpen, Layers,
  Bold, Italic, Heading1, Quote, List, ListOrdered,
  Minus, Eye, Maximize, Minimize, Send,
  Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight,
  Undo2, Redo2, X, Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { COVER_GRADIENTS } from "@/constants/gradients";

/* ─── Constants ───────────────────────────────────────────────── */


const GENRES = [
  "Romantizm", "Gotik", "Dram", "Gizem",
  "Fantastik", "Psikolojik", "Gerilim", "Macera",
  "Bilim Kurgu", "Korku", "Gençlik",
];

/* ─── Types ───────────────────────────────────────────────────── */

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  genres: string[];
  chapters: Chapter[];
  coverGradient: string;
  coverImage?: string;
  status: "draft" | "published" | "pending" | "rejected";
  updatedAt: number;
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function gid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function uploadImage(file: File, bucket: string): Promise<string> {
  // Try Supabase Storage first
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
  } catch (err) { console.error("uploadImage: Supabase storage failed, falling back to base64", err); }
  // Fallback: base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

function loadStories(): Story[] {
  try {
    const raw = localStorage.getItem("rr_stories");
    if (!raw) {
      const oldRaw = localStorage.getItem("rr_drafts");
      if (oldRaw) {
        const old = JSON.parse(oldRaw) as Array<{
          id: string; title: string; content: string;
          description: string; genres: string[]; updatedAt: number;
        }>;
        const migrated: Story[] = old.map((d) => ({
          id: d.id, title: d.title, description: d.description,
          genres: d.genres, updatedAt: d.updatedAt,
          chapters: d.content
            ? [{ id: gid(), title: "Bölüm 1", content: d.content }]
            : [],
          coverGradient: COVER_GRADIENTS[0],
          status: "draft" as const,
        }));
        saveStories(migrated);
        localStorage.removeItem("rr_drafts");
        return migrated;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    // Migrate old stories that don't have new fields
    return parsed.map((s: Story) => ({
      ...s,
      coverGradient: s.coverGradient || COVER_GRADIENTS[0],
      status: s.status || "draft",
    }));
  } catch (err) { console.error("loadStories: failed to parse localStorage stories", err); return []; }
}

function saveStories(stories: Story[]) {
  localStorage.setItem("rr_stories", JSON.stringify(stories));
}

function storyWordCount(s: Story) {
  return s.chapters.reduce((sum, ch) =>
    sum + ch.content.trim().split(/\s+/).filter(Boolean).length, 0
  );
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/* ─── Formatting Toolbar ──────────────────────────────────────── */

interface ToolbarAction {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Kalın", prefix: "**", suffix: "**" },
  { icon: Italic, label: "İtalik", prefix: "_", suffix: "_" },
  { icon: Heading1, label: "Başlık", prefix: "\n## ", suffix: "\n", block: true },
  { icon: Quote, label: "Alıntı", prefix: "\n> ", suffix: "\n", block: true },
  { icon: List, label: "Liste", prefix: "\n- ", suffix: "\n", block: true },
  { icon: ListOrdered, label: "Num. Liste", prefix: "\n1. ", suffix: "\n", block: true },
  { icon: Minus, label: "Ayırıcı", prefix: "\n---\n", suffix: "", block: true },
];

function FormattingToolbar({
  textareaRef,
  onFormat,
  onInsertImage,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onFormat: (newContent: string, cursorPos: number) => void;
  onInsertImage?: () => void;
}) {
  const applyFormat = (action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.slice(start, end);

    let newText: string;
    let newCursor: number;

    if (action.block) {
      newText = text.slice(0, start) + action.prefix + selected + action.suffix + text.slice(end);
      newCursor = start + action.prefix.length + selected.length;
    } else {
      if (selected) {
        newText = text.slice(0, start) + action.prefix + selected + action.suffix + text.slice(end);
        newCursor = start + action.prefix.length + selected.length + action.suffix.length;
      } else {
        newText = text.slice(0, start) + action.prefix + action.suffix + text.slice(end);
        newCursor = start + action.prefix.length;
      }
    }

    onFormat(newText, newCursor);
  };

  return (
    <div style={{
      display: "flex", gap: 2, padding: "6px 4px",
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      {TOOLBAR_ACTIONS.map((action) => (
        <button
          key={action.label}
          title={action.label}
          onMouseDown={(e) => { e.preventDefault(); applyFormat(action); }}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: "none", background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--muted-foreground)",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--secondary)";
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          <action.icon size={16} strokeWidth={2} />
        </button>
      ))}
      {onInsertImage && (
        <button
          title="Fotoğraf ekle"
          onMouseDown={(e) => { e.preventDefault(); onInsertImage(); }}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: "none", background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--muted-foreground)",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--secondary)";
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          <Upload size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

/* ─── 1) Story List ───────────────────────────────────────────── */

function StoryList({
  onSelect, onCreate, onExit, isSupabase, userId,
}: {
  onSelect: (s: Story) => void;
  onCreate: () => void;
  onExit?: () => void;
  isSupabase?: boolean;
  userId?: string | null;
}) {
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

/* ─── 2) Chapter List (Story Detail) ──────────────────────────── */

function ChapterList({
  story, onBack, onEditChapter, onUpdateStory, isSupabase, userId,
}: {
  story: Story;
  onBack: () => void;
  onEditChapter: (chapterId: string) => void;
  onUpdateStory: (updated: Story) => void;
  isSupabase?: boolean;
  userId?: string | null;
}) {
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
  }, [onUpdateStory, isSupabase]);

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

      {/* Cover + Title */}
      <div
        onClick={() => setShowCoverPicker(!showCoverPicker)}
        style={{
          margin: "16px 16px 0", borderRadius: 16, overflow: "hidden",
          backgroundImage: s.coverImage ? `url(${s.coverImage})` : (s.coverGradient || COVER_GRADIENTS[0]),
          backgroundSize: "cover", backgroundPosition: "center",
          padding: "32px 20px 24px", position: "relative",
          cursor: "pointer", minHeight: 120,
        }}
      >
        {s.coverImage && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />}
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <div style={{
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
            borderRadius: 6, padding: "4px 8px",
            fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 700,
            color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4,
          }}>
            <ImageIcon size={12} /> Kapak değiştir
          </div>
        </div>
        <input
          type="text"
          value={s.title}
          onChange={(e) => persist({ ...s, title: e.target.value, updatedAt: Date.now() })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Hikaye Başlığı"
          maxLength={100}
          style={{
            width: "100%", border: "none", background: "transparent",
            fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700,
            color: "var(--primary-foreground)", outline: "none",
            textShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        />
        {s.description && (
          <p style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.75)", marginTop: 8, lineHeight: 1.5,
          }}>
            {s.description.slice(0, 80)}{s.description.length > 80 ? "..." : ""}
          </p>
        )}
      </div>

      {/* Cover Picker */}
      <AnimatePresence>
        {showCoverPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "12px 16px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", alignItems: "center" }}>
              {/* Photo upload button */}
              <div
                onClick={() => coverFileRef.current?.click()}
                style={{
                  width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                  border: "2px dashed var(--muted)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--card)", color: "var(--muted-foreground)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--muted)"; (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; }}
              >
                {coverUploading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={18} strokeWidth={2} />}
              </div>
              {COVER_GRADIENTS.map((g, i) => (
                <div
                  key={i}
                  onClick={() => { persist({ ...s, coverGradient: g, coverImage: undefined, updatedAt: Date.now() }); setShowCoverPicker(false); }}
                  style={{
                    width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                    background: g, cursor: "pointer",
                    border: (!s.coverImage && s.coverGradient === g) ? "2.5px solid white" : "2.5px solid transparent",
                    boxShadow: (!s.coverImage && s.coverGradient === g) ? `0 0 0 2px var(--primary)` : "0 1px 4px rgba(0,0,0,0.15)",
                    transition: "all 0.15s",
                  }}
                />
              ))}
              <input ref={coverFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverImageFile} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

/* ─── 3) Chapter Editor ───────────────────────────────────────── */

function ChapterEditor({
  story, chapterId, onBack, onNavigateChapter, isSupabase, userId,
}: {
  story: Story;
  chapterId: string;
  onBack: () => void;
  onNavigateChapter: (chapterId: string) => void;
  isSupabase?: boolean;
  userId?: string | null;
}) {
  const chapterIdx = story.chapters.findIndex((c) => c.id === chapterId);
  const chapter = story.chapters[chapterIdx];

  const [chTitle, setChTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [focusMode, setFocusMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const charCount = content.length;

  const prevChapter = chapterIdx > 0 ? story.chapters[chapterIdx - 1] : null;
  const nextChapter = chapterIdx < story.chapters.length - 1 ? story.chapters[chapterIdx + 1] : null;

  // Auto-expand
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Sync state when chapter changes
  useEffect(() => {
    const ch = story.chapters.find((c) => c.id === chapterId);
    if (ch) {
      setChTitle(ch.title);
      setContent(ch.content);
      undoStack.current = [];
      redoStack.current = [];
    }
  }, [chapterId, story.chapters]);

  // Save function
  const performSave = useCallback(async () => {
    setSaveStatus("saving");

    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        await writeService.updateChapter(chapterId, story.id, userId!, { title: chTitle, content });
        await writeService.updateStoryWordCount(story.id, userId!);
      } catch (err) {
        console.error("Supabase chapter save failed:", err);
      }
    } else {
      const all = loadStories();
      const sIdx = all.findIndex((s) => s.id === story.id);
      if (sIdx >= 0) {
        const cIdx = all[sIdx].chapters.findIndex((c) => c.id === chapterId);
        if (cIdx >= 0) {
          all[sIdx].chapters[cIdx] = { ...all[sIdx].chapters[cIdx], title: chTitle, content };
          all[sIdx].updatedAt = Date.now();
          saveStories(all);
        }
      }
    }

    if (savedStatusRef.current) clearTimeout(savedStatusRef.current);
    if (idleStatusRef.current) clearTimeout(idleStatusRef.current);
    savedStatusRef.current = setTimeout(() => setSaveStatus("saved"), 300);
    idleStatusRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
  }, [story.id, chapterId, chTitle, content, isSupabase]);

  // Debounced auto-save
  useEffect(() => {
    if (content.length < 3 && !chTitle) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(performSave, 1500);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [chTitle, content, performSave]);

  // Cleanup save status timers on unmount
  useEffect(() => {
    return () => {
      if (savedStatusRef.current) clearTimeout(savedStatusRef.current);
      if (idleStatusRef.current) clearTimeout(idleStatusRef.current);
    };
  }, []);

  const handleBack = async () => {
    if (content.length >= 3 || chTitle) await performSave();
    onBack();
  };

  // Undo/Redo
  const pushUndo = (text: string) => {
    undoStack.current.push(text);
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  };

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(content);
    const prev = undoStack.current.pop()!;
    setContent(prev);
  }, [content]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(content);
    const next = redoStack.current.pop()!;
    setContent(next);
  }, [content]);

  const handleContentChange = (newVal: string) => {
    pushUndo(content);
    setContent(newVal);
  };

  const handleFormat = (newContent: string, cursorPos: number) => {
    pushUndo(content);
    setContent(newContent);
    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        contentRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  const handleInsertImage = () => {
    imgFileRef.current?.click();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImgUploading(true);
    try {
      const url = await uploadImage(file, "story-images");
      const ta = contentRef.current;
      const pos = ta ? ta.selectionStart : content.length;
      const markdown = `\n![görsel](${url})\n`;
      const newContent = content.slice(0, pos) + markdown + content.slice(pos);
      pushUndo(content);
      setContent(newContent);
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.focus();
          const cur = pos + markdown.length;
          contentRef.current.setSelectionRange(cur, cur);
        }
      });
    } finally {
      setImgUploading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        performSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [performSave, handleUndo, handleRedo]);

  // Güvenli URL: sadece https, http ve data:image/ protokollerine izin ver
  const sanitizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (/^(https?:\/\/|data:image\/)/i.test(trimmed)) return trimmed;
    return '#';
  };

  // HTML özel karakterlerini escape et (capture group çıktılarını da korumak için)
  const escapeHtml = (str: string): string =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Simple markdown preview — process images before escaping, escape everything else
  const renderPreview = (text: string) => {
    // Extract image markdown before HTML escaping
    const parts: Array<{ type: "text" | "img"; value: string }> = [];
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(text)) !== null) {
      if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
      parts.push({ type: "img", value: match[2] });
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push({ type: "text", value: text.slice(last) });

    return parts.map((p) => {
      if (p.type === "img") {
        const safeSrc = sanitizeUrl(p.value);
        return `<img src="${escapeHtml(safeSrc)}" style="max-width:100%;border-radius:10px;margin:12px 0;display:block;" loading="lazy" />`;
      }
      // Tüm metni escape et, sonra markdown pattern'lerini güvenli şekilde uygula
      const safe = escapeHtml(p.value);
      return safe
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/^## (.+)$/gm, '<h2 style="font-family: \'Lora\', serif; font-size: 20px; font-weight: 700; margin: 16px 0 8px;">$1</h2>')
        .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left: 3px solid #FF6122; padding-left: 12px; color: var(--muted-foreground); font-style: italic; margin: 8px 0;">$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li style="margin-left: 16px;">$1</li>')
        .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid var(--muted); margin: 16px 0;" />')
        .replace(/\n/g, '<br />');
    }).join('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        paddingTop: 0, paddingBottom: 80,
        background: focusMode ? "var(--card)" : "var(--background)",
        minHeight: "100vh",
        transition: "background 0.3s",
      }}
    >
      {/* TopBar */}
      <motion.div
        animate={{ opacity: focusMode ? 0.4 : 1, y: focusMode ? -4 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "color-mix(in srgb, var(--background) 95%, transparent)", backdropFilter: "blur(12px)",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--muted)",
        }}
        onMouseEnter={(e) => { if (focusMode) { (e.currentTarget as HTMLElement).style.opacity = "1"; } }}
        onMouseLeave={(e) => { if (focusMode) { (e.currentTarget as HTMLElement).style.opacity = "0.4"; } }}
      >
        <button onClick={handleBack} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)",
        }}>
          <ArrowLeft size={20} strokeWidth={2} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700 }}>Bölümler</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AnimatePresence mode="wait">
            {saveStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                {saveStatus === "saving" && <Loader2 size={13} color="var(--muted-foreground)" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />}
                {saveStatus === "saved" && <Check size={13} color="#22c55e" strokeWidth={2.5} />}
                <span style={{
                  fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 600,
                  color: saveStatus === "saved" ? "#22c55e" : "var(--muted-foreground)",
                }}>
                  {saveStatus === "saving" ? "Kaydediliyor..." : "Kaydedildi"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Focus mode toggle */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? "Normal mod" : "Odak modu"}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1.5px solid var(--muted)", background: focusMode ? "var(--secondary)" : "var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: focusMode ? "var(--primary)" : "var(--muted-foreground)",
              transition: "all 0.15s",
            }}
          >
            {focusMode ? <Minimize size={14} strokeWidth={2} /> : <Maximize size={14} strokeWidth={2} />}
          </button>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Düzenle" : "Önizleme"}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1.5px solid var(--muted)", background: showPreview ? "var(--secondary)" : "var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: showPreview ? "var(--primary)" : "var(--muted-foreground)",
              transition: "all 0.15s",
            }}
          >
            <Eye size={14} strokeWidth={2} />
          </button>

          <button onClick={performSave} style={{
            background: "none", border: "1.5px solid var(--muted)", borderRadius: 8,
            padding: "6px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, color: "var(--muted-foreground)",
            transition: "all 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
          >
            <Save size={13} strokeWidth={2} />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700 }}>Kaydet</span>
          </button>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Chapter number badge + story title */}
      {!focusMode && (
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800,
            color: "var(--primary)", background: "var(--secondary)",
            padding: "3px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Bölüm {chapterIdx + 1} / {story.chapters.length}
          </span>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>
            {story.title || "Başlıksız"}
          </span>
        </div>
      )}

      {/* Chapter title */}
      <div style={{ padding: `${focusMode ? 24 : 16}px 20px 0`, maxWidth: focusMode ? 640 : undefined, margin: focusMode ? "0 auto" : undefined }}>
        <input
          type="text"
          value={chTitle}
          onChange={(e) => setChTitle(e.target.value)}
          placeholder={`Bölüm ${chapterIdx + 1}`}
          maxLength={100}
          style={{
            width: "100%", border: "none", background: "transparent",
            fontFamily: "'Lora', serif",
            fontSize: focusMode ? 28 : 22,
            fontWeight: 700,
            color: "var(--foreground)", outline: "none",
            transition: "font-size 0.3s",
          }}
        />
      </div>

      {/* Divider */}
      <div style={{ padding: "12px 20px 0", maxWidth: focusMode ? 640 : undefined, margin: focusMode ? "0 auto" : undefined }}>
        <div style={{ height: 1, background: "var(--muted)" }} />
      </div>

      {/* Formatting Toolbar */}
      {!showPreview && (
        <div style={{
          padding: "4px 16px", maxWidth: focusMode ? 640 : undefined, margin: focusMode ? "0 auto" : undefined,
          display: "flex", alignItems: "center", gap: 4,
          borderBottom: "1px solid var(--muted)",
        }}>
          <FormattingToolbar textareaRef={contentRef} onFormat={handleFormat} onInsertImage={handleInsertImage} />
          {imgUploading && (
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Yükleniyor...
            </span>
          )}
          <input ref={imgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            <button
              onClick={handleUndo}
              title="Geri al (Ctrl+Z)"
              disabled={undoStack.current.length === 0}
              style={{
                width: 30, height: 30, borderRadius: 6,
                border: "none", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: undoStack.current.length > 0 ? "pointer" : "default",
                color: undoStack.current.length > 0 ? "var(--muted-foreground)" : "var(--muted)",
              }}
            >
              <Undo2 size={14} strokeWidth={2} />
            </button>
            <button
              onClick={handleRedo}
              title="İleri al (Ctrl+Y)"
              disabled={redoStack.current.length === 0}
              style={{
                width: 30, height: 30, borderRadius: 6,
                border: "none", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: redoStack.current.length > 0 ? "pointer" : "default",
                color: redoStack.current.length > 0 ? "var(--muted-foreground)" : "var(--muted)",
              }}
            >
              <Redo2 size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div style={{
        padding: "16px 20px 0",
        maxWidth: focusMode ? 640 : undefined,
        margin: focusMode ? "0 auto" : undefined,
      }}>
        {showPreview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: "'Lora', serif", fontSize: 16, lineHeight: 1.9,
              color: "var(--foreground)", minHeight: 350,
            }}
            dangerouslySetInnerHTML={{ __html: renderPreview(content) || '<span style="color: var(--muted-foreground); font-style: italic;">Henüz bir şey yazılmadı...</span>' }}
          />
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Hikayeni yazmaya başla..."
            style={{
              width: "100%", border: "none", background: "transparent",
              resize: "none", outline: "none",
              fontFamily: "'Lora', serif",
              fontSize: focusMode ? 18 : 16,
              lineHeight: focusMode ? 2.1 : 1.9,
              color: "var(--foreground)", minHeight: 350,
              textRendering: "optimizeLegibility",
              letterSpacing: focusMode ? "0.01em" : "normal",
              transition: "font-size 0.3s, line-height 0.3s",
            }}
          />
        )}
      </div>

      {/* Chapter Navigation */}
      {(prevChapter || nextChapter) && !focusMode && (
        <div style={{
          padding: "16px 20px 0",
          display: "flex", gap: 8, justifyContent: "center",
        }}>
          {prevChapter && (
            <button
              onClick={() => {
                if (content.length >= 3 || chTitle) performSave();
                onNavigateChapter(prevChapter.id);
              }}
              style={{
                flex: 1, maxWidth: 180,
                background: "var(--card)", border: "1.5px solid var(--muted)", borderRadius: 10,
                padding: "10px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
            >
              <ChevronLeft size={16} strokeWidth={2} />
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Önceki</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevChapter.title}</div>
              </div>
            </button>
          )}
          {nextChapter && (
            <button
              onClick={() => {
                if (content.length >= 3 || chTitle) performSave();
                onNavigateChapter(nextChapter.id);
              }}
              style={{
                flex: 1, maxWidth: 180,
                background: "var(--card)", border: "1.5px solid var(--muted)", borderRadius: 10,
                padding: "10px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6,
                fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
            >
              <div style={{ textAlign: "right", minWidth: 0 }}>
                <div style={{ fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sonraki</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextChapter.title}</div>
              </div>
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Bottom stats bar */}
      <motion.div
        animate={{ opacity: focusMode ? 0.3 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", bottom: 0, zIndex: 40,
          width: "100%", maxWidth: 430,
          background: "color-mix(in srgb, var(--background) 96%, transparent)", backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--muted)", padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
        onMouseEnter={(e) => { if (focusMode) { (e.currentTarget as HTMLElement).style.opacity = "1"; } }}
        onMouseLeave={(e) => { if (focusMode) { (e.currentTarget as HTMLElement).style.opacity = "0.3"; } }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>
            <Hash size={12} strokeWidth={2} /> {wordCount} kelime
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>
            <Clock size={12} strokeWidth={2} /> {readingTime} dk
          </span>
          <span style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600,
            color: charCount > 9500 ? "#EF4444" : "var(--muted)",
          }}>
            {charCount.toLocaleString("tr-TR")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {focusMode && (
            <span style={{
              fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 700,
              color: "var(--primary)", background: "var(--secondary)",
              padding: "2px 6px", borderRadius: 4,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              Odak
            </span>
          )}
          <span style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 700,
            color: "var(--muted)",
          }}>
            Bölüm {chapterIdx + 1}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Root Controller ─────────────────────────────────────────── */

type View =
  | { screen: "list" }
  | { screen: "chapters"; storyId: string }
  | { screen: "editor"; storyId: string; chapterId: string };

export function WriteEditor({ onExit, userId }: { onExit?: () => void; userId?: string | null }) {
  const [view, setView] = useState<View>({ screen: "list" });
  const [stories, setStories] = useState<Story[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Import the write store dynamically based on auth
  const isSupabase = !!userId;

  // Load stories on mount
  useEffect(() => {
    async function load() {
      if (isSupabase) {
        try {
          const { writeService } = await import("@/services/write.service");
          const data = await writeService.loadStories(userId!);
          // Convert WriteStory → local Story format
          setStories(data.map(ws => ({
            id: ws.id,
            title: ws.title,
            description: ws.description,
            genres: ws.genres,
            chapters: ws.chapters,
            coverGradient: ws.coverGradient,
            status: ws.status,
            updatedAt: ws.updatedAt,
          })));
        } catch (err) {
          console.error("Supabase load failed, falling back to local:", err);
          setStories(loadStories());
        }
      } else {
        setStories(loadStories());
      }
      setIsReady(true);
    }
    load();
  }, [isSupabase, userId]);

  const refresh = useCallback(async () => {
    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        const data = await writeService.loadStories(userId!);
        setStories(data.map(ws => ({
          id: ws.id,
          title: ws.title,
          description: ws.description,
          genres: ws.genres,
          chapters: ws.chapters,
          coverGradient: ws.coverGradient,
          status: ws.status,
          updatedAt: ws.updatedAt,
        })));
      } catch {
        setStories(loadStories());
      }
    } else {
      setStories(loadStories());
    }
  }, [isSupabase, userId]);

  const handleCreate = async () => {
    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        const gradient = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];
        const story = await writeService.createStory(userId!, gradient);
        if (story) {
          await refresh();
          setView({ screen: "chapters", storyId: story.id });
          return;
        }
      } catch (err) {
        console.error("Supabase create failed:", err);
      }
    }

    // Local fallback
    const storyId = gid();
    const chId = gid();
    const story: Story = {
      id: storyId,
      title: "", description: "", genres: [],
      chapters: [{ id: chId, title: "Bölüm 1", content: "" }],
      coverGradient: COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)],
      status: "draft",
      updatedAt: Date.now(),
    };
    const all = loadStories();
    all.push(story);
    saveStories(all);
    setStories([...all]);
    setView({ screen: "chapters", storyId });
  };

  const getStory = (id: string) => stories.find((s) => s.id === id) ?? null;

  // Guard: if a deep-link screen references a story that no longer exists,
  // fall back to list. Must live in useEffect — state updates during render are not allowed.
  const editorStory = view.screen === "editor" ? getStory(view.storyId) : undefined;
  const chaptersStory = view.screen === "chapters" ? getStory(view.storyId) : undefined;

  useEffect(() => {
    if (view.screen === "editor" && editorStory === null) {
      setView({ screen: "list" });
    }
  }, [view.screen, editorStory]);

  useEffect(() => {
    if (view.screen === "chapters" && chaptersStory === null) {
      setView({ screen: "list" });
    }
  }, [view.screen, chaptersStory]);

  if (!isReady) {
    return (
      <div style={{ paddingTop: 65, paddingBottom: 80, background: "var(--background)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} color={"var(--primary)"} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (view.screen === "editor") {
    const story = getStory(view.storyId);
    if (!story) return null;
    return (
      <ChapterEditor
        story={story}
        chapterId={view.chapterId}
        isSupabase={isSupabase}
        userId={userId}
        onBack={() => {
          refresh();
          setView({ screen: "chapters", storyId: view.storyId });
        }}
        onNavigateChapter={(chId) => {
          refresh();
          setView({ screen: "editor", storyId: view.storyId, chapterId: chId });
        }}
      />
    );
  }

  if (view.screen === "chapters") {
    const story = getStory(view.storyId);
    if (!story) return null;
    return (
      <ChapterList
        story={story}
        isSupabase={isSupabase}
        userId={userId}
        onBack={() => { refresh(); setView({ screen: "list" }); }}
        onEditChapter={(chId) => setView({ screen: "editor", storyId: view.storyId, chapterId: chId })}
        onUpdateStory={(updated) => {
          setStories((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        }}
      />
    );
  }

  return (
    <StoryList
      onSelect={(s) => setView({ screen: "chapters", storyId: s.id })}
      onCreate={handleCreate}
      onExit={onExit}
      isSupabase={isSupabase}
      userId={userId}
    />
  );
}
