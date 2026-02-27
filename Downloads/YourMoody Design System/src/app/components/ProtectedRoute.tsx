import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();

  // Debug logs (temporary)
  if (import.meta.env.DEV) {
    console.log('[ProtectedRoute] Render:', { 
      user: user?.email, 
      hasSession: !!session,
      loading,
      hasUser: !!user 
    });
  }

  // CRITICAL: Wait for auth to finish loading before making decisions
  if (loading) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] Loading state - showing spinner');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2d0f0f] via-[#1a0a0a] to-[#0f0a1a]">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/8 p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only redirect when loading is complete AND both user and session are null
  // Check session too because user might be temporarily null during re-renders
  if (!user && !session) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] No user AND no session - redirecting to login');
    }
    return <Navigate to="/login" replace />;
  }

  if (import.meta.env.DEV) {
    console.log('[ProtectedRoute] Authenticated - rendering children');
  }
  return <>{children}</>;
}
