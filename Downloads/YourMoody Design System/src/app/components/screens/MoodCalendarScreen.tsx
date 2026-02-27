import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MoodyCard } from "../MoodyCard";
import { Modal } from "../Modal";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Loader2, Sparkles } from "lucide-react";
import { useMoodEntries } from "../../../hooks/useMoodEntries";
import { MoodEntry } from "../../../lib/types";
import {
  getCalendarDays,
  getMoodColor,
  formatMonthYear,
  dayNamesShort,
  getMoodLabel,
  CalendarDay,
} from "../../../lib/calendarUtils";

export function MoodCalendarScreen() {
  const navigate = useNavigate();
  const { entries, loading } = useMoodEntries();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentYear, currentMonth, entries);
  }, [currentYear, currentMonth, entries]);

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    if (day.isCurrentMonth && day.moodEntry) {
      setSelectedDay(day);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-8 w-8 text-coral mb-4" />
          <p className="text-muted-foreground">Takvim yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl hover:bg-secondary/80 text-foreground transition-all hover:scale-105"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-coral" />
            <h2 className="text-foreground">Mood Takvimi</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-secondary text-foreground transition-colors"
          >
            <ChevronLeft size={24} />
          </motion.button>
          
          <h3 className="text-xl font-bold text-foreground">
            {formatMonthYear(currentYear, currentMonth)}
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-secondary text-foreground transition-colors"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>

        {/* Calendar */}
        <MoodyCard className="mb-4" padding="lg">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayNamesShort.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const moodColor = day.moodEntry ? getMoodColor(day.moodEntry.mood_level) : null;
              const hasEntry = day.isCurrentMonth && day.moodEntry;
              const isClickable = hasEntry;

              return (
                <motion.button
                  key={index}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => handleDayClick(day)}
                  disabled={!isClickable}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center text-sm relative
                    transition-all
                    ${!day.isCurrentMonth ? 'text-muted-foreground/30' : ''}
                    ${day.isCurrentMonth && !hasEntry ? 'text-muted-foreground/50 bg-secondary/20' : ''}
                    ${hasEntry ? 'cursor-pointer' : 'cursor-default'}
                    ${day.isToday ? 'ring-2 ring-coral ring-offset-2 ring-offset-background' : ''}
                  `}
                >
                  {/* Mood indicator circle */}
                  {hasEntry && moodColor ? (
                    <div className={`
                      absolute inset-0 rounded-xl ${moodColor.bg}
                      flex items-center justify-center font-semibold
                    `}>
                      <span className="text-white text-sm">{day.dayOfMonth}</span>
                    </div>
                  ) : (
                    <span>{day.dayOfMonth}</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 text-center font-semibold">
              Mood Renkleri
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500/80" />
                <span className="text-muted-foreground">Harika</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-400/80" />
                <span className="text-muted-foreground">Mutlu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-400/80" />
                <span className="text-muted-foreground">Sakin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400/80" />
                <span className="text-muted-foreground">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-400/80" />
                <span className="text-muted-foreground">Üzgün</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500/80" />
                <span className="text-muted-foreground">Sinirli</span>
              </div>
            </div>
          </div>
        </MoodyCard>

        {/* Stats Summary */}
        <MoodyCard className="mb-4" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-coral" />
            <h4 className="text-foreground font-semibold">Bu Ay</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-coral">
                {entries.filter(e => {
                  const date = new Date(e.created_at);
                  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Kayıt</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(
                  entries
                    .filter(e => {
                      const date = new Date(e.created_at);
                      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                    })
                    .reduce((sum, e) => sum + e.mood_level, 0) /
                    entries.filter(e => {
                      const date = new Date(e.created_at);
                      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                    }).length || 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Ort. Mood</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(
                  entries
                    .filter(e => {
                      const date = new Date(e.created_at);
                      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                    })
                    .map(e => new Date(e.created_at).toDateString())
                ).size}
              </p>
              <p className="text-xs text-muted-foreground">Aktif Gün</p>
            </div>
          </div>
        </MoodyCard>

        {/* Day Detail Modal */}
        <Modal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          title={selectedDay ? `${selectedDay.dayOfMonth} ${formatMonthYear(currentYear, currentMonth)}` : ''}
        >
          {selectedDay?.moodEntry && (
            <div className="space-y-4">
              {/* Mood Display */}
              <div className="text-center py-6">
                <div className="text-6xl mb-3">{selectedDay.moodEntry.mood_emoji}</div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {getMoodLabel(selectedDay.moodEntry.mood_level)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedDay.moodEntry.created_at).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Activities */}
              {selectedDay.moodEntry.activities && selectedDay.moodEntry.activities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Aktiviteler</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.moodEntry.activities.map((activity, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-foreground"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              {selectedDay.moodEntry.note && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Not</h4>
                  <p className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-3">
                    {selectedDay.moodEntry.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
