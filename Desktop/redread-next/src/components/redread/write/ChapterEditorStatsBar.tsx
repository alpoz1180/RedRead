"use client";

import React from "react";
import { motion } from "motion/react";
import { Hash, Clock } from "lucide-react";

/* ─── Props ───────────────────────────────────────────────────── */

export interface ChapterEditorStatsBarProps {
  wordCount: number;
  readingTime: number;
  charCount: number;
  chapterIndex: number;
  focusMode: boolean;
}

/* ─── Component ───────────────────────────────────────────────── */

export function ChapterEditorStatsBar({
  wordCount,
  readingTime,
  charCount,
  chapterIndex,
  focusMode,
}: ChapterEditorStatsBarProps) {
  return (
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
          Bölüm {chapterIndex + 1}
        </span>
      </div>
    </motion.div>
  );
}
