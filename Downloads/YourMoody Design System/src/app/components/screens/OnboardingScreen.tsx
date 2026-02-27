import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';
import logo from '../../../assets/logo.png';

const slides = [
  {
    id: 1,
    icon: null,
    title: 'Duygusal farkındalık',
    titleAccent: 'yolculuğuna hoş geldin',
    subtitle: null,
    showLogo: true,
  },
  {
    id: 2,
    icon: 'moods',
    title: 'Her gün nasıl hissettiğini',
    titleAccent: 'kaydet',
    subtitle: 'Sadece birkaç saniye sürer',
    showLogo: false,
  },
  {
    id: 3,
    icon: 'chart',
    title: 'Zamanla paternlerini',
    titleAccent: 'keşfet',
    subtitle: 'Kendini daha iyi tanı',
    showLogo: false,
  },
  {
    id: 4,
    icon: 'ai',
    title: 'Yapay zeka destekli',
    titleAccent: 'kişisel içgörüler',
    subtitle: 'Sana özel öneriler al',
    isPremium: true,
    showLogo: false,
  },
  {
    id: 5,
    icon: 'celebration',
    title: 'Hazırsın!',
    titleAccent: null,
    subtitle: 'Duygusal yolculuğuna başla',
    isFinal: true,
    showLogo: false,
  },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/login', { replace: true });
  };

  const handleStartFree = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/login', { replace: true });
  };

  const handleStartPremium = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/home/premium', { replace: true });
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocity = 500;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
      handlePrev();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#2d0f0f] via-[#1a0a0a] to-[#0f0a1a] flex flex-col overflow-hidden relative">
      {/* Floating particles background - Slide 1 only */}
      {currentSlide === 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-coral/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute top-8 right-8 z-10">
          <button
            onClick={handleSkip}
            className="text-white/40 text-sm font-normal hover:text-white/60 transition-colors"
          >
            Atla
          </button>
        </div>
      )}

      {/* Slides Container */}
      <div className="flex-1 flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md text-center"
          >
            {/* Icon or Logo */}
            <div className="mb-16 flex justify-center">
              {slide.showLogo && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="relative"
                >
                  <img 
                    src={logo} 
                    alt="YourMoody Logo" 
                    className="w-[120px] h-[120px] relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 60px rgba(244, 105, 74, 0.3))',
                    }}
                  />
                  {/* Additional glow layer */}
                  <div className="absolute inset-0 blur-3xl bg-coral/20 scale-110" />
                </motion.div>
              )}
              
              {slide.icon === 'moods' && (
                <div className="flex gap-6">
                  {['😢', '😔', '😐', '😊', '😄'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                      }}
                      transition={{ 
                        delay: i * 0.1,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      whileHover={{ scale: 1.2 }}
                      className="text-6xl cursor-default"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              )}

              {slide.icon === 'chart' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* Simple line chart illustration */}
                  <div className="w-48 h-32 relative">
                    <svg viewBox="0 0 200 120" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="20" y1="20" x2="20" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      
                      {/* Chart line */}
                      <motion.path
                        d="M 20,80 L 50,60 L 80,70 L 110,40 L 140,50 L 170,30"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                      />
                      
                      {/* Dots */}
                      {[20, 50, 80, 110, 140, 170].map((x, i) => {
                        const y = [80, 60, 70, 40, 50, 30][i];
                        return (
                          <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#f4694a"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.15 }}
                          />
                        );
                      })}
                      
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                          <stop offset="100%" stopColor="#f4694a" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>
              )}

              {slide.icon === 'ai' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* Pulsing glow effect */}
                  <motion.div
                    className="absolute inset-0 blur-3xl bg-coral/40 scale-150"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1.5, 1.8, 1.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <Sparkles 
                    size={64} 
                    strokeWidth={1.5} 
                    className="text-white relative z-10"
                  />
                  {/* Small sparkles around */}
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-coral rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-40px)`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {slide.icon === 'celebration' && (
                <div className="relative w-32 h-32">
                  {/* Confetti particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        backgroundColor: i % 3 === 0 ? '#f4694a' : i % 3 === 1 ? '#ffd700' : '#60a5fa',
                      }}
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        x: (Math.random() - 0.5) * 120,
                        y: (Math.random() - 0.5) * 120,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0.5],
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                  {/* Center emoji */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-6xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    🎉
                  </motion.div>
                </div>
              )}
            </div>

            {/* Premium Badge (Slide 4) */}
            {slide.isPremium && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex justify-center"
              >
                <div className="px-4 py-1.5 rounded-full bg-coral/10 border border-coral/30">
                  <span className="text-coral text-xs font-medium">Premium</span>
                </div>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-semibold mb-4 leading-tight px-4"
            >
              <span className="text-white">{slide.title}</span>
              {slide.titleAccent && (
                <>
                  {' '}
                  <span className="text-coral">{slide.titleAccent}</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/60 text-lg font-normal"
              >
                {slide.subtitle}
              </motion.p>
            )}

            {/* Final Slide Buttons */}
            {slide.isFinal && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 space-y-4"
              >
                <div className="flex gap-4">
                  <motion.button
                    onClick={handleStartFree}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-white/20 text-white font-medium hover:border-white/40 transition-all"
                  >
                    Ücretsiz Başla
                  </motion.button>
                  <motion.button
                    onClick={handleStartPremium}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 px-6 rounded-2xl bg-coral text-white font-medium hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
                  >
                    Premium ile Başla
                  </motion.button>
                </div>
                <p className="text-white/40 text-sm font-normal mt-6">
                  İstediğin zaman yükseltebilirsin
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="pb-16 flex justify-center gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="transition-all group"
          >
            <motion.div
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-10 bg-coral shadow-lg shadow-coral/40'
                  : 'w-2 bg-white/30 group-hover:bg-white/50'
              }`}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </button>
        ))}
      </div>

      {/* Swipe Hint (First Slide Only) */}
      {currentSlide === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2"
        >
          <p className="text-white/30 text-xs font-normal flex items-center gap-2">
            <span>←</span>
            Kaydırarak ilerle
            <span>→</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
