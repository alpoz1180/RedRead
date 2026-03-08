// Design System Colors
export const COLORS = {
  BG: {
    DEEP: '#0A0909',
    DARK: '#0B0B0B',
    ELEVATED: '#050404',
  },
  TEXT: {
    PRIMARY: '#E8E6E1',
    MUTED: '#8A8484',
    DIM: '#4a4644',
  },
  ACCENT: {
    PRIMARY: '#E85D7A',
    HOVER: '#A73738',
  },
} as const;

// Typography
export const FONTS = {
  SERIF: "'Lora', serif",
  SANS: "'Inter', sans-serif",
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
