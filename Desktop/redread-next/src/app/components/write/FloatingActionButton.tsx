import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 
                 w-14 h-14 rounded-full 
                 bg-[#E85D7A] shadow-2xl
                 flex items-center justify-center
                 transition-transform"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          '0 20px 60px rgba(232, 93, 122, 0.3)',
          '0 20px 60px rgba(232, 93, 122, 0.5)',
          '0 20px 60px rgba(232, 93, 122, 0.3)',
        ],
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      aria-label="Yeni hikaye yaz"
    >
      <Plus size={28} strokeWidth={2.5} className="text-white" />
    </motion.button>
  );
}
