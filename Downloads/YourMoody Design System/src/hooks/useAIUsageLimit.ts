import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from './useSubscription';

interface AIUsageInfo {
  monthlyUsed: number;
  monthlyLimit: number;
  canUse: boolean;
  remaining: number;
}

export function useAIUsageLimit() {
  const { user } = useAuth();
  const { subscription, isMonthly, isYearly, isFree } = useSubscription();
  const [usageInfo, setUsageInfo] = useState<AIUsageInfo>({
    monthlyUsed: 0,
    monthlyLimit: 0,
    canUse: false,
    remaining: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Determine monthly limit based on plan
        const monthlyLimit = isFree ? 0 : isMonthly ? 4 : isYearly ? 8 : 0;

        // Get start of current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        // Count AI insights used this month
        const { data, error } = await supabase
          .from('ai_insight_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('used_at', monthStart.toISOString());

        if (error) throw error;

        const monthlyUsed = data?.length || 0;
        const canUse = monthlyUsed < monthlyLimit;
        const remaining = Math.max(0, monthlyLimit - monthlyUsed);

        setUsageInfo({
          monthlyUsed,
          monthlyLimit,
          canUse,
          remaining,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching AI usage:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user, subscription, isFree, isMonthly, isYearly]);

  return {
    ...usageInfo,
    loading,
  };
}
