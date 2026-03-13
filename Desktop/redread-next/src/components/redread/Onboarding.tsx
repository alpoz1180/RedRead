"use client";

import React, { useState, lazy, Suspense } from "react";
import { AnimatePresence } from "motion/react";
import { OnboardingBackground } from "./onboarding/OnboardingBackground";
import { OnboardingProgressDots } from "./onboarding/OnboardingProgressDots";

// Lazy-load each step so only the active step's bundle is downloaded
const StepWelcome = lazy(() =>
  import("./onboarding/StepWelcome").then((m) => ({ default: m.StepWelcome }))
);
const StepGenreSelect = lazy(() =>
  import("./onboarding/StepGenreSelect").then((m) => ({
    default: m.StepGenreSelect,
  }))
);
const StepAuth = lazy(() =>
  import("./onboarding/StepAuth").then((m) => ({ default: m.StepAuth }))
);

const TOTAL_STEPS = 3;

interface OnboardingProps {
  onComplete: () => void;
}

/**
 * Onboarding shell component.
 * Owns step navigation (1–3) and genre selection state.
 * Each step screen is lazy-loaded; all step-specific state lives inside
 * the corresponding step component.
 */
export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const nextStep = () => {
    // Persist genre selection before advancing past step 2
    if (step === 2 && selectedGenres.length > 0) {
      try {
        localStorage.setItem("user_genres", JSON.stringify(selectedGenres));
      } catch (err) {
        console.error("nextStep: failed to save user_genres to localStorage", err);
      }
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0F0C09",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 24px",
        fontFamily: "'Nunito', sans-serif",
        overflow: "hidden",
      }}
    >
      <OnboardingBackground />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360 }}>
        <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            {step === 1 && <StepWelcome onNext={nextStep} />}
            {step === 2 && (
              <StepGenreSelect
                selectedGenres={selectedGenres}
                onToggleGenre={toggleGenre}
                onNext={nextStep}
              />
            )}
            {step === 3 && <StepAuth onComplete={onComplete} />}
          </AnimatePresence>
        </Suspense>

        <OnboardingProgressDots totalSteps={TOTAL_STEPS} currentStep={step} />
      </div>
    </div>
  );
}
