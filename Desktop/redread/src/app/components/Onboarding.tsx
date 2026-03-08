import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Mail } from 'lucide-react';

const genres = [
  "Romantizm", "Gotik", "Dram", 
  "Gizem", "Fantastik", "Psikolojik"
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = useCallback((g: string) => {
    setSelectedGenres(prev => 
      prev.includes(g) ? prev.filter(i => i !== g) : [...prev, g]
    );
  }, []);

  const nextStep = useCallback(() => {
    if (step < 3) setStep(step + 1);
    else onComplete();
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0B0B] text-[#E8E6E1] flex flex-col justify-center items-center px-6 overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* SCREEN 1: WELCOME */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-between h-full w-full py-20"
          >
            <div className="flex-1 flex flex-col justify-center items-center">
              <h1 
                className="text-5xl italic font-normal"
                style={{ fontFamily: "'Lora', serif", color: '#E85D7A' }}
              >
                redread
              </h1>
              <p 
                className="mt-6 text-lg italic"
                style={{ fontFamily: "'Lora', serif", color: '#8A8484' }}
              >
                Hissetmek için bir yer.
              </p>
            </div>

            <button 
              onClick={nextStep}
              className="w-full max-w-xs py-4 rounded-full text-sm font-medium tracking-widest"
              style={{ 
                backgroundColor: '#E85D7A', 
                color: '#0B0B0B',
                fontFamily: "'Inter', sans-serif" 
              }}
              aria-label="Başla"
            >
              BAŞLA
            </button>
          </motion.div>
        )}

        {/* SCREEN 2: GENRE SELECTION */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <h2 
              className="text-2xl mb-2 text-center"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Ruhunu ne besler?
            </h2>
            
            <div className="flex flex-wrap justify-center gap-3 my-12" role="group" aria-label="Tür seçimi">
              {genres.map(g => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-5 py-2.5 rounded-full text-sm transition-all duration-300 border ${
                      isSelected 
                        ? 'border-[#E85D7A] bg-[#E85D7A]/10 text-[#E8E6E1]' 
                        : 'border-[#4a4644] text-[#8A8484] hover:border-[#8A8484]'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    aria-pressed={isSelected}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={nextStep}
              className={`w-full py-4 rounded-full border text-sm tracking-widest transition-all flex items-center justify-center gap-2 ${
                selectedGenres.length > 0 
                  ? 'border-[#E85D7A]/50 text-[#E8E6E1] hover:bg-[#E85D7A]/10' 
                  : 'border-[#4a4644] text-[#4a4644]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              aria-label="İleri"
            >
              İLERİ
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* SCREEN 3: ACCOUNT */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <h2 
              className="text-2xl mb-2 text-center"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Satır aralarına katıl
            </h2>
            <p 
              className="text-sm italic mb-10 text-center"
              style={{ fontFamily: "'Lora', serif", color: '#8A8484' }}
            >
              Kütüphaneni oluşturmak için giriş yap.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={onComplete}
                className="w-full py-3.5 px-4 rounded-lg border border-[#4a4644] text-[#E8E6E1] text-sm font-medium hover:bg-[#E8E6E1]/5 transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}
                aria-label="Apple ile giriş yap"
              >
                Apple ile Devam Et
              </button>
              <button 
                onClick={onComplete}
                className="w-full py-3.5 px-4 rounded-lg border border-[#4a4644] text-[#E8E6E1] text-sm font-medium hover:bg-[#E8E6E1]/5 transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}
                aria-label="Google ile giriş yap"
              >
                Google ile Devam Et
              </button>
              <button 
                onClick={onComplete}
                className="w-full py-3.5 px-4 rounded-lg border border-[#4a4644] text-[#8A8484] text-sm font-medium hover:bg-[#E8E6E1]/5 hover:text-[#E8E6E1] transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
                aria-label="E-posta ile giriş yap"
              >
                <Mail size={16} />
                E-posta ile Devam Et
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
