import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storiesService } from '../../services/stories.service';
import type { Story } from '../../types/database';

interface CreateStoryData {
  title: string;
  genres: string[];
  description?: string;
  content: string;
  status: 'draft' | 'published';
}

interface UseCreateStoryReturn {
  createStory: (data: CreateStoryData) => Promise<Story | null>;
  updateStory: (id: string, data: Partial<CreateStoryData>) => Promise<Story | null>;
  loading: boolean;
  error: string | null;
}

export function useCreateStory(): UseCreateStoryReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStory = useCallback(async (data: CreateStoryData): Promise<Story | null> => {
    if (!user) {
      setError('Hikaye oluşturmak için giriş yapmalısınız');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const story = await storiesService.create(user.id, data);
      return story;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hikaye oluşturulamadı';
      setError(errorMessage);
      console.error('Create story error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStory = useCallback(async (
    id: string,
    data: Partial<CreateStoryData>
  ): Promise<Story | null> => {
    if (!user) {
      setError('Hikaye güncellemek için giriş yapmalısınız');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const story = await storiesService.update(user.id, { id, ...data });
      return story;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hikaye güncellenemedi';
      setError(errorMessage);
      console.error('Update story error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createStory,
    updateStory,
    loading,
    error,
  };
}
