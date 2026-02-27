import React from "react";

interface MoodyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function MoodyInput({ label, error, className = "", ...props }: MoodyInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-foreground">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-2xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all ${error ? "border-error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}

interface MoodyTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function MoodyTextarea({ label, error, className = "", ...props }: MoodyTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-foreground">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 rounded-2xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all resize-none ${error ? "border-error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
