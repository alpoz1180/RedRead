import { motion, AnimatePresence } from "motion/react";
import { Achievement } from "../../lib/types";
import { X } from "lucide-react";

interface AchievementUnlockProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-card border-2 border-coral rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden"
        >
          {/* Confetti particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#F4694A', '#FFD700', '#FF69B4', '#00CED1'][i % 4],
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.02,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-10"
          >
            <X size={20} className="text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="text-center relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
              }}
              className="mb-4"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="text-8xl inline-block"
              >
                {achievement.emoji}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Başarı Kazandın!
              </h2>
              <h3 className="text-xl font-semibold text-coral mb-3">
                {achievement.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {achievement.description}
              </p>

              {/* XP Reward */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-coral/20 to-coral/10 border border-coral/30 rounded-full px-4 py-2"
              >
                <span className="text-2xl">✨</span>
                <span className="font-bold text-coral">+{achievement.xp_reward} XP</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-coral/20 to-transparent rounded-3xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
