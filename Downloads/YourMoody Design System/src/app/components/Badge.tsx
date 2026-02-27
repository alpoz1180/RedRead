import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "coral" | "success" | "warning" | "error";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    coral: "bg-coral/10 text-coral",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    error: "bg-error-light text-error",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${variants[variant]} ${className}`} style={{ fontWeight: 700 }}>
      {children}
    </span>
  );
}
