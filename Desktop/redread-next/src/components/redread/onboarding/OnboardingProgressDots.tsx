"use client";

import React from "react";

interface OnboardingProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

/**
 * Pill-shaped progress dots shown at the bottom of every onboarding screen.
 * The active dot expands horizontally and glows orange.
 */
export function OnboardingProgressDots({
  totalSteps,
  currentStep,
}: OnboardingProgressDotsProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 44,
      }}
    >
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
        <div
          key={i}
          style={{
            width: i === currentStep ? 26 : 8,
            height: 8,
            borderRadius: 999,
            background:
              i === currentStep
                ? "linear-gradient(90deg, #FF6122, #E84010)"
                : "rgba(240,237,232,0.14)",
            transition: "all 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow:
              i === currentStep ? "0 0 10px rgba(255,97,34,0.45)" : "none",
          }}
        />
      ))}
    </div>
  );
}
