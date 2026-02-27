import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { MoodEntry } from '../lib/types';

interface UseMoodEntriesReturn {
  entries: MoodEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMoodEntries(limit?: number): UseMoodEntriesReturn {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching mood entries:', err);
      }
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user?.id]);

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
  };
}
