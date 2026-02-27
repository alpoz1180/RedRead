import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span className={`${sizes[size]} tracking-tight ${className}`} style={{ fontWeight: 800 }}>
      <span className="text-muted-foreground/60">Your</span>
      <span className="text-foreground">Moody</span>
    </span>
  );
}
