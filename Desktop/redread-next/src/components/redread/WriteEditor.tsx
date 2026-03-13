"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { COVER_GRADIENTS } from "@/constants/gradients";
import { logger } from "@/lib/logger";
import { Story, gid, loadStories, saveStories } from "./write/types";
import { StoryList } from "./write/StoryList";
import { ChapterList } from "./write/ChapterList";
import { ChapterEditor } from "./write/ChapterEditor";

/* ─── Types ───────────────────────────────────────────────────── */

type View =
  | { screen: "list" }
  | { screen: "chapters"; storyId: string }
  | { screen: "editor"; storyId: string; chapterId: string };

/* ─── Root Controller ─────────────────────────────────────────── */

export function WriteEditor({ onExit, userId }: { onExit?: () => void; userId?: string | null }) {
  const [view, setView] = useState<View>({ screen: "list" });
  const [stories, setStories] = useState<Story[]>([]);
  const [isReady, setIsReady] = useState(false);

  const isSupabase = !!userId;

  // Load stories on mount
  useEffect(() => {
    async function load() {
      if (isSupabase) {
        try {
          const { writeService } = await import("@/services/write.service");
          const result = await writeService.loadStories(userId!);
          setStories(result.data.map(ws => ({
            id: ws.id,
            title: ws.title,
            description: ws.description,
            genres: ws.genres,
            chapters: ws.chapters,
            coverGradient: ws.coverGradient,
            status: ws.status,
            updatedAt: ws.updatedAt,
          })));
        } catch (err) {
          console.error("Supabase load failed, falling back to local:", err);
          setStories(loadStories());
        }
      } else {
        setStories(loadStories());
      }
      setIsReady(true);
    }
    load();
  }, [isSupabase, userId]);

  const refresh = useCallback(async () => {
    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        const result = await writeService.loadStories(userId!);
        setStories(result.data.map(ws => ({
          id: ws.id,
          title: ws.title,
          description: ws.description,
          genres: ws.genres,
          chapters: ws.chapters,
          coverGradient: ws.coverGradient,
          status: ws.status,
          updatedAt: ws.updatedAt,
        })));
      } catch (err) {
        logger.error("refresh: Supabase load failed, falling back to local", err);
        setStories(loadStories());
      }
    } else {
      setStories(loadStories());
    }
  }, [isSupabase, userId]);

  const handleCreate = async () => {
    if (isSupabase) {
      try {
        const { writeService } = await import("@/services/write.service");
        const gradient = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];
        const story = await writeService.createStory(userId!, gradient);
        if (story) {
          await refresh();
          setView({ screen: "chapters", storyId: story.id });
          return;
        }
      } catch (err) {
        console.error("Supabase create failed:", err);
      }
    }

    // Local fallback
    const storyId = gid();
    const chId = gid();
    const story: Story = {
      id: storyId,
      title: "", description: "", genres: [],
      chapters: [{ id: chId, title: "Bölüm 1", content: "" }],
      coverGradient: COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)],
      status: "draft",
      updatedAt: Date.now(),
    };
    const all = loadStories();
    all.push(story);
    saveStories(all);
    setStories([...all]);
    setView({ screen: "chapters", storyId });
  };

  const getStory = (id: string) => stories.find((s) => s.id === id) ?? null;

  // Guard: if a deep-link screen references a story that no longer exists,
  // fall back to list. Must live in useEffect — state updates during render are not allowed.
  const editorStory = view.screen === "editor" ? getStory(view.storyId) : undefined;
  const chaptersStory = view.screen === "chapters" ? getStory(view.storyId) : undefined;

  useEffect(() => {
    if (view.screen === "editor" && editorStory === null) {
      setView({ screen: "list" });
    }
  }, [view.screen, editorStory]);

  useEffect(() => {
    if (view.screen === "chapters" && chaptersStory === null) {
      setView({ screen: "list" });
    }
  }, [view.screen, chaptersStory]);

  if (!isReady) {
    return (
      <div style={{ paddingTop: 65, paddingBottom: 80, background: "var(--background)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} color={"var(--primary)"} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (view.screen === "editor") {
    const story = getStory(view.storyId);
    if (!story) return null;
    return (
      <ChapterEditor
        story={story}
        chapterId={view.chapterId}
        isSupabase={isSupabase}
        userId={userId}
        onBack={() => {
          refresh();
          setView({ screen: "chapters", storyId: view.storyId });
        }}
        onNavigateChapter={(chId) => {
          refresh();
          setView({ screen: "editor", storyId: view.storyId, chapterId: chId });
        }}
      />
    );
  }

  if (view.screen === "chapters") {
    const story = getStory(view.storyId);
    if (!story) return null;
    return (
      <ChapterList
        story={story}
        isSupabase={isSupabase}
        userId={userId}
        onBack={() => { refresh(); setView({ screen: "list" }); }}
        onEditChapter={(chId) => setView({ screen: "editor", storyId: view.storyId, chapterId: chId })}
        onUpdateStory={(updated) => {
          setStories((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        }}
      />
    );
  }

  return (
    <StoryList
      onSelect={(s) => setView({ screen: "chapters", storyId: s.id })}
      onCreate={handleCreate}
      onExit={onExit}
      isSupabase={isSupabase}
      userId={userId}
    />
  );
}
