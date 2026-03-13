"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Check, Loader2,
  Save, Eye, Maximize, Minimize,
  ChevronLeft, ChevronRight,
  Undo2, Redo2,
} from "lucide-react";
import { Story, loadStories, saveStories, uploadImage } from "./types";
import { WriteEditorToolbar } from "./WriteEditorToolbar";
import { renderPreview } from "./markdownPreview";
import { ChapterEditorStatsBar } from "./ChapterEditorStatsBar";

/* ─── Props ───────────────────────────────────────────────────── */

export interface ChapterEditorProps {
  story: Story;
  chapterId: string;
  onBack: () => void;
  onNavigateChapter: (chapterId: string) => void;
  isSupabase?: boolean;
  userId?: string | null;
}

/* ─── Component ───────────────────────────────────────────────── */

export function ChapterEditor({
  story, chapterId, onBack, onNavigateChapter, isSupabase, userId,
}: ChapterEditorProps) {
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

  // Auto-expand textarea
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
  }, [story.id, chapterId, chTitle, content, isSupabase, userId]);

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
          <WriteEditorToolbar textareaRef={contentRef} onFormat={handleFormat} onInsertImage={handleInsertImage} />
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

      <ChapterEditorStatsBar
        wordCount={wordCount}
        readingTime={readingTime}
        charCount={charCount}
        chapterIndex={chapterIdx}
        focusMode={focusMode}
      />
    </motion.div>
  );
}
