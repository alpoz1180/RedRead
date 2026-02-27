import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MoodyCard } from "../MoodyCard";
import { Badge } from "../Badge";
import { Modal } from "../Modal";
import { MoodyButton } from "../MoodyButton";
import { Logo } from "../Logo";
import { Switch } from "../ui/switch";
import { ProfileEditModal } from "../ProfileEditModal";
import {
  ArrowLeft, Flame, Calendar, Award, Settings, ChevronRight,
  Bell, Moon, Shield, HelpCircle, LogOut, Star, Loader2, Clock, Zap, Edit2, Crown,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useMoodEntries } from "../../../hooks/useMoodEntries";
import { useUserSettings } from "../../../hooks/useUserSettings";
import { useGamification } from "../../../hooks/useGamification";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import { useSubscription } from "../../../hooks/useSubscription";
import { useTheme } from "../../../contexts/ThemeContext";
import { ACHIEVEMENTS, getXPProgress } from "../../../lib/achievements";
import {
  calculateStreak,
  calculateAverageMood,
  getLongestStreak,
  getTotalUniqueDays,
  getCompletionPercentage,
  getRecentMoodEntries,
} from "../../../lib/moodUtils";
import { toast } from "sonner";

export function ProfileScreen() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user, profile, signOut, loading: authLoading, refetchProfile } = useAuth();
  const { entries, loading: entriesLoading } = useMoodEntries();
  const { settings, loading: settingsLoading, toggleReminder, updateReminderTime } = useUserSettings();
  const { stats: userStats, achievements: userAchievements, loading: gamificationLoading } = useGamification();
  const { updateProfile } = useUpdateProfile();
  const { subscription, isPremium, isWeekly, isYearly, isFree } = useSubscription();
  const { isDark, toggleTheme } = useTheme();

  const settingsItems = [
    { icon: Moon, label: "Karanlık Mod", value: isDark ? "Açık" : "Kapalı", onClick: toggleTheme },
    { icon: Shield, label: "Gizlilik", value: "", onClick: () => toast.info('Gizlilik ayarları yakında eklenecek') },
    { icon: HelpCircle, label: "Yardım & Destek", value: "", onClick: () => toast.info('Yardım sayfası yakında eklenecek') },
  ];

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (time: string) => {
    if (!time) return '20:00';
    return time.substring(0, 5);
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    updateReminderTime(newTime);
  };

  // Calculate stats from real data
  const stats = useMemo(() => {
    return {
      currentStreak: calculateStreak(entries),
      averageMood: calculateAverageMood(entries),
      totalEntries: entries.length,
      longestStreak: getLongestStreak(entries),
      totalDays: getTotalUniqueDays(entries),
      completionPercentage: getCompletionPercentage(entries),
      recentMoods: getRecentMoodEntries(entries, 5),
    };
  }, [entries]);

  // Map achievements with unlock status
  const achievementsWithStatus = useMemo(() => {
    // Guard against undefined userAchievements
    const achievements = userAchievements || [];
    
    return ACHIEVEMENTS.map(achievement => {
      const isUnlocked = achievements.some(ua => ua.achievement_id === achievement.id);
      const unlockData = achievements.find(ua => ua.achievement_id === achievement.id);
      
      // Calculate progress for locked achievements
      let progress = '';
      if (!isUnlocked && userStats) {
        if (achievement.id.startsWith('streak_')) {
          const requiredDays = parseInt(achievement.id.split('_')[1]);
          progress = `${userStats.current_streak}/${requiredDays}`;
        } else if (achievement.id.startsWith('entries_')) {
          const requiredEntries = parseInt(achievement.id.split('_')[1]);
          progress = `${userStats.total_mood_entries}/${requiredEntries}`;
        } else if (achievement.id.startsWith('level_')) {
          const requiredLevel = parseInt(achievement.id.split('_')[1]);
          progress = `Level ${userStats.level}/${requiredLevel}`;
        }
      }
      
      return {
        ...achievement,
        unlocked: isUnlocked,
        unlockedAt: unlockData?.unlocked_at,
        progress,
      };
    });
  }, [userAchievements, userStats]);

  // Calculate XP progress for current level
  const xpProgress = useMemo(() => {
    if (!userStats) return { current: 0, needed: 100, percentage: 0 };
    return getXPProgress(userStats.xp, userStats.level); // ✅ Doğru sıra: (xp, level)
  }, [userStats]);

  const handleProfileUpdate = async (name: string, emoji: string) => {
    const success = await updateProfile(name, emoji);
    if (success && refetchProfile) {
      await refetchProfile();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Başarıyla çıkış yapıldı');
      navigate('/login', { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Sign out error:', error);
      }
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  const loading = authLoading || entriesLoading || gamificationLoading;

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-8 w-8 text-coral mb-4" />
          <p className="text-muted-foreground">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary text-foreground transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-foreground">Profil</h2>
          </div>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <Settings size={22} />
          </button>
        </div>

        {/* Profile Card */}
        <MoodyCard className="mb-4 text-center" padding="lg">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="w-full h-full rounded-full bg-coral/10 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl">{profile?.avatar_emoji || '😊'}</span>
              )}
            </div>
            {/* Edit Button */}
            <motion.button
              onClick={() => setShowEditProfile(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-coral text-white flex items-center justify-center shadow-lg hover:bg-coral-dark transition-colors"
            >
              <Edit2 size={14} />
            </motion.button>
            {/* Level Badge */}
            {userStats && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center border-2 border-background shadow-lg"
              >
                <span className="text-xs text-white font-bold">{userStats.level}</span>
              </motion.div>
            )}
          </div>
          <h3 className="text-foreground mb-1">
            {profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Kullanıcı'}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {user?.email || 'Kendini keşfetme yolculuğunda'}
          </p>

          {/* Premium Badge or Upgrade Button */}
          {isPremium ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-coral to-coral-light flex items-center justify-center gap-2"
            >
              <Crown size={16} className="text-white" />
              <span className="text-white text-sm font-semibold">
                {isYearly ? 'Yıllık Premium' : isWeekly ? 'Haftalık Premium' : 'Premium'}
              </span>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/home/premium')}
              className="mb-3 px-4 py-2 rounded-xl bg-gradient-to-r from-coral to-coral-light text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Crown size={16} />
              <span className="text-sm">Premium'a Geç</span>
            </motion.button>
          )}

          {/* XP Progress Bar */}
          {userStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-coral" />
                  Level {userStats.level}
                </span>
                <span className="font-semibold">
                  {xpProgress.current} / {xpProgress.needed} XP
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percentage}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-coral to-coral-dark rounded-full"
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-lg text-coral" style={{ fontWeight: 800 }}>
                {stats.totalEntries}
              </p>
              <p className="text-muted-foreground text-[10px]" style={{ fontWeight: 600 }}>Kayıt</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg text-coral" style={{ fontWeight: 800 }}>
                {stats.currentStreak}
              </p>
              <p className="text-muted-foreground text-[10px]" style={{ fontWeight: 600 }}>Streak</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg text-coral" style={{ fontWeight: 800 }}>
                {stats.averageMood > 0 ? stats.averageMood : '-'}
              </p>
              <p className="text-muted-foreground text-[10px]" style={{ fontWeight: 600 }}>Ort. Mood</p>
            </div>
          </div>
        </MoodyCard>

        {/* Achievements */}
        <MoodyCard className="mb-4" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-coral" />
              <h4 className="text-foreground">Başarılar</h4>
            </div>
            <span className="text-xs text-muted-foreground">
              {achievementsWithStatus.filter(a => a.unlocked).length}/{achievementsWithStatus.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievementsWithStatus.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-2xl border transition-all ${
                  achievement.unlocked 
                    ? "bg-coral/5 border-coral/20 shadow-sm" 
                    : "bg-secondary/50 border-transparent opacity-60 grayscale"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-2xl">{achievement.emoji}</span>
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Star size={14} className="text-coral fill-coral" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-foreground mt-1" style={{ fontWeight: 700 }}>
                  {achievement.title}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {achievement.description}
                </p>
                {!achievement.unlocked && achievement.progress && (
                  <p className="text-[10px] text-coral mt-1 font-semibold">
                    {achievement.progress}
                  </p>
                )}
                {achievement.unlocked && (
                  <p className="text-[10px] text-coral mt-1 font-semibold">
                    +{achievement.xp_reward} XP
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </MoodyCard>

        {/* Recent History */}
        <MoodyCard className="mb-4" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-coral" />
            <h4 className="text-foreground">Son Kayıtlar</h4>
          </div>
          <div className="space-y-3">
            {stats.recentMoods.length > 0 ? (
              stats.recentMoods.map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{m.date}</span>
                    </div>
                    {m.note && (
                      <p className="text-xs text-muted-foreground truncate">{m.note}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm">Henüz mood kaydı yok</p>
              </div>
            )}
          </div>
        </MoodyCard>

        {/* Streak Stats */}
        <MoodyCard className="mb-4" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-coral" />
            <h4 className="text-foreground">Streak İstatistikleri</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl text-coral" style={{ fontWeight: 800 }}>
                {stats.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">Mevcut Streak</p>
            </div>
            <div>
              <p className="text-2xl text-foreground" style={{ fontWeight: 800 }}>
                {stats.longestStreak}
              </p>
              <p className="text-xs text-muted-foreground">En Uzun Streak</p>
            </div>
            <div>
              <p className="text-2xl text-foreground" style={{ fontWeight: 800 }}>
                {stats.totalDays}
              </p>
              <p className="text-xs text-muted-foreground">Toplam Gün</p>
            </div>
            <div>
              <p className="text-2xl text-foreground" style={{ fontWeight: 800 }}>
                %{stats.completionPercentage}
              </p>
              <p className="text-xs text-muted-foreground">Tamamlanma</p>
            </div>
          </div>
        </MoodyCard>

        {/* Settings Modal */}
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Ayarlar">
          <div className="space-y-4">
            {/* Daily Reminder Section */}
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-coral/10 flex items-center justify-center">
                  <Bell size={18} className="text-coral" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm text-foreground font-semibold">Günlük Hatırlatıcı</h4>
                  <p className="text-xs text-muted-foreground">Her gün mood'unu kaydet</p>
                </div>
                <Switch
                  checked={settings?.reminder_enabled || false}
                  onCheckedChange={toggleReminder}
                  disabled={settingsLoading}
                />
              </div>
              
              {settings?.reminder_enabled && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <Clock size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="reminder-time" className="text-xs text-muted-foreground block mb-1">
                        Hatırlatma Saati
                      </label>
                      <input
                        id="reminder-time"
                        type="time"
                        value={formatTime(settings?.reminder_time || '20:00:00')}
                        onChange={handleTimeChange}
                        disabled={settingsLoading}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-coral/50 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Settings */}
            <div className="space-y-1">
              {settingsItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon size={18} className="text-foreground" />
                    </div>
                    <span className="flex-1 text-left text-sm text-foreground" style={{ fontWeight: 600 }}>{item.label}</span>
                    {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-error-light transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center">
                  <LogOut size={18} className="text-error" />
                </div>
                <span className="text-sm text-error" style={{ fontWeight: 600 }}>Çıkış Yap</span>
              </button>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Logo size="sm" />
            <p className="text-[10px] text-muted-foreground mt-1">v1.0.0</p>
          </div>
        </Modal>

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentName={profile?.full_name || ''}
          currentEmoji={profile?.avatar_emoji || '😊'}
          onSave={handleProfileUpdate}
        />
      </div>
    </div>
  );
}
