import type { MoodEntry } from './types';

/**
 * Check if a mood entry was created today
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if user has logged mood today
 */
export function hasMoodToday(entries: MoodEntry[]): boolean {
  const today = new Date();
  return entries.some(entry => isSameDay(new Date(entry.created_at), today));
}

/**
 * Get today's mood entry
 */
export function getTodayMood(entries: MoodEntry[]): MoodEntry | null {
  const today = new Date();
  return entries.find(entry => isSameDay(new Date(entry.created_at), today)) || null;
}

/**
 * Calculate streak (consecutive days with mood entries)
 */
export function calculateStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;

  // Sort by date descending
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has entry
  const hasToday = sortedEntries.some(entry => 
    isSameDay(new Date(entry.created_at), currentDate)
  );

  // If no entry today, start from yesterday
  if (!hasToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].created_at);
    entryDate.setHours(0, 0, 0, 0);

    if (isSameDay(entryDate, currentDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate < currentDate) {
      // Gap found, break streak
      break;
    }
  }

  return streak;
}

/**
 * Get mood entries for the last 7 days
 * Returns array of [dayIndex, moodLevel | null]
 */
export function getWeeklyMoods(entries: MoodEntry[]): (number | null)[] {
  const weekMoods: (number | null)[] = new Array(7).fill(null);
  const today = new Date();
  
  // Get Monday of current week
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // Fill in moods for each day
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const dayEntry = entries.find(entry =>
      isSameDay(new Date(entry.created_at), dayDate)
    );

    if (dayEntry) {
      weekMoods[i] = dayEntry.mood_level;
    }
  }

  return weekMoods;
}

/**
 * Get the best day of the week
 */
export function getBestDayOfWeek(entries: MoodEntry[]): string | null {
  if (entries.length === 0) return null;

  const weekDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  const dayScores: Record<number, { total: number; count: number }> = {};

  // Calculate average mood for each day of week
  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Monday = 0

    if (!dayScores[dayIndex]) {
      dayScores[dayIndex] = { total: 0, count: 0 };
    }

    dayScores[dayIndex].total += entry.mood_level;
    dayScores[dayIndex].count += 1;
  });

  // Find day with highest average
  let bestDay = 0;
  let bestAverage = 0;

  Object.entries(dayScores).forEach(([day, scores]) => {
    const average = scores.total / scores.count;
    if (average > bestAverage) {
      bestAverage = average;
      bestDay = parseInt(day);
    }
  });

  return dayScores[bestDay] ? weekDays[bestDay] : null;
}

/**
 * Get the worst day of the week
 */
export function getWorstDayOfWeek(entries: MoodEntry[]): string | null {
  if (entries.length === 0) return null;

  const weekDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  const dayScores: Record<number, { total: number; count: number }> = {};

  // Calculate average mood for each day of week
  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Monday = 0

    if (!dayScores[dayIndex]) {
      dayScores[dayIndex] = { total: 0, count: 0 };
    }

    dayScores[dayIndex].total += entry.mood_level;
    dayScores[dayIndex].count += 1;
  });

  // Find day with lowest average
  let worstDay = 0;
  let worstAverage = Infinity;

  Object.entries(dayScores).forEach(([day, scores]) => {
    const average = scores.total / scores.count;
    if (average < worstAverage) {
      worstAverage = average;
      worstDay = parseInt(day);
    }
  });

  return dayScores[worstDay] ? weekDays[worstDay] : null;
}

/**
 * Calculate average mood level
 */
