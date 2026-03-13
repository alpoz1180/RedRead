"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

const TITLE_CHARS = ["R", "e", "d", "r", "e", "a", "d"] as const;

/**
 * Step 1 — Welcome screen.
 * Displays the animated Redread logo, staggered title reveal, tagline, and the
 * primary "Başla" CTA that advances to step 2.
 */
export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.45 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.65, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 76,
          height: 76,
          borderRadius: 22,
          background: "linear-gradient(135deg, #FF6122 0%, #E84010 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Lora', serif",
          fontSize: 38,
          fontWeight: 700,
          color: "white",
          marginBottom: 30,
          boxShadow:
            "0 14px 48px rgba(255,97,34,0.4), 0 0 0 1px rgba(255,97,34,0.25), 0 1px 0 rgba(255,255,255,0.12) inset",
          animation: "floatLogo 4s ease-in-out infinite",
          flexShrink: 0,
        }}
      >
        R
      </motion.div>

      {/* Title — staggered reveal */}
      <h1
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 40,
          fontWeight: 700,
          color: "#F0EDE8",
          marginBottom: 18,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          overflow: "hidden",
        }}
      >
        {TITLE_CHARS.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.28 + i * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "inline-block" }}
          >
            {char}
          </motion.span>
        ))}
      </h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        style={{
          fontFamily: "'Lora', serif",
          fontSize: 15,
          color: "rgba(240,237,232,0.48)",
          fontStyle: "italic",
          lineHeight: 1.75,
          marginBottom: 52,
          maxWidth: 240,
        }}
      >
        Seveceğin hikayeler seni bekliyor.
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.88 }}
        onClick={onNext}
        style={{
          width: "100%",
          padding: "15px 24px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #FF6122 0%, #E84010 100%)",
          color: "white",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow:
            "0 8px 28px rgba(255,97,34,0.38), 0 1px 0 rgba(255,255,255,0.12) inset",
          letterSpacing: "0.01em",
        }}
      >
        Başla
        <ChevronRight size={18} strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
}
