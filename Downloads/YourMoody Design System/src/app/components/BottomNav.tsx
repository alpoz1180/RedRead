import React from "react";
import { Home, Plus, Calendar, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 border-t border-[rgba(255,255,255,0.08)]"
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 5, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center h-16 pb-[env(safe-area-inset-bottom)]">

        <button
          onClick={() => navigate("/home")}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isActive("/home") ? "text-coral" : "text-muted-foreground"
          }`}
        >
          <Home size={22} strokeWidth={isActive("/home") ? 2.5 : 2} />
          <span className="text-[10px]" style={{ fontWeight: isActive("/home") ? 700 : 500 }}>Ana Sayfa</span>
        </button>

        <button
          onClick={() => navigate("/home/calendar")}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isActive("/home/calendar") ? "text-coral" : "text-muted-foreground"
          }`}
        >
          <Calendar size={22} strokeWidth={isActive("/home/calendar") ? 2.5 : 2} />
          <span className="text-[10px]" style={{ fontWeight: isActive("/home/calendar") ? 700 : 500 }}>Takvim</span>
        </button>

        <button
          onClick={() => navigate("/home/mood")}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
        >
          <div className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Plus size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] text-coral font-bold">Mood</span>
        </button>

        <button
          onClick={() => navigate("/home/profile")}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
            isActive("/home/profile") ? "text-coral" : "text-muted-foreground"
          }`}
        >
          <User size={22} strokeWidth={isActive("/home/profile") ? 2.5 : 2} />
          <span className="text-[10px]" style={{ fontWeight: isActive("/home/profile") ? 700 : 500 }}>Profil</span>
        </button>

      </div>
    </nav>
  );
}