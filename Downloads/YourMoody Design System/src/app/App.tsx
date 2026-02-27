import { useEffect, Suspense } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes.tsx";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { setupNotificationListeners } from "../lib/notifications";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { OfflineIndicator } from "./components/OfflineIndicator";
import ErrorBoundary from "./components/ErrorBoundary";

// Loading fallback component with glassmorphism design
function LoadingFallback() {
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

function AppContent() {
  // Setup on mount
  useEffect(() => {
    // Setup notification listeners
    setupNotificationListeners();
  }, []);

  return (
    <div className="h-full w-full bg-background">
      <OfflineIndicator />
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            fontFamily: "'Nunito', sans-serif",
          },
        }}
      />
    </div>
  );
}

export default function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
