"use client";

import React from "react";

/**
 * Purely decorative background layer for the onboarding screens.
 * Renders: grain texture overlay, warm radial glow, floating "R" letter,
 * and the shared keyframe animation definitions.
 */
export function OnboardingBackground() {
  return (
    <>
      {/* Grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Radial warm glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 38%, rgba(255,97,34,0.13) 0%, rgba(180,60,20,0.05) 40%, transparent 68%)",
        }}
      />

      {/* Decorative large R in background */}
      <div
        style={{
          position: "absolute",
          fontFamily: "'Lora', serif",
          fontSize: "clamp(200px, 48vw, 340px)",
          fontWeight: 700,
          color: "rgba(255,97,34,0.035)",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          animation: "floatBgR 7s ease-in-out infinite",
        }}
      >
        R
      </div>

      <style>{`
        @keyframes floatBgR {
          0%, 100% { transform: translate(-50%, -52%) translateY(0px); }
          50% { transform: translate(-50%, -52%) translateY(-18px); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(0.5deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
