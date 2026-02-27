import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOfflineSync } from './useOfflineSync';
import { toast } from 'sonner';
import type { MoodEntry } from '../lib/types';

interface CreateMoodData {
  mood_level: number;
  mood_emoji: string;
  activities?: string[];
  note?: string;
}

interface UseCreateMoodReturn {
  createMood: (data: CreateMoodData) => Promise<MoodEntry | null>;
  loading: boolean;
  error: Error | null;
}

export function useCreateMood(): UseCreateMoodReturn {
  const { user } = useAuth();
  const { isOnline, saveOffline } = useOfflineSync();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMood = async (data: CreateMoodData): Promise<MoodEntry | null> => {
    if (!user) {
      const authError = new Error('User not authenticated');
      if (import.meta.env.DEV) {
        console.error('Error creating mood entry:', authError);
      }
      setError(authError);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to insert to Supabase if online
      if (isOnline) {
        const { data: newEntry, error: insertError } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            mood_level: data.mood_level,
            mood_emoji: data.mood_emoji,
            activities: data.activities || null,
            note: data.note || null,
          })
          .select()
          .single();

        if (insertError) {
          // Network error or server error - save offline
          if (import.meta.env.DEV) {
            console.warn('Supabase insert failed, saving offline:', insertError);
          }
          throw insertError;
        }
        
        return newEntry;
      } else {
        // Offline - save locally
        throw new Error('Offline mode');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error creating mood entry, saving offline:', err);
      }
      
      // Save to offline storage
      try {
        const offlineEntry = await saveOffline({
          mood_level: data.mood_level,
          mood_emoji: data.mood_emoji,
          activities: data.activities || null,
          note: data.note || null,
          created_at: new Date().toISOString(),
        });

        toast.warning('Offline kaydedildi 📴', {
          description: 'İnternet bağlantısı gelince senkronize edilecek',
        });

        // Return a mock entry for UI purposes
        return {
          id: offlineEntry.id,
          user_id: user.id,
          mood_level: data.mood_level,
          mood_emoji: data.mood_emoji,
          activities: data.activities || null,
          note: data.note || null,
          created_at: offlineEntry.created_at,
        } as MoodEntry;
      } catch (offlineError) {
        if (import.meta.env.DEV) {
          console.error('Failed to save offline:', offlineError);
        }
        setError(offlineError as Error);
        toast.error('Kayıt başarısız', {
          description: 'Lütfen tekrar deneyin',
        });
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    createMood,
    loading,
    error,
  };
}
