import React from "react";
import { motion } from "motion/react";
import { triggerHaptic, HapticFeedbackType } from "../../lib/haptics";

interface MoodyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
  disableHaptic?: boolean;
}

export function MoodyButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  disableHaptic = false,
  onClick,
  ...props
}: MoodyButtonProps) {
  const base = "rounded-2xl font-semibold disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2 relative overflow-hidden";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !disableHaptic) {
      // Light haptic for secondary/ghost/outline, medium for primary
      triggerHaptic(variant === "primary" ? HapticFeedbackType.Medium : HapticFeedbackType.Light);
    }
    onClick?.(e);
  };

  const variants = {
    primary: "bg-gradient-to-r from-coral via-coral-dark to-coral text-white shadow-lg hover:shadow-xl hover:shadow-coral/40",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "text-foreground hover:bg-secondary",
    outline: "border-2 border-border text-foreground hover:bg-secondary hover:border-coral",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { 
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={disabled ? {} : { 
        scale: 0.97,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {/* Shimmer effect for primary buttons */}
      {variant === "primary" && !disabled && (
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
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
