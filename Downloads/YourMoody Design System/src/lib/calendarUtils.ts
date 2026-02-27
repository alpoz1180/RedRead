import { MoodEntry } from './types';

// Mood color mapping based on mood level
export const getMoodColor = (moodLevel: number): { bg: string; border: string; text: string } => {
  switch (moodLevel) {
    case 5: // Harika
      return { bg: 'bg-green-500/80', border: 'border-green-500', text: 'text-green-500' };
    case 4: // Mutlu
      return { bg: 'bg-green-400/80', border: 'border-green-400', text: 'text-green-400' };
    case 3: // Sakin
      return { bg: 'bg-blue-400/80', border: 'border-blue-400', text: 'text-blue-400' };
    case 2: // Normal
      return { bg: 'bg-gray-400/80', border: 'border-gray-400', text: 'text-gray-400' };
    case 1: // Üzgün
      return { bg: 'bg-orange-400/80', border: 'border-orange-400', text: 'text-orange-400' };
    case 6: // Sinirli
      return { bg: 'bg-red-500/80', border: 'border-red-500', text: 'text-red-500' };
    default:
      return { bg: 'bg-gray-300/50', border: 'border-gray-300', text: 'text-gray-300' };
  }
};

// Get all days in a month with grid positioning
export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  moodEntry?: MoodEntry;
}

export const getCalendarDays = (year: number, month: number, moodEntries: MoodEntry[]): CalendarDay[] => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Adjust to start week on Monday (0 = Mon, 6 = Sun)
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  // Add previous month's trailing days
  const prevMonthLastDay = new Date(year, month, 0);
  const prevMonthDays = prevMonthLastDay.getDate();
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    days.push({
      date,
      dayOfMonth: prevMonthDays - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    const isToday = date.getTime() === today.getTime();
    
    // Find mood entry for this day
    const moodEntry = moodEntries.find((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    });

    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday,
      moodEntry,
    });
  }

  // Add next month's leading days to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
};

// Month names in Turkish
export const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Day names in Turkish (short)
export const dayNamesShort = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

// Format month and year for display
export const formatMonthYear = (year: number, month: number): string => {
  return `${monthNames[month]} ${year}`;
};

// Get mood label
export const getMoodLabel = (moodLevel: number): string => {
  switch (moodLevel) {
    case 5: return 'Harika';
    case 4: return 'Mutlu';
    case 3: return 'Sakin';
    case 2: return 'Normal';
    case 1: return 'Üzgün';
    case 6: return 'Sinirli';
    default: return 'Bilinmiyor';
  }
};
