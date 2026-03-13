"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { writeService, type WriteStory, type WriteChapter } from "@/services/write.service";
import { COVER_GRADIENTS } from "@/constants/gradients";

function randomGradient() {
  return COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];
}

function gid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ─── localStorage fallback ───────────────────────────────────── */

function loadLocal(): WriteStory[] {
  try {
    const raw = localStorage.getItem("rr_stories");
    if (!raw) return [];
    return JSON.parse(raw).map((s: WriteStory) => ({
      ...s,
      coverGradient: s.coverGradient || COVER_GRADIENTS[0],
      status: s.status || "draft",
    }));
  } catch {
    return [];
  }
}

function saveLocal(stories: WriteStory[]) {
  localStorage.setItem("rr_stories", JSON.stringify(stories));
}

/* ─── Hook ────────────────────────────────────────────────────── */

export function useWriteStore(userId: string | null) {
  const [stories, setStories] = useState<WriteStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [metaSaveError, setMetaSaveError] = useState(false);
  const isSupabase = !!userId;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load stories ──
  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabase) {
        const result = await writeService.loadStories(userId!);
        setStories(result.data);
      } else {
        setStories(loadLocal());
      }
    } catch (err) {
      console.error("loadStories error:", err);
      // Fallback to local
      setStories(loadLocal());
    }
    setLoading(false);
  }, [isSupabase, userId]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Cleanup: pending debounce timer'ı hook unmount olduğunda temizle
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ── Create story ──
  const createStory = useCallback(async (): Promise<WriteStory | null> => {
    const gradient = randomGradient();

    if (isSupabase) {
      setSyncing(true);
      try {
        const story = await writeService.createStory(userId!, gradient);
        if (story) {
          setStories(prev => [story, ...prev]);
          return story;
        }
        return null;
      } finally {
        setSyncing(false);
      }
    }

    // Local
    const storyId = gid();
    const chId = gid();
    const story: WriteStory = {
      id: storyId,
      title: "",
      description: "",
      genres: [],
      chapters: [{ id: chId, title: "Bölüm 1", content: "" }],
      coverGradient: gradient,
      status: "draft",
      updatedAt: Date.now(),
    };
    setStories(prev => {
      const next = [story, ...prev];
      saveLocal(next);
      return next;
    });
    return story;
  }, [isSupabase, userId]);

  // ── Delete story ──
  const deleteStory = useCallback(async (storyId: string) => {
    if (isSupabase) {
      setSyncing(true);
      try {
        await writeService.deleteStory(storyId, userId!);
      } finally {
        setSyncing(false);
      }
    }
    setStories(prev => {
      const next = prev.filter(s => s.id !== storyId);
      if (!isSupabase) saveLocal(next);
      return next;
    });
  }, [isSupabase]);

  // ── Update story meta ──
  const updateStoryMeta = useCallback(async (
    storyId: string,
    updates: Partial<Pick<WriteStory, "title" | "description" | "genres" | "status" | "coverGradient">>
  ) => {
    // Optimistic local update
    setStories(prev => {
      const next = prev.map(s => {
        if (s.id !== storyId) return s;
        return { ...s, ...updates, updatedAt: Date.now() };
      });
      if (!isSupabase) saveLocal(next);
      return next;
    });

    if (isSupabase) {
      // Debounced Supabase save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!userId) return;
        const ok = await writeService.updateStoryMeta(storyId, userId, updates);
        if (!ok) setMetaSaveError(true);
      }, 800);
    }
  }, [isSupabase, userId]);

  // ── Add chapter ──
  const addChapter = useCallback(async (storyId: string): Promise<WriteChapter | null> => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return null;

    const sortOrder = story.chapters.length;

    if (isSupabase) {
      setSyncing(true);
      try {
        const ch = await writeService.addChapter(storyId, userId!, sortOrder);
        if (ch) {
          setStories(prev => prev.map(s => {
            if (s.id !== storyId) return s;
            return { ...s, chapters: [...s.chapters, ch], updatedAt: Date.now() };
          }));
          return ch;
        }
        return null;
      } finally {
        setSyncing(false);
      }
    }

    // Local
    const ch: WriteChapter = {
      id: gid(),
      title: `Bölüm ${sortOrder + 1}`,
      content: "",
    };
    setStories(prev => {
      const next = prev.map(s => {
        if (s.id !== storyId) return s;
        return { ...s, chapters: [...s.chapters, ch], updatedAt: Date.now() };
      });
      saveLocal(next);
      return next;
    });
    return ch;
  }, [stories, isSupabase]);

  // ── Delete chapter ──
  const deleteChapter = useCallback(async (storyId: string, chapterId: string) => {
    if (isSupabase) {
      setSyncing(true);
      try {
        await writeService.deleteChapter(chapterId, storyId, userId!);
      } finally {
        setSyncing(false);
      }
    }
    setStories(prev => {
      const next = prev.map(s => {
        if (s.id !== storyId) return s;
        return { ...s, chapters: s.chapters.filter(c => c.id !== chapterId), updatedAt: Date.now() };
      });
      if (!isSupabase) saveLocal(next);
      return next;
    });
  }, [isSupabase, userId]);

  // ── Update chapter ──
  const updateChapter = useCallback(async (
    storyId: string,
    chapterId: string,
    updates: { title?: string; content?: string }
  ) => {
    // Optimistic local update
    setStories(prev => {
      const next = prev.map(s => {
        if (s.id !== storyId) return s;
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return { ...c, ...updates };
          }),
          updatedAt: Date.now(),
        };
      });
      if (!isSupabase) saveLocal(next);
      return next;
    });

    if (isSupabase) {
      // Debounced Supabase save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!userId) return;
        setSyncing(true);
        try {
          await writeService.updateChapter(chapterId, storyId, userId, updates);
          await writeService.updateStoryWordCount(storyId, userId);
        } finally {
          setSyncing(false);
        }
      }, 1500);
    }
  }, [isSupabase, userId]);

  // ── Flush pending saves ──
  const flush = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  // ── Submit for review ──
  const submitForReview = useCallback(async (storyId: string): Promise<boolean> => {
    if (!isSupabase) return false;
    setSyncing(true);
    try {
      const ok = await writeService.submitForReview(storyId, userId!);
      if (ok) {
        setStories(prev => prev.map(s =>
          s.id === storyId ? { ...s, status: 'pending' as const, updatedAt: Date.now() } : s
        ));
      }
      return ok;
    } finally {
      setSyncing(false);
    }
  }, [isSupabase, userId]);

  // ── Get single story by ID ──
  const getStory = useCallback((storyId: string): WriteStory | null => {
    return stories.find(s => s.id === storyId) ?? null;
  }, [stories]);

  return {
    stories,
    loading,
    syncing,
    metaSaveError,
    isSupabase,
    loadStories,
    createStory,
    deleteStory,
    updateStoryMeta,
    addChapter,
    deleteChapter,
    updateChapter,
    getStory,
    flush,
    submitForReview,
    COVER_GRADIENTS,
  };
}
