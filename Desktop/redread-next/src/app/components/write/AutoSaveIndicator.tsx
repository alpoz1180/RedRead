import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          {status === 'saving' && (
            <>
              <Loader2 size={16} className="text-[#8A8484] animate-spin" />
              <span className="text-xs font-sans text-[#8A8484]">Kaydediliyor...</span>
            </>
          )}

          {status === 'saved' && (
            <>
              <Check size={16} strokeWidth={2.5} className="text-[#4ADE80]" />
              <span className="text-xs font-sans text-[#4ADE80]">Taslak kaydedildi</span>
            </>
          )}

          {status === 'error' && (
            <span className="text-xs font-sans text-[#EF4444]">Kayıt başarısız</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
