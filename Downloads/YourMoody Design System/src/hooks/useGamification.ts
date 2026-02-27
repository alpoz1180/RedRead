import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserStats, UserAchievement, Achievement } from '../lib/types';
import { ACHIEVEMENTS, checkUnlockedAchievements, getLevelFromXP } from '../lib/achievements';
import { toast } from 'sonner';

export function useGamification() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Fetch user stats and achievements
  const fetchGamificationData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // Create default stats if not exists
      if (!statsData) {
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({ user_id: user.id, level: 1, xp: 0 })
          .select()
          .single();

        if (createError) throw createError;
        setStats(newStats);
      } else {
        setStats(statsData);
      }

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[fetchGamificationData] Error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add XP and check for level up
  const addXP = useCallback(async (amount: number) => {
    if (!stats) return;

    const newXP = stats.xp + amount;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > stats.level;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_stats')
      .update({ xp: newXP, level: newLevel })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[addXP] Error:', error);
      }
      return;
    }
    
    // Update local state immediately (optimistic update)
    setStats(prev => {
      if (!prev) return data;
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });

    if (leveledUp) {
      toast.success(`🎉 Seviye ${newLevel}! Tebrikler!`, {
        duration: 4000,
      });
    }
  }, [stats]);

  // Update stats (called after mood entry)
  const updateStats = useCallback(async (newStats: Partial<Pick<UserStats, 'total_mood_entries' | 'current_streak' | 'longest_streak'>>) => {
    if (!stats) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_stats')
      .update(newStats)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[updateStats] Error:', error);
      }
      return;
    }
    
    // Update local state immediately (optimistic update)
    setStats(prev => {
      if (!prev) return data;
      return {
        ...prev,
        ...newStats,
      };
    });
    
    // Add XP for completing the mood entry
    await addXP(10); // 10 XP per mood entry
  }, [stats, addXP]);

  // Unlock achievement
  const unlockAchievement = useCallback(async (achievement: Achievement) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already unlocked
    if (achievements.find(a => a.achievement_id === achievement.id)) {
      return;
    }

    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievement.id,
      });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error unlocking achievement:', error);
      }
      return;
    }

    // Add XP reward
    await addXP(achievement.xp_reward);

    // Show unlock animation
    setNewAchievement(achievement);

    // Refresh achievements
    await fetchGamificationData();

  }, [achievements, addXP, fetchGamificationData]);

  // Check and unlock new achievements
  const checkAchievements = useCallback(async () => {
    if (!stats) return [];

    const unlockedIds = achievements.map(a => a.achievement_id);

    const newAchievements = checkUnlockedAchievements(
      {
        total_mood_entries: stats.total_mood_entries,
        current_streak: stats.current_streak,
        longest_streak: stats.longest_streak,
        level: stats.level,
      },
      unlockedIds
    );

    // Unlock each new achievement
    for (const achievement of newAchievements) {
      await unlockAchievement(achievement);
      // Small delay between achievements
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return newAchievements;
  }, [stats, achievements, unlockAchievement]);

  // Get achievement by ID
  const getAchievement = useCallback((id: string) => {
    return ACHIEVEMENTS.find(a => a.id === id);
  }, []);

  // Check if achievement is unlocked
  const isUnlocked = useCallback((id: string) => {
    return achievements.some(a => a.achievement_id === id);
  }, [achievements]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  return {
    stats,
    achievements,
    loading,
    newAchievement,
    setNewAchievement,
    addXP,
    updateStats,
    unlockAchievement,
    checkAchievements,
    getAchievement,
    isUnlocked,
    refetch: fetchGamificationData,
  };
}
