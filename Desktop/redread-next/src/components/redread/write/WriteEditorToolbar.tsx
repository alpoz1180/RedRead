"use client";

import React from "react";
import {
  Bold, Italic, Heading1, Quote, List, ListOrdered,
  Minus, Upload,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────── */

export interface ToolbarAction {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

export interface WriteEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onFormat: (newContent: string, cursorPos: number) => void;
  onInsertImage?: () => void;
}

/* ─── Constants ───────────────────────────────────────────────── */

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Kalın", prefix: "**", suffix: "**" },
  { icon: Italic, label: "İtalik", prefix: "_", suffix: "_" },
  { icon: Heading1, label: "Başlık", prefix: "\n## ", suffix: "\n", block: true },
  { icon: Quote, label: "Alıntı", prefix: "\n> ", suffix: "\n", block: true },
  { icon: List, label: "Liste", prefix: "\n- ", suffix: "\n", block: true },
  { icon: ListOrdered, label: "Num. Liste", prefix: "\n1. ", suffix: "\n", block: true },
  { icon: Minus, label: "Ayırıcı", prefix: "\n---\n", suffix: "", block: true },
];

/* ─── Component ───────────────────────────────────────────────── */

export function WriteEditorToolbar({ textareaRef, onFormat, onInsertImage }: WriteEditorToolbarProps) {
  const applyFormat = (action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.slice(start, end);

    let newText: string;
    let newCursor: number;

    if (action.block) {
      newText = text.slice(0, start) + action.prefix + selected + action.suffix + text.slice(end);
      newCursor = start + action.prefix.length + selected.length;
    } else {
      if (selected) {
        newText = text.slice(0, start) + action.prefix + selected + action.suffix + text.slice(end);
        newCursor = start + action.prefix.length + selected.length + action.suffix.length;
      } else {
        newText = text.slice(0, start) + action.prefix + action.suffix + text.slice(end);
        newCursor = start + action.prefix.length;
      }
    }

    onFormat(newText, newCursor);
  };

  return (
    <div style={{
      display: "flex", gap: 2, padding: "6px 4px",
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      {TOOLBAR_ACTIONS.map((action) => (
        <button
          key={action.label}
          title={action.label}
          onMouseDown={(e) => { e.preventDefault(); applyFormat(action); }}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: "none", background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--muted-foreground)",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--secondary)";
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          <action.icon size={16} strokeWidth={2} />
        </button>
      ))}
      {onInsertImage && (
        <button
          title="Fotoğraf ekle"
          onMouseDown={(e) => { e.preventDefault(); onInsertImage(); }}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: "none", background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--muted-foreground)",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--secondary)";
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          <Upload size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
