import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MoodyCard } from "../MoodyCard";
import { Badge } from "../Badge";
import { MoodyButton } from "../MoodyButton";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Flame,
  Activity,
  Calendar,
  Sparkles,
  X,
  Crown,
  Loader2,
  Share2,
  Lock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { Modal } from "../Modal";
import { useMoodEntries } from "../../../hooks/useMoodEntries";
import { useLatestInsight } from "../../../hooks/useLatestInsight";
import { useAIInsight } from "../../../hooks/useAIInsight";
import { useCanUsePremiumFeature } from "../../../hooks/useCanUsePremiumFeature";
import { useAIUsageLimit } from "../../../hooks/useAIUsageLimit";
import {
  calculateAverageMood,
  getMoodDistribution,
  getLongestStreak,
  getBestDayOfWeek,
  getWeeklyChartData,
  getMonthlyChartData,
} from "../../../lib/moodUtils";
import { toast } from "sonner";
import { generateShareImage } from "../../../lib/shareUtils";

const moodLabels: Record<number, string> = {
  5: "Harika",
  4: "Mutlu",
  3: "Sakin",
  2: "Normal",
  1: "Üzgün",
  6: "Sinirli",
};

interface MoodEntry {
  id: string;
  mood_level: number;
  mood_emoji: string;
  activities: string[] | null;
  note: string | null;
  created_at: string;
}

