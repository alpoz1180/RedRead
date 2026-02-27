import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Logo } from "../Logo";
import { MoodyCard } from "../MoodyCard";
import { MoodyButton } from "../MoodyButton";
import { Flame, Sparkles, Loader2, TrendingUp, Calendar, Crown, Infinity } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { useMoodEntries } from "../../../hooks/useMoodEntries";
import { useLatestInsight } from "../../../hooks/useLatestInsight";
import { useDailyMoodLimit } from "../../../hooks/useDailyMoodLimit";
import { SkeletonCard, SkeletonChart, SkeletonStats, SkeletonMoodCard } from "../ui/skeleton";
import {
  hasMoodToday,
  getTodayMood,
  calculateStreak,
  getWeeklyMoods,
  calculateAverageMood,
  getBestDayOfWeek,
} from "../../../lib/moodUtils";

const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const moodColors: Record<number, string> = {
  1: "#8A949C",
  2: "#FFAA00",
  3: "#5AC8FA",
  4: "#34C759",
  5: "#F4694A",
  6: "#FF3B30",
};

const moodLabels: Record<number, string> = {
  5: "Harika",
  4: "Mutlu",
  3: "Sakin",
  2: "Normal",
  1: "Üzgün",
  6: "Sinirli",
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { entries, loading, error } = useMoodEntries();
  const { insight, loading: insightLoading } = useLatestInsight();
  const { canAddMood, dailyLimit, todayCount, remaining } = useDailyMoodLimit();
  const greeting = getGreeting();

  // Calculate stats
  const stats = useMemo(() => {
    const todayMood = getTodayMood(entries);
    const weekMoods = getWeeklyMoods(entries);
    
    return {
      todayCheckedIn: hasMoodToday(entries),
      todayMood,
      streak: calculateStreak(entries),
      weekMoods,
      avgMood: calculateAverageMood(entries),
      bestDay: getBestDayOfWeek(entries),
      totalEntries: entries.length,
    };
  }, [entries]);

  // Format chart data
  const chartData = useMemo(() => {
    return weekDays.map((day, i) => ({
      day,
      mood: stats.weekMoods[i] || null,
    }));
  }, [stats.weekMoods]);

  // Loading state
  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 py-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
                <div className="h-6 w-24 bg-secondary/50 rounded animate-pulse" />
              </div>
            </div>
            
            <SkeletonCard />
            <SkeletonMoodCard />
            <SkeletonCard />
            <SkeletonChart />
            <SkeletonStats />
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">Veriler yüklenirken hata oluştu</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="flex items-center justify-between py-4 mb-4"
        >
          <div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm mb-1"
            >
              {greeting}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Logo size="sm" />
            </motion.div>
          </div>
        </motion.div>

        {/* AI Insight Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1 
          }}
          whileHover={{ scale: 1.02 }}
          className="mb-3"
        >
          <div 
            className="
              rounded-3xl p-4
              bg-[rgba(255,255,255,0.05)] 
              dark:bg-[rgba(255,255,255,0.05)]
              backdrop-blur-[20px]
              border border-[rgba(255,255,255,0.08)]
            "
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <h4 className="text-foreground font-semibold">AI İçgörüsü</h4>
            </div>

            {insightLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-coral mr-2" />
                <span className="text-sm text-muted-foreground">Yükleniyor...</span>
              </div>
            ) : insight ? (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-2xl">
                <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-2">
                  {insight.insight}
                </p>
                <button
                  onClick={() => navigate("/home/insights")}
                  className="text-coral hover:underline font-semibold text-xs flex items-center gap-1"
                >
                  Devamını Oku →
                </button>
              </div>
            ) : (
              <MoodyButton
                onClick={() => navigate("/home/insights")}
                fullWidth
                size="md"
                disabled={entries.length === 0}
              >
                <Sparkles size={18} />
                {entries.length === 0 ? "Önce mood kaydet" : "AI İçgörüsü Al"}
              </MoodyButton>
            )}
          </div>
        </motion.div>

        {/* Today's Mood Card - Compact & Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2 
          }}
          whileHover={{ scale: 1.02 }}
          className="mb-3"
        >
          <div 
            className="
              rounded-3xl p-4
              bg-[rgba(255,255,255,0.05)] 
              dark:bg-[rgba(255,255,255,0.05)]
              backdrop-blur-[20px]
              border border-[rgba(255,255,255,0.08)]
            "
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Daily Limit Badge */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Bugünün Mood'u</h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !canAddMood && navigate('/home/premium')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  dailyLimit === null
                    ? 'bg-coral/10 text-coral'
                    : canAddMood
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500 cursor-pointer hover:bg-red-500/20'
                }`}
              >
                {dailyLimit === null ? (
                  <>
                    <Infinity size={14} />
                    <span>Sınırsız</span>
                  </>
                ) : (
                  <>
                    <span>{todayCount}/{dailyLimit}</span>
                    {!canAddMood && <Crown size={12} />}
                  </>
                )}
              </motion.button>
            </div>

            {stats.todayCheckedIn && stats.todayMood ? (
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="text-[40px] leading-none"
                >
                  {stats.todayMood.mood_emoji}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {moodLabels[stats.todayMood.mood_level]}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(stats.todayMood.created_at).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    'de kaydedildi
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <h3 className="text-foreground text-sm mb-3">Bugün nasıl hissediyorsun?</h3>
                <MoodyButton onClick={() => navigate("/home/mood")} fullWidth size="md">
                  <Sparkles size={18} />
                  Mood Kaydet
                </MoodyButton>
              </div>
            )}
          </div>
        </motion.div>

        {/* Streak Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.3 
          }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate("/home/profile")}
          className="cursor-pointer mb-3"
        >
          <div 
            className="
              rounded-3xl p-4
              bg-[rgba(255,255,255,0.05)] 
              dark:bg-[rgba(255,255,255,0.05)]
              backdrop-blur-[20px]
              border border-[rgba(255,255,255,0.08)]
            "
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center relative"
                >
                  <Flame size={28} className="text-coral" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-foreground">Streak</h4>
                    {/* Achievement Badges */}
                    <div className="flex gap-1">
                      {stats.streak >= 7 && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          className="text-sm"
                          title="7 günlük streak"
                        >
                          🔥
                        </motion.span>
                      )}
                      {stats.streak >= 14 && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                          className="text-sm"
                          title="14 günlük streak"
                        >
                          ⭐
                        </motion.span>
                      )}
                      {stats.streak >= 30 && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                          className="text-sm"
                          title="30 günlük streak"
                        >
                          🏆
                        </motion.span>
                      )}
                      {stats.streak >= 100 && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
                          className="text-sm"
                          title="100 günlük streak"
                        >
                          👑
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.streak >= 7
                      ? "Harika! Devam et 🎉"
                      : `${7 - stats.streak} gün kaldı`}
                  </p>
                </div>
              </div>
              <motion.div 
                className="text-4xl font-extrabold text-coral"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.5,
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }}
              >
                <motion.span
                  key={stats.streak}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {stats.streak}
                </motion.span>
              </motion.div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.streak / 7) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-coral to-coral-light rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Weekly Bar Chart - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.4 
          }}
          whileHover={{ scale: 1.02 }}
          className="mb-3"
        >
          <div 
            className="
              rounded-3xl p-4
              bg-[rgba(255,255,255,0.05)] 
              dark:bg-[rgba(255,255,255,0.05)]
              backdrop-blur-[20px]
              border border-[rgba(255,255,255,0.08)]
            "
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-coral" />
              <h4 className="text-foreground">Haftalık Özet</h4>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <Bar dataKey="mood" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.mood > 0 ? moodColors[entry.mood] : "#e5e7eb"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row - Glassmorphism */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.5 
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="
                rounded-2xl p-3 text-center
                bg-[rgba(255,255,255,0.05)] 
                dark:bg-[rgba(255,255,255,0.05)]
                backdrop-blur-[20px]
                border border-[rgba(255,255,255,0.08)]
              "
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <motion.div 
                className="text-2xl font-extrabold text-coral mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
              >
                {stats.totalEntries}
              </motion.div>
              <p className="text-xs text-muted-foreground font-semibold">Toplam Kayıt</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.6 
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="
                rounded-2xl p-3 text-center
                bg-[rgba(255,255,255,0.05)] 
                dark:bg-[rgba(255,255,255,0.05)]
                backdrop-blur-[20px]
                border border-[rgba(255,255,255,0.08)]
              "
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <motion.div 
                className="text-2xl font-extrabold text-foreground mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
              >
                {stats.avgMood > 0 ? stats.avgMood : "-"}
              </motion.div>
              <p className="text-xs text-muted-foreground font-semibold">Ort. Mood</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.7 
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="
                rounded-2xl p-3 text-center
                bg-[rgba(255,255,255,0.05)] 
                dark:bg-[rgba(255,255,255,0.05)]
                backdrop-blur-[20px]
                border border-[rgba(255,255,255,0.08)]
              "
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <motion.div 
                className="text-lg font-extrabold text-foreground mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
              >
                {stats.bestDay || "-"}
              </motion.div>
              <p className="text-xs text-muted-foreground font-semibold">En Mutlu Gün</p>
            </div>
          </motion.div>
        </div>

        {/* Insights Link */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.8 
          }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MoodyButton
              onClick={() => navigate("/home/insights")}
              fullWidth
              variant="secondary"
              size="lg"
            >
              <TrendingUp size={20} />
              Detaylı İçgörüler
            </MoodyButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Günaydın ☀️";
  if (hour < 18) return "İyi günler 👋";
  return "İyi akşamlar 🌙";
}
