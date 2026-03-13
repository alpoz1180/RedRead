import { supabase } from "@/lib/supabase";
import { COVER_GRADIENTS } from "@/constants/gradients";

/* ─── Types ───────────────────────────────────────────────────── */

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  genres: string[];
  chapters: Chapter[];
  coverGradient: string;
  coverImage?: string;
  status: "draft" | "published" | "pending" | "rejected";
  updatedAt: number;
}

/* ─── Constants ───────────────────────────────────────────────── */

export const GENRES = [
  "Romantizm", "Gotik", "Dram", "Gizem",
  "Fantastik", "Psikolojik", "Gerilim", "Macera",
  "Bilim Kurgu", "Korku", "Gençlik",
];

/* ─── Helpers ─────────────────────────────────────────────────── */

export function gid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function uploadImage(file: File, bucket: string): Promise<string> {
  // Try Supabase Storage first
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
  } catch (err) { console.error("uploadImage: Supabase storage failed, falling back to base64", err); }
  // Fallback: base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

export function loadStories(): Story[] {
  try {
    const raw = localStorage.getItem("rr_stories");
    if (!raw) {
      const oldRaw = localStorage.getItem("rr_drafts");
      if (oldRaw) {
        const old = JSON.parse(oldRaw) as Array<{
          id: string; title: string; content: string;
          description: string; genres: string[]; updatedAt: number;
        }>;
        const migrated: Story[] = old.map((d) => ({
          id: d.id, title: d.title, description: d.description,
          genres: d.genres, updatedAt: d.updatedAt,
          chapters: d.content
            ? [{ id: gid(), title: "Bölüm 1", content: d.content }]
            : [],
          coverGradient: COVER_GRADIENTS[0],
          status: "draft" as const,
        }));
        saveStories(migrated);
        localStorage.removeItem("rr_drafts");
        return migrated;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    // Migrate old stories that don't have new fields
    return parsed.map((s: Story) => ({
      ...s,
      coverGradient: s.coverGradient || COVER_GRADIENTS[0],
      status: s.status || "draft",
    }));
  } catch (err) { console.error("loadStories: failed to parse localStorage stories", err); return []; }
}

export function saveStories(stories: Story[]) {
  localStorage.setItem("rr_stories", JSON.stringify(stories));
}

export function storyWordCount(s: Story) {
  return s.chapters.reduce((sum, ch) =>
    sum + ch.content.trim().split(/\s+/).filter(Boolean).length, 0
  );
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