export function InsightsScreen() {
  const navigate = useNavigate();
  const { entries, loading, error } = useMoodEntries();
  const { insight, loading: insightLoading, refetch: refetchInsight } = useLatestInsight();
  const { generateInsight, loading: generatingInsight } = useAIInsight();
  const { canUse: canUsePremiumFeature } = useCanUsePremiumFeature();
  const { monthlyUsed, monthlyLimit, canUse: canUseAI, remaining } = useAIUsageLimit();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [selectedDay, setSelectedDay] = useState<MoodEntry | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthEntries = entries.filter(
      (e) => new Date(e.created_at) >= thisMonthStart
    );
    const lastMonthEntries = entries.filter(
      (e) =>
        new Date(e.created_at) >= lastMonthStart &&
        new Date(e.created_at) <= lastMonthEnd
    );

    const thisMonthAvg = calculateAverageMood(thisMonthEntries);
    const lastMonthAvg = calculateAverageMood(lastMonthEntries);
    const change = thisMonthAvg - lastMonthAvg;
    const changePercent =
      lastMonthAvg > 0 ? ((change / lastMonthAvg) * 100).toFixed(0) : 0;

    // Calculate unique days
    const uniqueDays = new Set(
      thisMonthEntries.map((e) => new Date(e.created_at).toDateString())
    ).size;

    // Calculate longest streak this month
    const sortedThisMonth = [...thisMonthEntries].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    sortedThisMonth.forEach((entry) => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);

      if (prevDate) {
        const diffDays = Math.floor(
          (entryDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      prevDate = entryDate;
    });
    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      daysLogged: uniqueDays,
      avgMood: thisMonthAvg,
      change,
      changePercent,
      longestStreak,
    };
  }, [entries]);

  // Chart data
  const chartData = useMemo(() => {
    let data;
    if (period === "weekly") {
      data = getWeeklyChartData(entries);
    } else {
      const monthlyData = getMonthlyChartData(entries);
      // Convert monthly data to have 'day' and 'mood' keys for consistency
      data = monthlyData.map(item => ({
        day: item.week,
        mood: item.avg,
      }));
    }
    
    return data;
  }, [entries, period]);

  // Stats
  const stats = useMemo(() => {
    const bestActivity = entries.reduce((acc, entry) => {
      entry.activities?.forEach((activity) => {
        if (!acc[activity]) acc[activity] = { total: 0, count: 0 };
        acc[activity].total += entry.mood_level;
        acc[activity].count += 1;
      });
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const bestActivityName = Object.entries(bestActivity)
      .map(([name, data]) => ({ name, avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)[0];

    return {
      bestDay: getBestDayOfWeek(entries),
      bestActivity: bestActivityName?.name || "Yok",
      longestStreak: getLongestStreak(entries),
      totalEntries: entries.length,
      distribution: getMoodDistribution(entries),
    };
  }, [entries]);

  const handleGenerateInsight = async () => {
    // Check if user can use AI feature
    const featureCheck = canUsePremiumFeature('ai_insight');
    if (!featureCheck.canUse) {
      setShowPremiumModal(true);
      return;
    }

    // Check monthly limit
    if (!canUseAI) {
      toast.error(`Bu ay AI limitiniz doldu (${monthlyUsed}/${monthlyLimit})`);
      return;
    }

    toast.loading("AI içgörüsü oluşturuluyor...");
    
    try {
      // Generate new insight via edge function
      await generateInsight();
      
      // Refetch from database to get the latest insight
      await refetchInsight();
      
      toast.dismiss();
      toast.success("Yeni içgörü oluşturuldu!");
    } catch (error) {
      toast.dismiss();
      toast.error("İçgörü oluşturulamadı");
      if (import.meta.env.DEV) {
        console.error("Generate insight error:", error);
      }
    }
  };

  const handleShareInsight = async () => {
    if (!insight) {
      toast.error("Paylaşılacak içgörü bulunamadı");
      return;
    }

    setIsSharing(true);
    toast.loading("İçgörü hazırlanıyor...");

    try {
      // Generate share image using Canvas API
      const blob = await generateShareImage({
        insight: insight.insight,
        date: new Date(insight.created_at).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        streak: getLongestStreak(entries),
        avgMood: calculateAverageMood(entries),
      });

      toast.dismiss();

      // Try Web Share API first (mobile-friendly)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "yourmoody-insight.png", { type: "image/png" });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "YourMoody İçgörüsü",
            text: "AI tarafından oluşturulan mood analizi 🧠✨",
          });
          toast.success("İçgörü paylaşıldı!");
          setIsSharing(false);
          return;
        }
      }

      // Fallback: Download the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `yourmoody-insight-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("İçgörü indirildi!");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Share error:", error);
      }
      toast.error("Paylaşım sırasında hata oluştu");
    } finally {
      setIsSharing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-coral" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">Hata oluştu</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">📊</p>
          <h3 className="text-foreground mb-2">Henüz Veri Yok</h3>
          <p className="text-muted-foreground text-sm mb-4">
            İçgörüleri görmek için mood kayıtları yapmaya başla!
          </p>
          <MoodyButton onClick={() => navigate("/home/mood")} size="lg">
            İlk Mood'unu Kaydet →
          </MoodyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center gap-3 py-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-secondary text-foreground transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-foreground">İçgörüler</h2>
        </div>

        {/* Monthly Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MoodyCard className="mb-4 overflow-hidden" padding="none">
            <div className="bg-gradient-to-br from-coral via-coral-dark to-coral-light p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Bu Ay</p>
                  <h3 className="text-3xl font-extrabold text-white">
                    {monthlyStats.daysLogged} Gün
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">
                    {monthlyStats.avgMood.toFixed(1)}
                  </div>
                  <p className="text-white/80 text-xs">Ortalama</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {monthlyStats.change >= 0 ? (
                      <TrendingUp size={16} className="text-white" />
                    ) : (
                      <TrendingDown size={16} className="text-white" />
                    )}
                    <span className="text-white text-sm font-semibold">
                      {monthlyStats.change >= 0 ? "+" : ""}
                      {monthlyStats.changePercent}%
                    </span>
                  </div>
                  <p className="text-white/70 text-xs">Geçen Aya Göre</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={16} className="text-white" />
                    <span className="text-white text-sm font-semibold">
                      {monthlyStats.longestStreak} Gün
                    </span>
                  </div>
                  <p className="text-white/70 text-xs">En Uzun Streak</p>
                </div>
              </div>
            </div>
          </MoodyCard>
        </motion.div>

        {/* Period Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex bg-secondary rounded-2xl p-1 mb-4"
        >
          <button
            onClick={() => setPeriod("weekly")}
            className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
              period === "weekly"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
              period === "monthly"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Aylık
          </button>
        </motion.div>

        {/* Big Mood Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MoodyCard className="mb-4" padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-coral" />
              <h4 className="text-foreground">Mood Grafiği</h4>
            </div>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F4694A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F4694A" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      domain={[0, 6]}
                      ticks={[0, 1, 2, 3, 4, 5, 6]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        moodLabels[Math.round(value)] || value.toFixed(1),
                        "Mood",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#F4694A"
                      strokeWidth={3}
                      fill="url(#moodGradient)"
                      connectNulls={true}
                      dot={{ fill: "#F4694A", strokeWidth: 2, r: 5, stroke: "#fff" }}
                      activeDot={{
                        r: 7,
                        fill: "#F4694A",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Veri yok</p>
                </div>
              )}
            </div>
          </MoodyCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <MoodyCard padding="lg">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
              <Calendar size={20} className="text-success" />
            </div>
            <p className="text-xl font-extrabold text-foreground mb-1">
              {stats.bestDay || "-"}
            </p>
            <p className="text-xs text-muted-foreground">En Mutlu Gün</p>
          </MoodyCard>

          <MoodyCard padding="lg">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center mb-3">
              <Activity size={20} className="text-info" />
            </div>
            <p className="text-xl font-extrabold text-foreground mb-1">
              {stats.bestActivity}
            </p>
            <p className="text-xs text-muted-foreground">En Etkili Aktivite</p>
          </MoodyCard>

          <MoodyCard padding="lg">
            <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center mb-3">
              <Flame size={20} className="text-coral" />
            </div>
            <p className="text-xl font-extrabold text-foreground mb-1">
              {stats.longestStreak}
            </p>
            <p className="text-xs text-muted-foreground">En Uzun Streak</p>
          </MoodyCard>

          <MoodyCard padding="lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-purple-500" />
            </div>
            <p className="text-xl font-extrabold text-foreground mb-1">
              {stats.totalEntries}
            </p>
            <p className="text-xs text-muted-foreground">Toplam Kayıt</p>
          </MoodyCard>
        </motion.div>

        {/* AI Weekly Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <MoodyCard className="mb-4" padding="lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <h4 className="text-foreground">AI Haftalık Analiz</h4>
              </div>
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Crown size={12} />
                Premium
              </Badge>
            </div>

            {insightLoading || generatingInsight ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin h-6 w-6 text-coral mr-2" />
                <span className="text-sm text-muted-foreground">
                  {generatingInsight ? "AI analiz ediyor..." : "Yükleniyor..."}
                </span>
              </div>
            ) : insight ? (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-2xl mb-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {insight.insight}
                </p>
              </div>
            ) : null}

            {/* Usage counter for premium users */}
            {!canUsePremiumFeature('ai_insight').canUse ? null : monthlyLimit > 0 && (
              <div className="mb-3 text-center">
                <span className="text-xs text-muted-foreground">
                  Bu ay: <strong className={canUseAI ? 'text-coral' : 'text-red-500'}>
                    {monthlyUsed}/{monthlyLimit}
                  </strong> kullanıldı
                  {remaining > 0 && ` (${remaining} kaldı)`}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {!canUsePremiumFeature('ai_insight').canUse ? (
                <MoodyButton
                  onClick={() => setShowPremiumModal(true)}
                  fullWidth
                  size="md"
                  className="relative"
                >
                  <Lock size={18} />
                  AI İçgörüleri - Premium
                </MoodyButton>
              ) : (
                <MoodyButton
                  onClick={handleGenerateInsight}
                  fullWidth
                  size="md"
                  disabled={insightLoading || generatingInsight || !canUseAI}
                >
                  <Sparkles size={18} />
                  {insight ? "Yeni Analiz Al" : "Analiz Oluştur"}
                </MoodyButton>
              )}
              
              {insight && (
                <MoodyButton
                  onClick={handleShareInsight}
                  size="md"
                  variant="outline"
                  disabled={isSharing}
                  className="px-4"
                >
                  {isSharing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Share2 size={18} />
                  )}
                </MoodyButton>
              )}
            </div>
          </MoodyCard>
        </motion.div>

        {/* Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <MoodyCard className="mb-4" padding="lg">
            <h4 className="text-foreground mb-4">Mood Dağılımı</h4>
            <div className="space-y-3">
              {stats.distribution.map((item) => {
                const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1);
                const percentage = ((item.count / stats.totalEntries) * 100).toFixed(0);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.mood}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          %{percentage}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {item.count}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / maxCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-coral to-coral-light rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </MoodyCard>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md mx-auto bg-card rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-bold">Detaylar</h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 rounded-xl hover:bg-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl mb-2">{selectedDay.mood_emoji}</div>
                <h4 className="text-xl font-bold text-foreground mb-1">
                  {moodLabels[selectedDay.mood_level]}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedDay.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {selectedDay.activities && selectedDay.activities.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Aktiviteler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.activities.map((activity, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-secondary text-sm rounded-full"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.note && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Not
                  </p>
                  <p className="text-sm text-foreground bg-secondary p-3 rounded-xl">
                    {selectedDay.note}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal for AI */}
      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="AI İçgörüleri Premium Özelliğidir"
      >
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4"
          >
            <Sparkles size={40} className="text-coral" />
          </motion.div>

          <p className="text-foreground mb-2 text-lg font-semibold">
            AI İle Ruh Halinizi Keşfedin
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Premium ile AI destekli kişiselleştirilmiş içgörüler alın, 
            duygusal desenlerinizi anlayın.
          </p>

          <div className="bg-secondary/50 rounded-2xl p-4 mb-6">
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-coral" />
                <span className="text-foreground">
                  <strong>Haftalık:</strong> Haftada 1 AI analiz
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-coral" />
                <span className="text-foreground">
                  <strong>Yıllık:</strong> Haftada 2 AI analiz
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowPremiumModal(false);
                navigate('/home/premium');
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-coral to-coral-light text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Crown size={20} />
              Premium'a Geç
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPremiumModal(false)}
              className="w-full py-3 rounded-2xl bg-secondary text-foreground font-semibold"
            >
              Kapat
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
