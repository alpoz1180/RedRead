/**
 * Offline Sync Hook
 * Handles offline mood entry storage and synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Configure localforage
const offlineStore = localforage.createInstance({
  name: 'yourmoody',
  storeName: 'offline_moods',
});

export interface OfflineMoodEntry {
  id: string; // Temporary local ID
  mood_level: number;
  mood_emoji: string;
  activities: string[] | null;
  note: string | null;
  created_at: string;
  synced: boolean;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Sync offline entries to Supabase
  const syncOfflineEntries = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      setIsSyncing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all offline entries
      const keys = await offlineStore.keys();
      const entries = await Promise.all(
        keys.map(key => offlineStore.getItem<OfflineMoodEntry>(key))
      );
      
      const unsyncedEntries = entries.filter(e => e && !e.synced) as OfflineMoodEntry[];
      
      if (unsyncedEntries.length === 0) {
        // No entries to sync, exit silently
        return;
      }

      let syncedCount = 0;
      let failedCount = 0;

      // Sync each entry
      for (const entry of unsyncedEntries) {
        try {
          const { error } = await supabase
            .from('mood_entries')
            .insert({
              user_id: user.id,
              mood_level: entry.mood_level,
              mood_emoji: entry.mood_emoji,
              activities: entry.activities,
              note: entry.note,
              created_at: entry.created_at,
            });

          if (error) throw error;

          // Mark as synced
          await offlineStore.setItem(entry.id, { ...entry, synced: true });
          syncedCount++;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error syncing entry:', entry.id, error);
          }
          failedCount++;
        }
      }

      // Clean up synced entries (older than 7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      for (const entry of unsyncedEntries) {
        if (entry.synced && new Date(entry.created_at).getTime() < sevenDaysAgo) {
          await offlineStore.removeItem(entry.id);
        }
      }

      await updatePendingCount();

      if (syncedCount > 0) {
        toast.success(`${syncedCount} kayıt senkronize edildi! 🎉`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} kayıt senkronize edilemedi`);
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error syncing offline entries:', error);
      }
      toast.error('Senkronizasyon hatası');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    
    if (online) {
      toast.success('İnternet bağlantısı geri geldi', {
        description: 'Offline kayıtlar senkronize ediliyor...',
      });
      syncOfflineEntries();
    } else {
      toast.warning('İnternet bağlantısı kesildi', {
        description: 'Kayıtlar offline olarak saklanacak',
      });
    }
  }, [syncOfflineEntries]);

  // Listen to online/offline events
  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  // Get pending offline entries count
  const updatePendingCount = useCallback(async () => {
    try {
      const keys = await offlineStore.keys();
      const entries = await Promise.all(
        keys.map(key => offlineStore.getItem<OfflineMoodEntry>(key))
      );
      const pending = entries.filter(e => e && !e.synced).length;
      setPendingCount(pending);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error counting pending entries:', error);
      }
    }
  }, []);

  // Save mood entry offline
  const saveOffline = useCallback(async (entry: Omit<OfflineMoodEntry, 'id' | 'synced'>) => {
    try {
      const offlineEntry: OfflineMoodEntry = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...entry,
        synced: false,
      };

      await offlineStore.setItem(offlineEntry.id, offlineEntry);
      await updatePendingCount();
      
      return offlineEntry;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving offline:', error);
      }
      throw error;
    }
  }, [updatePendingCount]);

  // Auto-sync when coming online (with debounce to avoid race conditions)
  useEffect(() => {
    if (isOnline && !isSyncing) {
      const timeout = setTimeout(() => {
        syncOfflineEntries();
      }, 1000); // Wait 1 second before syncing
      
      return () => clearTimeout(timeout);
    }
  }, [isOnline, isSyncing, syncOfflineEntries]);

  // Update pending count on mount
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // Manual sync trigger
  const manualSync = useCallback(async () => {
    if (!isOnline) {
      toast.warning('İnternet bağlantısı yok');
      return;
    }
    await syncOfflineEntries();
  }, [isOnline, syncOfflineEntries]);

  // Clear all offline data (for debugging)
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStore.clear();
      await updatePendingCount();
      toast.success('Offline veriler temizlendi');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error clearing offline data:', error);
      }
      toast.error('Temizleme hatası');
    }
  }, [updatePendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    saveOffline,
    syncOfflineEntries,
    manualSync,
    clearOfflineData,
  };
}
