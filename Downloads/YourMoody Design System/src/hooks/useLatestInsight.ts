import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AIInsight {
  id: string;
  user_id: string;
  insight: string;
  created_at: string;
}

interface UseLatestInsightReturn {
  insight: AIInsight | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLatestInsight(): UseLatestInsightReturn {
  const { user } = useAuth();
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLatestInsight = async () => {
    if (!user) {
      setInsight(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      // data is an array, get first element
      setInsight(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching latest insight:', err);
      }
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestInsight();
  }, [user?.id]);

  return {
    insight,
    loading,
    error,
    refetch: fetchLatestInsight,
  };
}
