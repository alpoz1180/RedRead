import { useState, useEffect, useCallback } from "react";
import { getAIRecommendations } from "../../lib/gemini";
import { supabase } from "../../lib/supabase";
import type { Story } from "../../types/database";

interface UseAIRecommendationsReturn {
  stories: Story[];
  loading: boolean;
  error: string | null;
  source: string;
  refetch: () => Promise<void>;
}

export function useAIRecommendations(): UseAIRecommendationsReturn {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("none");

  const fetchRecommendations = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      let userGenres: string[] = [];
      try {
        const stored = localStorage.getItem("user_genres");
        if (stored) userGenres = JSON.parse(stored);
      } catch { /* */ }

      const { ids, source: src } = await getAIRecommendations(userGenres, 6);
      if (signal?.cancelled) return;
      setSource(src);

      if (ids.length === 0) {
        const { data } = await supabase
          .from("stories")
          .select("*, author:users!author_id(id, username, display_name, avatar_url)")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(6);
        if (!signal?.cancelled) {
          setStories(data || []);
          setSource("direct");
        }
        return;
      }

      const { data } = await supabase
        .from("stories")
        .select("*, author:users!author_id(id, username, display_name, avatar_url)")
        .in("id", ids);

      if (data && !signal?.cancelled) {
        const sorted = ids
          .map((id) => data.find((s) => s.id === id))
          .filter((s): s is Story => !!s);
        setStories(sorted);
      }
    } catch (err) {
      if (!signal?.cancelled) {
        const msg = err instanceof Error ? err.message : "Öneri hatası";
        setError(msg);
        console.error("AI Recommendations error:", err);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    fetchRecommendations(signal);
    return () => { signal.cancelled = true; };
  }, [fetchRecommendations]);

  const refetch = useCallback(() => fetchRecommendations(), [fetchRecommendations]);

  return { stories, loading, error, source, refetch };
}