export function calculateAverageMood(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + entry.mood_level, 0);
  return Math.round((sum / entries.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get most frequent mood emoji
 */
export function getMostFrequentMood(entries: MoodEntry[]): string | null {
  if (entries.length === 0) return null;

  const moodCounts: Record<string, number> = {};
  entries.forEach(entry => {
    moodCounts[entry.mood_emoji] = (moodCounts[entry.mood_emoji] || 0) + 1;
  });

  let mostFrequent = '';
  let maxCount = 0;

  Object.entries(moodCounts).forEach(([emoji, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = emoji;
    }
  });

  return mostFrequent || null;
}

/**
 * Get mood distribution for chart
 */
export function getMoodDistribution(entries: MoodEntry[]): Array<{
  mood: string;
  label: string;
  count: number;
}> {
  const moodLabels: Record<number, { emoji: string; label: string }> = {
    5: { emoji: '😁', label: 'Harika' },
    4: { emoji: '😊', label: 'Mutlu' },
    3: { emoji: '😌', label: 'Sakin' },
    2: { emoji: '😐', label: 'Normal' },
    1: { emoji: '😔', label: 'Üzgün' },
    6: { emoji: '😤', label: 'Sinirli' },
  };

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  entries.forEach(entry => {
    if (entry.mood_level >= 1 && entry.mood_level <= 6) {
      distribution[entry.mood_level]++;
    }
  });

  return Object.entries(distribution)
    .map(([level, count]) => ({
      mood: moodLabels[parseInt(level)].emoji,
      label: moodLabels[parseInt(level)].label,
      count,
    }))
    .reverse(); // Sort from 5 to 1
}

/**
 * Get most frequent activity
 */
export function getMostFrequentActivity(entries: MoodEntry[]): string | null {
  const activityCounts: Record<string, number> = {};

  entries.forEach(entry => {
    if (entry.activities && Array.isArray(entry.activities)) {
      entry.activities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    }
  });

  if (Object.keys(activityCounts).length === 0) return null;

  let mostFrequent = '';
  let maxCount = 0;

  Object.entries(activityCounts).forEach(([activity, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = activity;
    }
  });

  return mostFrequent || null;
}

/**
 * Calculate mood trend (comparing last 2 weeks)
 */
export function calculateMoodTrend(entries: MoodEntry[]): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
} | null {
  if (entries.length < 2) return null;

  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  // Split entries into two weeks
  const lastWeek = entries.filter(entry => {
    const date = new Date(entry.created_at);
    return date >= oneWeekAgo && date <= now;
  });

  const previousWeek = entries.filter(entry => {
    const date = new Date(entry.created_at);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  });

  if (lastWeek.length === 0 || previousWeek.length === 0) return null;

  const lastWeekAvg = calculateAverageMood(lastWeek);
  const previousWeekAvg = calculateAverageMood(previousWeek);

  if (previousWeekAvg === 0) return null;

  const percentageChange = ((lastWeekAvg - previousWeekAvg) / previousWeekAvg) * 100;

  let direction: 'up' | 'down' | 'stable';
  if (percentageChange > 5) {
    direction = 'up';
  } else if (percentageChange < -5) {
    direction = 'down';
  } else {
    direction = 'stable';
  }

  return {
    direction,
    percentage: Math.abs(Math.round(percentageChange)),
  };
}

/**
 * Get weekly chart data
 */
export function getWeeklyChartData(entries: MoodEntry[]): Array<{
  day: string;
  mood: number;
  label: string;
}> {
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const moodLabels: Record<number, string> = {
    5: 'Harika',
    4: 'Mutlu',
    3: 'Sakin',
    2: 'Normal',
    1: 'Üzgün',
    6: 'Sinirli',
  };

  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const chartData = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const dayEntry = entries.find(entry =>
      isSameDay(new Date(entry.created_at), dayDate)
    );

    chartData.push({
      day: weekDays[i],
      mood: dayEntry ? dayEntry.mood_level : null, // null instead of 0 for missing data
      label: dayEntry ? moodLabels[dayEntry.mood_level] : 'Yok',
    });
  }

  return chartData;
}

/**
 * Get monthly chart data (4 weeks average)
 */
export function getMonthlyChartData(entries: MoodEntry[]): Array<{
  week: string;
  avg: number;
}> {
  const now = new Date();
  const chartData = [];

  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 7);

    const weekEntries = entries.filter(entry => {
      const date = new Date(entry.created_at);
      return date >= weekStart && date < weekEnd;
    });

    chartData.push({
      week: `Hafta ${4 - i}`,
      avg: weekEntries.length > 0 ? calculateAverageMood(weekEntries) : null, // null for missing data
    });
  }

  return chartData;
}

/**
 * Get best time of day pattern
 */
export function getBestTimeOfDay(entries: MoodEntry[]): string | null {
  if (entries.length === 0) return null;

  const timeScores: Record<string, { total: number; count: number }> = {
    morning: { total: 0, count: 0 },
    afternoon: { total: 0, count: 0 },
    evening: { total: 0, count: 0 },
  };

  entries.forEach(entry => {
    const hour = new Date(entry.created_at).getHours();
    let timeOfDay: string;

    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'afternoon';
    } else {
      timeOfDay = 'evening';
    }

    timeScores[timeOfDay].total += entry.mood_level;
    timeScores[timeOfDay].count += 1;
  });

  let bestTime = '';
  let bestAverage = 0;

  Object.entries(timeScores).forEach(([time, scores]) => {
    if (scores.count > 0) {
      const average = scores.total / scores.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestTime = time;
      }
    }
  });

  const timeLabels: Record<string, string> = {
    morning: 'Sabah',
    afternoon: 'Öğleden Sonra',
    evening: 'Akşam',
  };

  return bestTime ? timeLabels[bestTime] : null;
}

