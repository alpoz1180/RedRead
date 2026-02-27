import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { useAuth } from "../../contexts/AuthContext";

export function Layout() {
  const location = useLocation();
  const hideNav = location.pathname === "/onboarding";
  const { user } = useAuth();
  const { syncOfflineEntries } = useOfflineSync();

  // Show footer only on legal pages
  const showFooter = location.pathname === "/privacy" || location.pathname === "/terms";

  // Sync offline entries when user is authenticated
  useEffect(() => {
    if (user) {
      syncOfflineEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, not syncOfflineEntries

  return (
    <div className="h-full w-full max-w-md mx-auto relative bg-background flex flex-col">
      {/* Page content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="flex-1 pb-20"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      
      {/* Footer - only visible on /privacy and /terms pages */}
      {showFooter && <Footer />}
      
      {/* Bottom nav outside AnimatePresence - always fixed */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
