"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { COVER_GRADIENTS } from "@/constants/gradients";
import { Story } from "./types";

/* ─── Props ───────────────────────────────────────────────────── */

export interface ChapterListCoverProps {
  story: Story;
  showCoverPicker: boolean;
  coverUploading: boolean;
  coverFileRef: React.RefObject<HTMLInputElement | null>;
  onTogglePicker: () => void;
  onTitleChange: (title: string) => void;
  onSelectGradient: (gradient: string) => void;
  onCoverFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/* ─── Component ───────────────────────────────────────────────── */

export function ChapterListCover({
  story,
  showCoverPicker,
  coverUploading,
  coverFileRef,
  onTogglePicker,
  onTitleChange,
  onSelectGradient,
  onCoverFileChange,
}: ChapterListCoverProps) {
  return (
    <>
      {/* Cover + Title */}
      <div
        onClick={onTogglePicker}
        style={{
          margin: "16px 16px 0", borderRadius: 16, overflow: "hidden",
          backgroundImage: story.coverImage ? `url(${story.coverImage})` : (story.coverGradient || COVER_GRADIENTS[0]),
          backgroundSize: "cover", backgroundPosition: "center",
          padding: "32px 20px 24px", position: "relative",
          cursor: "pointer", minHeight: 120,
        }}
      >
        {story.coverImage && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />}
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
          value={story.title}
          onChange={(e) => onTitleChange(e.target.value)}
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
        {story.description && (
          <p style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.75)", marginTop: 8, lineHeight: 1.5,
          }}>
            {story.description.slice(0, 80)}{story.description.length > 80 ? "..." : ""}
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
                  onClick={() => onSelectGradient(g)}
                  style={{
                    width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                    background: g, cursor: "pointer",
                    border: (!story.coverImage && story.coverGradient === g) ? "2.5px solid white" : "2.5px solid transparent",
                    boxShadow: (!story.coverImage && story.coverGradient === g) ? `0 0 0 2px var(--primary)` : "0 1px 4px rgba(0,0,0,0.15)",
                    transition: "all 0.15s",
                  }}
                />
              ))}
              <input ref={coverFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onCoverFileChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
