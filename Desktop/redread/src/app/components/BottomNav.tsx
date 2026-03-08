import { Home, Feather, User } from 'lucide-react';

export function BottomNav({ activeTab, onTabChange }: { activeTab: 'home' | 'profile', onTabChange: (tab: 'home' | 'profile') => void }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pb-6 pt-12 px-6 sm:px-24 pointer-events-none">
       <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050404] via-[#050404]/90 to-transparent pointer-events-none" />

       <div className="max-w-[280px] mx-auto flex justify-between items-center pointer-events-auto relative z-10">
         <button 
           onClick={() => onTabChange('home')}
           className={`p-3 transition-all duration-500 ${activeTab === 'home' ? 'text-[#E8E6E1]' : 'text-[#8A8484] hover:text-[#E8E6E1]'}`}
           aria-label="Ana Sayfa"
         >
           <Home size={22} strokeWidth={1.5} />
         </button>
         
         <button 
           className="p-3 text-[#E85D7A] hover:text-[#A73738] transition-all duration-300 transform hover:-translate-y-0.5"
           aria-label="Yeni Hikaye Yaz"
         >
           <Feather size={26} strokeWidth={1.5} />
         </button>
         
         <button 
           onClick={() => onTabChange('profile')}
           className={`p-3 transition-all duration-500 ${activeTab === 'profile' ? 'text-[#E8E6E1]' : 'text-[#8A8484] hover:text-[#E8E6E1]'}`}
           aria-label="Profil"
         >
           <User size={22} strokeWidth={1.5} />
         </button>
       </div>
    </div>
  );
}
