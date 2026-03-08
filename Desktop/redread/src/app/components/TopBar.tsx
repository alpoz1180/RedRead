export function TopBar({ activeTab }: { activeTab: 'home' | 'profile' }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-center items-center pointer-events-none">
       <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#050404] to-transparent pointer-events-none" />
       
       {/* Sophisticated Title dynamically changing */}
       <div
         className="text-[#E85D7A] text-sm md:text-base font-medium tracking-[0.4em] uppercase pointer-events-auto transition-all duration-500"
         style={{ fontFamily: "'Inter', sans-serif" }}
       >
         {activeTab === 'home' ? 'Redread' : 'Profil'}
       </div>
    </div>
  );
}
