"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { GENRES } from "@/constants/genres";

interface StepGenreSelectProps {
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  onNext: () => void;
}

/**
 * Step 2 — Genre selection screen.
 * Renders a wrap grid of genre pills; each pill toggles independently.
 * "Devam Et" is disabled until at least one genre is selected.
 */
export function StepGenreSelect({
  selectedGenres,
  onToggleGenre,
  onNext,
}: StepGenreSelectProps) {
  const hasSelection = selectedGenres.length > 0;

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#F0EDE8",
          marginBottom: 10,
          letterSpacing: "-0.01em",
          fontStyle: "italic",
        }}
      >
        Ruhunu ne besler?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 11,
          color: "rgba(240,237,232,0.38)",
          marginBottom: 32,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        En az bir tür seç
      </motion.p>

      {/* Genre pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginBottom: 40,
        }}
      >
        {GENRES.map((g, i) => {
          const isSelected = selectedGenres.includes(g.name);
          return (
            <motion.button
              key={g.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.04 }}
              onClick={() => onToggleGenre(g.name)}
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                border: `1.5px solid ${
                  isSelected ? g.color : "rgba(240,237,232,0.14)"
                }`,
                background: isSelected
                  ? `${g.color}20`
                  : "rgba(240,237,232,0.04)",
                color: isSelected ? g.color : "rgba(240,237,232,0.62)",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transform: isSelected ? "scale(1.04)" : "scale(1)",
                boxShadow: isSelected ? `0 0 14px ${g.color}30` : "none",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: g.color,
                  flexShrink: 0,
                  opacity: isSelected ? 1 : 0.35,
                  transition: "opacity 0.2s",
                }}
              />
              {g.name}
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={onNext}
        disabled={!hasSelection}
        style={{
          width: "100%",
          padding: "15px 24px",
          borderRadius: 14,
          border: "none",
          background: hasSelection
            ? "linear-gradient(135deg, #FF6122, #E84010)"
            : "rgba(240,237,232,0.07)",
          color: hasSelection ? "white" : "rgba(240,237,232,0.25)",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          cursor: hasSelection ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.28s",
          boxShadow: hasSelection ? "0 8px 28px rgba(255,97,34,0.38)" : "none",
        }}
      >
        Devam Et
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
