import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AIInsightResponse {
  insight: string;
  success: boolean;
  error?: string;
}

export function useAIInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      // Call edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insight`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('AI içgörüsü alınamadı. Lütfen tekrar deneyin.');
      }

      const data: AIInsightResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      // Track AI insight usage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_insight_usage').insert({
          user_id: user.id,
          used_at: new Date().toISOString(),
        });
      }

      setInsight(data.insight);
      return data.insight;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('AI Insight error:', err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearInsight = () => {
    setInsight(null);
    setError(null);
  };

  return {
    insight,
    loading,
    error,
    generateInsight,
    clearInsight,
  };
}
