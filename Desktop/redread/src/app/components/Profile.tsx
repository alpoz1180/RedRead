import { useState } from 'react';
import { Settings, Bookmark, AlignLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const myStories = [
  {
    id: 'p1',
    title: 'Küller ve Şarap',
    date: '12 Eki',
    snippet: "Bir zamanlar tüm kelimeleri ezbere bildiğimizi sanırdık. Oysa sadece susmayı öğrenmiştik."
  },
  {
    id: 'p2',
    title: 'Geceyarısı Kütüphanesi',
    date: '05 Eki',
    snippet: "Kitapların tozlu sayfalarında aradığım şey bir kahraman değildi, sadece kendi yansımamdı."
  },
  {
    id: 'p3',
    title: 'Eksik Cümleler',
    date: '28 Eyl',
    snippet: "Bana yarım bıraktığın o cümlenin sonunu getirmeyeceğim. Bırak o boşluk, senin anıtın olsun."
  }
];

export function Profile() {
  const [activeProfileTab, setActiveProfileTab] = useState<'stories' | 'saved'>('stories');

  return (
    <div className="h-screen w-full overflow-y-auto hide-scrollbar pb-32 pt-28 px-4 sm:px-6 md:px-24 mx-auto max-w-2xl bg-[#0A0909]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Profil Başlığı (Header) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center text-center mt-2"
      >
        <div className="relative w-24 h-24 mb-4 rounded-full p-[2px] border border-[#E85D7A]/40 shadow-[0_0_20px_rgba(232,93,122,0.1)]">
          <ImageWithFallback 
             src="https://images.unsplash.com/photo-1769650795970-89690d0f535a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb29keSUyMGVsZWdhbnQlMjB3b21hbiUyMHBvcnRyYWl0JTIwZGFyayUyMGFjYWRlbWlhfGVufDF8fHx8MTc3Mjk4MDA2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
             alt="Aylin Karaca"
             className="w-full h-full object-cover rounded-full saturate-50 contrast-125"
          />
        </div>
        
        <h1 className="text-2xl text-[#E8E6E1] mb-1 tracking-wide" style={{ fontFamily: "'Lora', serif" }}>Aylin Karaca</h1>
        <p className="text-xs text-[#E85D7A] font-medium tracking-[0.1em] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>@aylin.yazar</p>
        
        <p className="text-[#8A8484] text-xs max-w-[280px] italic leading-[1.8]" style={{ fontFamily: "'Lora', serif" }}>
          "Kelimelerin arasına saklanmış bir sessizlik avcısı. Gece ve mürekkep..."
        </p>

        {/* İstatistikler */}
        <div className="flex gap-8 mt-6 py-4 w-full justify-center border-t border-b border-[#E8E6E1]/5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#E8E6E1] text-lg font-light" style={{ fontFamily: "'Lora', serif" }}>12</span>
            <span className="text-[#8A8484] text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>Eser</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#E8E6E1] text-lg font-light" style={{ fontFamily: "'Lora', serif" }}>1.4k</span>
            <span className="text-[#8A8484] text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>Okur</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#E8E6E1] text-lg font-light" style={{ fontFamily: "'Lora', serif" }}>84</span>
            <span className="text-[#8A8484] text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>Takip</span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex gap-3 mt-6 w-full justify-center">
          <button 
            className="flex-1 max-w-[200px] py-2.5 rounded-full border border-[#8A8484]/30 text-[10px] tracking-[0.15em] uppercase text-[#E8E6E1] hover:bg-[#E85D7A]/10 hover:border-[#E85D7A]/50 hover:text-[#E85D7A] transition-all duration-500"
            aria-label="Profili düzenle"
          >
            Profili Düzenle
          </button>
          <button 
            className="p-2.5 rounded-full border border-[#8A8484]/30 text-[#8A8484] hover:text-[#E8E6E1] hover:bg-[#E8E6E1]/5 transition-all duration-500 flex items-center justify-center"
            aria-label="Ayarlar"
          >
            <Settings size={16} strokeWidth={1.2} />
          </button>
        </div>
      </motion.div>

      {/* Sekmeler (Tabs) */}
      <div className="flex justify-center gap-10 mt-10 mb-6 relative" role="tablist">
        <button 
          onClick={() => setActiveProfileTab('stories')}
          className={`flex items-center gap-2 pb-3 transition-all duration-500 z-10 ${activeProfileTab === 'stories' ? 'text-[#E8E6E1]' : 'text-[#8A8484] hover:text-[#E8E6E1]/70'}`}
          role="tab"
          aria-selected={activeProfileTab === 'stories'}
          aria-label="Satırlarım"
        >
          <AlignLeft size={14} strokeWidth={1.5} />
          <span className="tracking-[0.15em] uppercase text-[10px] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Satırlarım</span>
        </button>
        
        <button 
          onClick={() => setActiveProfileTab('saved')}
          className={`flex items-center gap-2 pb-3 transition-all duration-500 z-10 ${activeProfileTab === 'saved' ? 'text-[#E8E6E1]' : 'text-[#8A8484] hover:text-[#E8E6E1]/70'}`}
          role="tab"
          aria-selected={activeProfileTab === 'saved'}
          aria-label="Kütüphane"
        >
          <Bookmark size={14} strokeWidth={1.5} />
          <span className="tracking-[0.15em] uppercase text-[10px] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Kütüphane</span>
        </button>

        {/* Çizgi Animasyonu */}
        <div className="absolute bottom-0 w-full h-[1px] bg-[#E8E6E1]/10">
          <motion.div 
            className="absolute top-0 h-[1px] bg-[#E85D7A]"
            initial={false}
            animate={{ 
              left: activeProfileTab === 'stories' ? 'calc(50% - 85px)' : 'calc(50% + 22px)',
              width: '64px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* İçerik Listesi */}
      <motion.div 
        key={activeProfileTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-3 pb-12"
        role="tabpanel"
      >
        {activeProfileTab === 'stories' ? (
          myStories.map((story) => (
            <div key={story.id} className="group flex flex-col gap-2 p-5 rounded-lg border border-[#E8E6E1]/5 bg-[#0A0909] active:bg-[#E85D7A]/5 transition-all duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-[#E85D7A] text-[10px] font-medium tracking-[0.15em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{story.title}</h3>
                <span className="text-[#8A8484] text-[9px] tracking-widest">{story.date}</span>
              </div>
              <p className="text-[#E8E6E1] text-sm leading-[1.7] opacity-90" style={{ fontFamily: "'Lora', serif" }}>
                "{story.snippet}"
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-[#8A8484] text-xs italic" style={{ fontFamily: "'Lora', serif" }}>
            Kütüphane sessiz. Henüz saklanmış bir kelime yok.
          </div>
        )}
      </motion.div>
    </div>
  );
}
