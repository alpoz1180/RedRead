import { motion } from 'motion/react';

interface CharacterCounterProps {
  current: number;
  max?: number;
  min?: number;
  showMinimum?: boolean;
}

function getCounterColor(current: number, max?: number, min?: number): string {
  if (max) {
    const percentage = (current / max) * 100;
    if (percentage < 80) return '#4ADE80'; // Green
    if (percentage < 95) return '#FBBF24'; // Yellow
    return '#EF4444'; // Red
  }
  
  if (min && current < min) {
    return '#EF4444'; // Red if below minimum
  }
  
  return '#4ADE80'; // Green
}

export function CharacterCounter({ 
  current, 
  max, 
  min, 
  showMinimum = false 
}: CharacterCounterProps) {
  const color = getCounterColor(current, max, min);
  
  return (
    <div className="flex items-center justify-between text-xs font-sans">
      {showMinimum && min && current < min && (
        <span className="text-[#EF4444]">
          En az {min} karakter gerekli
        </span>
      )}
      
      <motion.span
        animate={{ color }}
        transition={{ duration: 0.3 }}
        className="ml-auto"
      >
        {current}{max && `/${max}`}
      </motion.span>
    </div>
  );
}
