import { motion } from "motion/react";
import { cn } from "./utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "wave",
}: SkeletonProps) {
  const baseClasses = "bg-secondary/50 dark:bg-secondary/30";
  
  const variantClasses = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || (variant === "text" ? "1rem" : "100%"),
  };

  if (animation === "pulse") {
    return (
      <motion.div
        className={cn(baseClasses, variantClasses[variant], className)}
        style={style}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  if (animation === "wave") {
    return (
      <div
        className={cn(baseClasses, variantClasses[variant], className, "relative overflow-hidden")}
        style={style}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Preset Skeleton Components
export function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
      <Skeleton height="1.5rem" width="60%" />
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="8rem" />
    </div>
  );
}

export function SkeletonMoodCard() {
  return (
    <div className="bg-card rounded-2xl p-5 space-y-3 border border-border">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton height="1rem" width="50%" />
          <Skeleton height="0.75rem" width="30%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: "spring" }}
        >
          <SkeletonMoodCard />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
      <div className="flex items-center justify-between">
        <Skeleton height="1.5rem" width="40%" />
        <Skeleton height="1rem" width="20%" />
      </div>
      <div className="flex items-end justify-between h-40 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            height={`${Math.random() * 60 + 40}%`}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
        >
          <div className="bg-card rounded-2xl p-4 text-center space-y-2 border border-border">
            <Skeleton height="2rem" width="3rem" className="mx-auto" />
            <Skeleton height="0.75rem" width="80%" className="mx-auto" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
