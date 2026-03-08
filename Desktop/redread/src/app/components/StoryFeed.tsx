import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { ANIMATION, COLORS, FONTS, Z_INDEX } from '../constants/design';

export const stories = [
  {
    id: '1',
    title: 'Bölüm I',
    content: "Odadaki sessizlik boş değildi. Asla söyleyemediğimiz şeylerin ağırlığıyla doluydu; güneş ışığına yakalanmış toz zerreleri gibi havada asılı kalmıştı.",
    author: 'A. H. K.'
  },
  {
    id: '2',
    title: 'Bölüm II',
    content: "Şehri çatıdan izledim. Ateşle değil, binlerce tutulmamış sözün yavaş ve kaçınılmaz çürüyüşüyle yanıyordu.",
    author: 'C. V.'
  },
  {
    id: '3',
    title: 'Bölüm III',
    content: "Gelgit gibi geri döndün. Tahmin edilebilir, yıkıcı... Ve sonunda tekrar çekildiğinde beni nefessiz bıraktın.",
    author: 'M. L.'
  },
  {
    id: '4',
    title: 'Bölüm IV',
    content: "Kalbim artık senin için atmıyor. Sadece tekliyor; soğukta çalışmaya çalışan bozuk bir motor gibi.",
    author: 'S. E.'
  }
];

export function StoryFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [burstStoryId, setBurstStoryId] = useState<string | null>(null);
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null);
  const [shareJumpId, setShareJumpId] = useState<string | null>(null);
  
  // Cleanup refs for timeouts
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
      // Cleanup all timeouts
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, [handleScroll]);

  const handleHeartClick = useCallback((storyId: string) => {
    setBurstStoryId(storyId);
    const timeout = setTimeout(() => {
      setBurstStoryId((current) => (current === storyId ? null : current));
    }, ANIMATION.HEART_BURST);
    timeoutRefs.current.push(timeout);
  }, []);

  const handleBookmarkClick = useCallback((storyId: string) => {
    setSavedStoryId(storyId);
    const timeout = setTimeout(() => {
      setSavedStoryId((current) => (current === storyId ? null : current));
    }, ANIMATION.BOOKMARK_SLIDE);
    timeoutRefs.current.push(timeout);
  }, []);

  const handleShareClick = useCallback((storyId: string) => {
    setShareJumpId(storyId);
    const timeout = setTimeout(() => {
      setShareJumpId((current) => (current === storyId ? null : current));
    }, ANIMATION.SHARE_JUMP);
    timeoutRefs.current.push(timeout);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative bg-[#0A0909] text-[#E8E6E1]"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {stories.map((story, index) => (
        <div key={story.id} className="h-screen w-full snap-start snap-always relative flex flex-col justify-center px-8 sm:px-16 md:px-32 mx-auto overflow-hidden">
          
          {/* Subtle Vignette for Depth (No harsh colors) */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_#050404_100%)] opacity-80" />

          {/* Elegant Fade Reveal Animation */}
          <motion.div
             initial={false}
             animate={{
               opacity: index === activeIndex ? 1 : 0,
               y: index === activeIndex ? 0 : 15
             }}
             transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: index === activeIndex ? 0.1 : 0 }}
             className="relative z-10 w-full flex flex-col items-center justify-center h-full max-w-2xl mx-auto"
          >
            {/* Elegant Serif Story Content */}
            <p
              className="font-serif text-2xl sm:text-3xl md:text-4xl leading-[1.8] text-center text-[#E8E6E1] selection:bg-[#E85D7A] selection:text-white"
              style={{ fontFamily: "'Lora', serif", textRendering: 'optimizeLegibility' }}
            >
              {story.content}
            </p>

            {/* Author / Title Meta Info */}
            <div className="mt-12 text-center flex flex-col items-center gap-2">
               <span className="text-[#E85D7A] text-xs font-medium tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                 {story.title}
               </span>
               <span className="text-[#8A8484] text-sm italic font-serif" style={{ fontFamily: "'Lora', serif" }}>
                 {story.author}
               </span>
            </div>
          </motion.div>

          {/* Refined, Subtle Interaction Overlay */}
          <div className="absolute right-5 bottom-32 sm:right-8 flex flex-col items-center gap-7 z-20 pointer-events-auto">
             <button
               onClick={() => handleHeartClick(story.id)}
               className="relative text-[#8A8484] hover:text-[#E85D7A] transition-colors duration-300 group"
               aria-label="Beğen"
             >
               <Heart size={26} strokeWidth={1.2} className="group-hover:fill-[#E85D7A]/10 transition-all duration-300" />

               {/* Kalp etrafında parçacık patlaması */}
               {burstStoryId === story.id && (
                 <div className="pointer-events-none absolute inset-0 -m-1">
                   {Array.from({ length: 12 }).map((_, i) => {
                     const angle = (i / 12) * Math.PI * 2;
                     const distance = 28;
                     return (
                       <motion.span
                         key={i}
                         initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                         animate={{
                           opacity: [0, 1, 0],
                           x: Math.cos(angle) * distance,
                           y: Math.sin(angle) * distance,
                           scale: [0.7, 1.1, 0.8],
                         }}
                         transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                         className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E85D7A]"
                       />
                     );
                   })}
                 </div>
               )}
             </button>

             {/* Yorum: tıklamada spring scale animasyonu */}
             <motion.button
               whileTap={{ scale: 0.75 }}
               whileHover={{ scale: 1.05 }}
               transition={{ type: 'spring', stiffness: 480, damping: 18 }}
               className="text-[#8A8484] hover:text-[#E8E6E1] transition-colors duration-300 group"
               aria-label="Yorum yap"
             >
               <MessageCircle size={26} strokeWidth={1.2} className="transition-all duration-300" />
             </motion.button>

             {/* Kaydet: bookmark slide-in animasyonu */}
             <button
               onClick={() => handleBookmarkClick(story.id)}
               className="text-[#8A8484] hover:text-[#E8E6E1] transition-colors duration-300 group overflow-visible"
               aria-label="Kaydet"
             >
               <motion.span
                 initial={false}
                 animate={
                   savedStoryId === story.id
                     ? { x: [10, 0], opacity: [0, 1] }
                     : { x: 0, opacity: 1 }
                 }
                 transition={{ type: 'spring', stiffness: 320, damping: 22, duration: 0.4 }}
                 className="inline-flex"
               >
                 <Bookmark size={26} strokeWidth={1.2} className="transition-all duration-300" />
               </motion.span>
             </button>

             {/* Paylaş: yukarı fırlama animasyonu */}
             <button
               onClick={() => handleShareClick(story.id)}
               className="text-[#8A8484] hover:text-[#E8E6E1] transition-colors duration-300 group"
               aria-label="Paylaş"
             >
               <motion.span
                 initial={false}
                 animate={
                   shareJumpId === story.id
                     ? { y: [0, -14, 0], scale: [1, 1.08, 1] }
                     : { y: 0, scale: 1 }
                 }
                 transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                 className="inline-flex"
               >
                 <Share2 size={26} strokeWidth={1.2} className="transition-all duration-300" />
               </motion.span>
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
