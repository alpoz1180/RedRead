import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { MoodEntry } from '../lib/types';

interface UpdateMoodData {
  mood_level?: number;
  mood_emoji?: string;
  activities?: string[];
  note?: string;
}

interface UseUpdateMoodReturn {
  updateMood: (id: string, data: UpdateMoodData) => Promise<MoodEntry | null>;
  deleteMood: (id: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export function useUpdateMood(): UseUpdateMoodReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMood = async (
    id: string,
    data: UpdateMoodData
  ): Promise<MoodEntry | null> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: updatedEntry, error: updateError } = await supabase
        .from('mood_entries')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedEntry;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error updating mood entry:', err);
      }
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMood = async (id: string): Promise<boolean> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error deleting mood entry:', err);
      }
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateMood,
    deleteMood,
    loading,
    error,
  };
}