/**
 * Get activity with highest mood correlation
 */
export function getBestActivity(entries: MoodEntry[]): {
  activity: string;
  avgMood: number;
} | null {
  const activityMoods: Record<string, { total: number; count: number }> = {};

  entries.forEach(entry => {
    if (entry.activities && Array.isArray(entry.activities)) {
      entry.activities.forEach(activity => {
        if (!activityMoods[activity]) {
          activityMoods[activity] = { total: 0, count: 0 };
        }
        activityMoods[activity].total += entry.mood_level;
        activityMoods[activity].count += 1;
      });
    }
  });

  if (Object.keys(activityMoods).length === 0) return null;

  let bestActivity = '';
  let bestAverage = 0;

  Object.entries(activityMoods).forEach(([activity, scores]) => {
    const average = scores.total / scores.count;
    if (average > bestAverage && scores.count >= 2) { // At least 2 occurrences
      bestAverage = average;
      bestActivity = activity;
    }
  });

  return bestActivity ? { activity: bestActivity, avgMood: Math.round(bestAverage * 10) / 10 } : null;
}

/**
 * Get longest streak ever
 */
export function getLongestStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let longestStreak = 0;
  let currentStreak = 1;
  let previousDate = new Date(sortedEntries[0].created_at);
  previousDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i].created_at);
    currentDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      currentStreak++;
    } else if (dayDiff > 1) {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
    // If dayDiff === 0 (same day), keep current streak

    previousDate = currentDate;
  }

  return Math.max(longestStreak, currentStreak);
}

/**
 * Get total unique days with mood entries
 */
export function getTotalUniqueDays(entries: MoodEntry[]): number {
  const uniqueDates = new Set<string>();

  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    uniqueDates.add(dateString);
  });

  return uniqueDates.size;
}

/**
 * Get completion percentage (days with entries in last 30 days)
 */
export function getCompletionPercentage(entries: MoodEntry[]): number {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recentEntries = entries.filter(entry => {
    const date = new Date(entry.created_at);
    return date >= thirtyDaysAgo && date <= now;
  });

  const uniqueDays = getTotalUniqueDays(recentEntries);
  return Math.round((uniqueDays / 30) * 100);
}

/**
 * Get recent mood entries (last N entries)
 */
export function getRecentMoodEntries(
  entries: MoodEntry[],
  limit: number = 5
): Array<{
  date: string;
  emoji: string;
  label: string;
  note: string;
}> {
  const moodLabels: Record<number, string> = {
    5: 'Harika',
    4: 'Mutlu',
    3: 'Sakin',
    2: 'Normal',
    1: 'Üzgün',
    6: 'Sinirli',
  };

  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return sortedEntries.map(entry => {
    const date = new Date(entry.created_at);
    const day = date.getDate();
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const month = monthNames[date.getMonth()];

    return {
      date: `${day} ${month}`,
      emoji: entry.mood_emoji,
      label: moodLabels[entry.mood_level] || 'Bilinmiyor',
      note: entry.note || '',
    };
  });
}

/**
 * Get achievement status based on stats
 */
export function getAchievements(entries: MoodEntry[]): Array<{
  emoji: string;
  title: string;
  desc: string;
  unlocked: boolean;
}> {
  const currentStreak = calculateStreak(entries);
  const longestStreak = getLongestStreak(entries);
  const totalEntries = entries.length;

  return [
    {
      emoji: '🔥',
      title: 'İlk Streak',
      desc: '3 gün üst üste kayıt',
      unlocked: currentStreak >= 3 || longestStreak >= 3,
    },
    {
      emoji: '⭐',
      title: 'Haftalık Yıldız',
      desc: '7 gün üst üste kayıt',
      unlocked: currentStreak >= 7 || longestStreak >= 7,
    },
    {
      emoji: '🏆',
      title: 'Ay Şampiyonu',
      desc: '30 gün üst üste kayıt',
      unlocked: currentStreak >= 30 || longestStreak >= 30,
    },
    {
      emoji: '🎯',
      title: '100 Kayıt',
      desc: 'Toplam 100 mood kaydı',
      unlocked: totalEntries >= 100,
    },
  ];
}
