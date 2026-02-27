import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../lib/types';
import { toast } from 'sonner';
import { scheduleDailyReminder, cancelDailyReminder } from '../lib/notifications';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Try to fetch existing settings
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no settings exist, create default settings
        if (fetchError.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              reminder_enabled: false,
              reminder_time: '20:00:00',
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          setSettings(newSettings);
        } else {
          throw fetchError;
        }
      } else {
        setSettings(data);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching user settings:', err);
      }
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings with debounce
  const updateSettings = useCallback(async (updates: Partial<Pick<UserSettings, 'reminder_enabled' | 'reminder_time'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistic update
      setSettings(prev => prev ? { ...prev, ...updates } : null);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the actual database update
      debounceTimerRef.current = setTimeout(async () => {
        const { data, error: updateError } = await supabase
          .from('user_settings')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setSettings(data);
      }, 500); // 500ms debounce

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error updating user settings:', err);
      }
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      toast.error('Ayarlar kaydedilemedi');
      // Revert optimistic update
      await fetchSettings();
    }
  }, [fetchSettings]);

  // Toggle reminder enabled
  const toggleReminder = useCallback(async (enabled: boolean) => {
    await updateSettings({ reminder_enabled: enabled });
    
    // Schedule or cancel notification
    if (enabled && settings?.reminder_time) {
      const [hour, minute] = settings.reminder_time.split(':').map(Number);
      await scheduleDailyReminder(hour, minute);
    } else {
      await cancelDailyReminder();
    }
  }, [updateSettings, settings]);

  // Update reminder time
  const updateReminderTime = useCallback(async (time: string) => {
    // Convert HH:MM to HH:MM:SS format
    const formattedTime = time.includes(':') && time.split(':').length === 2 
      ? `${time}:00` 
      : time;
    
    await updateSettings({ reminder_time: formattedTime });
    
    // Reschedule notification if enabled
    if (settings?.reminder_enabled) {
      const [hour, minute] = time.split(':').map(Number);
      await scheduleDailyReminder(hour, minute);
    }
  }, [updateSettings, settings]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
    toggleReminder,
    updateReminderTime,
  };
}
