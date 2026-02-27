import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useMoodEntries } from './useMoodEntries';
import { hasMoodToday } from '../lib/moodUtils';

interface UseDailyMoodLimitReturn {
  canAddMood: boolean;
  dailyLimit: number | null; // null = unlimited
  todayCount: number;
  remaining: number | null; // null = unlimited
  loading: boolean;
}

export function useDailyMoodLimit(): UseDailyMoodLimitReturn {
  const { subscription, loading: subLoading, isFree } = useSubscription();
  const { entries, loading: entriesLoading } = useMoodEntries();
  const [todayCount, setTodayCount] = useState(0);

  // Count today's mood entries
  useEffect(() => {
    if (!entries) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    setTodayCount(todayEntries.length);
  }, [entries]);

  // Determine daily limit based on plan
  const dailyLimit = isFree ? 1 : null; // Free: 1 per day, Premium: unlimited

  // Calculate if user can add mood
  const canAddMood = dailyLimit === null || todayCount < dailyLimit;

  // Calculate remaining
  const remaining = dailyLimit === null ? null : Math.max(0, dailyLimit - todayCount);

  return {
    canAddMood,
    dailyLimit,
    todayCount,
    remaining,
    loading: subLoading || entriesLoading,
  };
}
