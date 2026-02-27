import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { MoodyButton } from "../MoodyButton";
import { MoodyTextarea } from "../MoodyInput";
import { MoodyCard } from "../MoodyCard";
import { AchievementUnlock } from "../AchievementUnlock";
import { Modal } from "../Modal";
import { ArrowLeft, Check, Sparkles, Heart, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { useCreateMood } from "../../../hooks/useCreateMood";
import { useGamification } from "../../../hooks/useGamification";
import { useMoodEntries } from "../../../hooks/useMoodEntries";
import { useDailyMoodLimit } from "../../../hooks/useDailyMoodLimit";
import { calculateStreak, getLongestStreak } from "../../../lib/moodUtils";
import { triggerHaptic, HapticFeedbackType } from "../../../lib/haptics";
import { sanitizeMoodNote } from "../../../lib/sanitize";

const moodOptions = [
  { emoji: "😁", label: "Harika", value: 5, color: "#F4694A", bgGradient: "from-coral-light to-coral" },
  { emoji: "😊", label: "Mutlu", value: 4, color: "#34C759", bgGradient: "from-green-400 to-green-500" },
  { emoji: "😌", label: "Sakin", value: 3, color: "#5AC8FA", bgGradient: "from-blue-400 to-blue-500" },
  { emoji: "😐", label: "Normal", value: 2, color: "#FFAA00", bgGradient: "from-yellow-400 to-yellow-500" },
  { emoji: "😔", label: "Üzgün", value: 1, color: "#8A949C", bgGradient: "from-gray-400 to-gray-500" },
  { emoji: "😤", label: "Sinirli", value: 6, color: "#FF3B30", bgGradient: "from-red-400 to-red-500" },
];

const tags = [
  "İş", "Aile", "Arkadaşlar", "Sağlık", "Spor", "Uyku",
  "Yemek", "Hava", "Müzik", "Doğa", "Kitap", "Film",
];

export function MoodEntryScreen() {
  const navigate = useNavigate();
  const { createMood, loading } = useCreateMood();
  const { entries } = useMoodEntries();
  const { updateStats, checkAchievements } = useGamification();
  const { canAddMood, dailyLimit, todayCount, remaining } = useDailyMoodLimit();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Gesture state for swipe
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  // Handle swipe gesture to change mood
  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      // Only allow swipe if mood is selected
      if (selectedMood === null) return;

      // Swipe threshold
      const swipeThreshold = 50;
      const velocityThreshold = 0.5;

      if (!down && (Math.abs(mx) > swipeThreshold || Math.abs(vx) > velocityThreshold)) {
        const currentIndex = moodOptions.findIndex(m => m.value === selectedMood);
        
        // Swipe left = next mood (lower value)
        // Swipe right = previous mood (higher value)
        if (xDir > 0 && currentIndex < moodOptions.length - 1) {
          // Swiped right - next mood
          triggerHaptic(HapticFeedbackType.Selection);
          setSelectedMood(moodOptions[currentIndex + 1].value);
        } else if (xDir < 0 && currentIndex > 0) {
          // Swiped left - previous mood
          triggerHaptic(HapticFeedbackType.Selection);
          setSelectedMood(moodOptions[currentIndex - 1].value);
        }
        
        cancel?.();
      }

      x.set(down ? mx : 0);
    },
    {
      axis: 'x',
      filterTaps: true,
      rubberband: true,
    }
  );

  const toggleTag = (tag: string) => {
    triggerHaptic(HapticFeedbackType.Light);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      triggerHaptic(HapticFeedbackType.Warning);
      toast.error("Lütfen önce bir ruh hali seç");
      return;
    }

    // Check daily limit BEFORE anything else
    if (!canAddMood) {
      triggerHaptic(HapticFeedbackType.Warning);
      setShowLimitModal(true);
      return;
    }

    // Find selected mood details
    const selectedMoodData = moodOptions.find(m => m.value === selectedMood);
    if (!selectedMoodData) {
      triggerHaptic(HapticFeedbackType.Error);
      toast.error("Geçersiz ruh hali seçimi");
      return;
    }

    // Validate mood level (must be between 1-6)
    if (selectedMoodData.value < 1 || selectedMoodData.value > 6) {
      triggerHaptic(HapticFeedbackType.Error);
      toast.error("Geçersiz mood seviyesi");
      return;
    }

    // Sanitize and prepare data for API
    const sanitizedNote = sanitizeMoodNote(note);
    const formData = {
      mood_level: selectedMoodData.value,
      mood_emoji: selectedMoodData.emoji,
      activities: selectedTags.length > 0 ? selectedTags : null,
      note: sanitizedNote || null,
    };

    // Create mood entry
    const result = await createMood(formData);

    if (result) {
      // Success haptic feedback
      triggerHaptic(HapticFeedbackType.Success);
      setSubmitted(true);
      
      // Calculate updated stats after new entry
      // Note: We add the new entry to the existing entries array to calculate stats
      const updatedEntries = [...entries, result];
      const currentStreak = calculateStreak(updatedEntries);
      const longestStreak = getLongestStreak(updatedEntries);
      const totalEntries = updatedEntries.length;
      
      // Update user stats and check achievements
      try {
        await updateStats({
          total_mood_entries: totalEntries,
          current_streak: currentStreak,
          longest_streak: longestStreak,
        });
        
        // Check for newly unlocked achievements
        const newAchievements = await checkAchievements();
        if (newAchievements && newAchievements.length > 0) {
          setUnlockedAchievements(newAchievements);
        }
      } catch (error) {
        // Don't block the user flow if gamification fails
      }
      
      setTimeout(() => {
        toast.success("Mood'un kaydedildi! 🎉");
        navigate("/home");
      }, 2000);
    } else {
      triggerHaptic(HapticFeedbackType.Error);
      toast.error("Mood kaydedilemedi. Lütfen tekrar dene.");
    }
  };

  const selectedMoodData = moodOptions.find(m => m.value === selectedMood);

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background px-8 relative overflow-hidden">
        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-coral"
            initial={{
              x: "50%",
              y: "50%",
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 200}%`,
              y: `${50 + (Math.random() - 0.5) * 200}%`,
              scale: Math.random() * 2 + 1,
              opacity: 0,
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: "easeOut",
            }}
          />
        ))}
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center mb-6 shadow-xl"
        >
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-coral"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-coral"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Check size={64} className="text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Harika! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-muted-foreground text-center"
        >
          Bugünkü mood'un başarıyla kaydedildi
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-background">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 rounded-xl hover:bg-secondary/80 text-foreground transition-all hover:scale-105"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-coral" fill="currentColor" />
            <h2 className="text-foreground">Bugün Nasılsın?</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Selected Mood Display - Compact with Swipe */}
        <AnimatePresence mode="wait">
          {selectedMood !== null && selectedMoodData && (
            <motion.div
              key={selectedMood}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="flex flex-col items-center justify-center mb-6 touch-none"
              {...bind()}
              style={{ x, opacity }}
            >
              <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-2xl px-6 py-4 border border-border/50 shadow-sm">
                <div className="flex flex-col items-center gap-2">
                  <motion.span 
                    key={`emoji-${selectedMood}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 400 }}
                    className="text-[80px] leading-none"
                  >
                    {selectedMoodData.emoji}
                  </motion.span>
                  <motion.p
                    key={`label-${selectedMood}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    {selectedMoodData.label}
                  </motion.p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-2">👈 Kaydır 👉</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Selection Grid - 3x2 */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-3.5">
            {moodOptions.map((mood, index) => (
              <motion.button
                key={mood.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                onClick={() => {
                  triggerHaptic(HapticFeedbackType.Selection);
                  setSelectedMood(mood.value);
                }}
                className={`relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border-2 transition-all aspect-square overflow-hidden ${
                  selectedMood === mood.value
                    ? "border-coral shadow-lg shadow-coral/20 bg-gradient-to-br from-coral/10 to-coral/5"
                    : "border-transparent bg-card hover:bg-secondary/50 hover:shadow-md"
                }`}
              >
                {/* Pulse ring for selected mood */}
                {selectedMood === mood.value && (
                  <motion.div
                    className="absolute inset-0 border-2 border-coral rounded-2xl"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.1, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
                
                <motion.span 
                  className="text-[52px] leading-none relative z-10"
                  animate={selectedMood === mood.value ? { 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {mood.emoji}
                </motion.span>
                <motion.span 
                  className={`text-xs relative z-10 ${selectedMood === mood.value ? "text-coral font-bold" : "text-muted-foreground font-semibold"}`}
                  animate={selectedMood === mood.value ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {mood.label}
                </motion.span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activities Tags */}
        {selectedMood !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <MoodyCard className="mb-4" padding="lg">
              <p className="text-muted-foreground text-sm mb-4 text-center" style={{ fontWeight: 600 }}>
                Ne etkiliyor? (opsiyonel)
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {tags.map((tag, index) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    whileHover={{ 
                      scale: 1.08,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ 
                      scale: 0.92,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-gradient-to-r from-coral to-coral-dark text-white shadow-md shadow-coral/30"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <motion.span
                      animate={selectedTags.includes(tag) ? {
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {tag}
                    </motion.span>
                  </motion.button>
                ))}
              </div>
            </MoodyCard>

            {/* Note */}
            <MoodyCard className="mb-4" padding="lg">
              <MoodyTextarea
                label="Not ekle (opsiyonel)"
                placeholder="Bugün hakkında bir şeyler yaz..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </MoodyCard>

            {/* Kaydet Butonu veya Premium Upsell */}
            {!canAddMood ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLimitModal(true)}
                className="relative w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-coral via-coral-dark to-coral-light overflow-hidden"
              >
                <Crown size={22} />
                Premium'a Geç - Sınırsız Mood
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 20px 40px rgba(244, 105, 74, 0.4)",
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ 
                  scale: 0.97,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                onClick={handleSubmit}
                disabled={loading}
                className={`relative w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-xl transition-all overflow-hidden ${
                  loading 
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-coral via-coral-dark to-coral-light"
                }`}
              >
                {/* Shimmer effect */}
                {!loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "linear",
                    }}
                  />
                )}
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={22} />
                    </motion.div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles size={22} />
                    Mood'umu Kaydet
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Achievement Unlock Modals */}
      {unlockedAchievements.map((achievement, index) => (
        <AchievementUnlock
          key={achievement.id}
          achievement={achievement}
          isOpen={true}
          onClose={() => {
            setUnlockedAchievements(prev => prev.filter(a => a.id !== achievement.id));
          }}
          delay={index * 0.5}
        />
      ))}

      {/* Daily Limit Modal */}
      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Günlük Limitiniz Doldu"
      >
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-coral/10 mb-4"
          >
            <Lock size={40} className="text-coral" />
          </motion.div>

          <p className="text-foreground mb-2 text-lg font-semibold">
            Bugün {todayCount}/{dailyLimit} mood kaydettiniz
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Premium ile <strong className="text-coral">sınırsız mood</strong> kaydedebilir, 
            duygularınızı daha detaylı takip edebilirsiniz.
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowLimitModal(false);
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
              onClick={() => setShowLimitModal(false)}
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
