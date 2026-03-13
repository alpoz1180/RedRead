// Typography
export const FONTS = {
  SERIF: "var(--font-lora)",
  SANS: "var(--font-nunito)",
} as const;

// Animation Durations
export const ANIMATION = {
  HEART_BURST: 600,
  BOOKMARK_SLIDE: 400,
  SHARE_JUMP: 450,
  FADE: 500,
  SPRING: 300,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  BASE: 0,
  CONTENT: 10,
  ACTIONS: 20,
  OVERLAY: 50,
  MODAL: 100,
  TOAST: 200,
} as const;
