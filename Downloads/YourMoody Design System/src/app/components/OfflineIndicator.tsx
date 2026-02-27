import { motion, AnimatePresence } from "motion/react";
import { WifiOff, CloudOff, RefreshCw } from "lucide-react";
import { useOfflineSync } from "../../hooks/useOfflineSync";

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, manualSync } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <AnimatePresence>
      {(!isOnline || pendingCount > 0) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="max-w-md mx-auto px-4 pt-2 pointer-events-auto">
            <motion.button
              onClick={manualSync}
              disabled={!isOnline || isSyncing}
              whileTap={{ scale: 0.98 }}
              className={`w-full rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 transition-colors ${
                !isOnline
                  ? 'bg-red-500/90 backdrop-blur-sm'
                  : 'bg-orange-500/90 backdrop-blur-sm hover:bg-orange-600/90'
              }`}
            >
              {isSyncing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={20} className="text-white" />
                </motion.div>
              ) : !isOnline ? (
                <WifiOff size={20} className="text-white" />
              ) : (
                <CloudOff size={20} className="text-white" />
              )}
              
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-sm">
                  {isSyncing
                    ? 'Senkronize ediliyor...'
                    : !isOnline
                    ? 'Offline Mod'
                    : `${pendingCount} Kayıt Bekliyor`}
                </p>
                {!isSyncing && (
                  <p className="text-white/80 text-xs">
                    {!isOnline
                      ? 'İnternet bağlantısı yok'
                      : 'Senkronize etmek için tıkla'}
                  </p>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
