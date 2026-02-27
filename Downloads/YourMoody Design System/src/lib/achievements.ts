import type { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'first_streak',
    emoji: '🔥',
    title: 'İlk Streak',
    description: '3 gün üst üste kayıt yap',
    requirement: 3,
    type: 'streak',
    xp_reward: 50,
  },
  {
    id: 'week_warrior',
    emoji: '⭐',
    title: 'Haftalık Yıldız',
    description: '7 gün üst üste kayıt yap',
    requirement: 7,
    type: 'streak',
    xp_reward: 100,
  },
  {
    id: 'two_weeks',
    emoji: '💎',
    title: '14 Gün Şampiyonu',
    description: '14 gün üst üste kayıt yap',
    requirement: 14,
    type: 'streak',
    xp_reward: 200,
  },
  {
    id: 'month_master',
    emoji: '🏆',
    title: 'Ay Şampiyonu',
    description: '30 gün üst üste kayıt yap',
    requirement: 30,
    type: 'streak',
    xp_reward: 500,
  },
  {
    id: 'legendary_streak',
    emoji: '👑',
    title: 'Efsanevi Streak',
    description: '100 gün üst üste kayıt yap',
    requirement: 100,
    type: 'streak',
    xp_reward: 2000,
  },

  // Entry Count Achievements
  {
    id: 'first_entry',
    emoji: '🎯',
    title: 'İlk Adım',
    description: 'İlk mood kaydını yap',
    requirement: 1,
    type: 'entries',
    xp_reward: 10,
  },
  {
    id: 'ten_entries',
    emoji: '📝',
    title: 'On Kayıt',
    description: 'Toplam 10 mood kaydı yap',
    requirement: 10,
    type: 'entries',
    xp_reward: 50,
  },
  {
    id: 'fifty_entries',
    emoji: '📊',
    title: '50 Kayıt',
    description: 'Toplam 50 mood kaydı yap',
    requirement: 50,
    type: 'entries',
    xp_reward: 150,
  },
  {
    id: 'hundred_entries',
    emoji: '💯',
    title: '100 Kayıt',
    description: 'Toplam 100 mood kaydı yap',
    requirement: 100,
    type: 'entries',
    xp_reward: 300,
  },
  {
    id: 'five_hundred_entries',
    emoji: '🌟',
    title: '500 Kayıt',
    description: 'Toplam 500 mood kaydı yap',
    requirement: 500,
    type: 'entries',
    xp_reward: 1000,
  },

  // Level Achievements
  {
    id: 'level_5',
    emoji: '🥉',
    title: 'Bronz Seviye',
    description: 'Seviye 5\'e ulaş',
    requirement: 5,
    type: 'level',
    xp_reward: 100,
  },
  {
    id: 'level_10',
    emoji: '🥈',
    title: 'Gümüş Seviye',
    description: 'Seviye 10\'a ulaş',
    requirement: 10,
    type: 'level',
    xp_reward: 200,
  },
  {
    id: 'level_25',
    emoji: '🥇',
    title: 'Altın Seviye',
    description: 'Seviye 25\'e ulaş',
    requirement: 25,
    type: 'level',
    xp_reward: 500,
  },
];

// XP needed for each level (exponential growth)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate level from XP
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP <= xp) {
    totalXP += getXPForLevel(level);
    if (totalXP <= xp) {
      level++;
    }
  }
  
  return level;
}

// Get XP progress for current level
export function getXPProgress(xp: number, level: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const xpForThisLevel = getXPForLevel(level);
  let totalXPForPreviousLevels = 0;
  
  for (let i = 1; i < level; i++) {
    totalXPForPreviousLevels += getXPForLevel(i);
  }
  
  const currentLevelXP = xp - totalXPForPreviousLevels;
  const percentage = Math.min((currentLevelXP / xpForThisLevel) * 100, 100);
  
  return {
    current: Math.max(0, currentLevelXP),
    needed: xpForThisLevel,
    percentage: Math.max(0, Math.min(100, percentage)),
  };
}

// Check which achievements should be unlocked
export function checkUnlockedAchievements(
  stats: { total_mood_entries: number; current_streak: number; longest_streak: number; level: number },
  currentAchievements: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (currentAchievements.includes(achievement.id)) return;

    let shouldUnlock = false;

    switch (achievement.type) {
      case 'streak':
        shouldUnlock = stats.current_streak >= achievement.requirement || stats.longest_streak >= achievement.requirement;
        break;
      case 'entries':
        shouldUnlock = stats.total_mood_entries >= achievement.requirement;
        break;
      case 'level':
        shouldUnlock = stats.level >= achievement.requirement;
        break;
    }

    if (shouldUnlock) {
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
}
