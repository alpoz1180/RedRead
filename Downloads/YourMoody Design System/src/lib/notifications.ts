/**
 * Push Notifications Utility
 * Uses Capacitor Local Notifications for native iOS/Android
 * Gracefully degrades on web (shows toast instead)
 */

import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { toast } from 'sonner';

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Schedule daily mood reminder
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  try {
    // Check permission
    const hasPermission = await areNotificationsEnabled();
    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('Bildirim izni reddedildi');
        return;
      }
    }

    // Cancel existing reminders
    await cancelDailyReminder();

    // Calculate next notification time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule repeating daily notification
    const options: ScheduleOptions = {
      notifications: [
        {
          id: 1, // Fixed ID for daily reminder
          title: 'Bugünkü mood\'unu kaydettin mi? 🌟',
          body: 'Kendini nasıl hissettiğini kaydetmek için birkaç saniye ayır',
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day',
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'daily_reminder',
          },
        },
      ],
    };

    await LocalNotifications.schedule(options);
  } catch (error) {
    // Silently fail on web
  }
}

/**
 * Cancel daily reminder
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Schedule streak warning (fires at 20:00 if no mood entry today)
 */
export async function scheduleStreakWarning(): Promise<void> {
  try {
    const hasPermission = await areNotificationsEnabled();
    if (!hasPermission) return;

    const now = new Date();
    const warningTime = new Date();
    warningTime.setHours(20, 0, 0, 0);
    
    // Only schedule if it's before 20:00 today
    if (warningTime <= now) return;

    const options: ScheduleOptions = {
      notifications: [
        {
          id: 2, // Fixed ID for streak warning
          title: 'Streak\'in korunuyor! 🔥',
          body: 'Bugün henüz mood kaydı yapmadın. Streak\'ini kaybetme!',
          schedule: {
            at: warningTime,
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'streak_warning',
          },
        },
      ],
    };

    await LocalNotifications.schedule(options);
  } catch (error) {
    // Silently fail
  }
}

/**
 * Cancel streak warning
 */
export async function cancelStreakWarning(): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 2 }] });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Show achievement unlocked notification
 * @param title - Achievement title
 * @param emoji - Achievement emoji
 */
export async function showAchievementNotification(title: string, emoji: string): Promise<void> {
  try {
    const hasPermission = await areNotificationsEnabled();
    if (!hasPermission) {
      // Fallback to toast on web or if no permission
      toast.success(`${emoji} ${title} başarısı kazanıldı!`);
      return;
    }

    const options: ScheduleOptions = {
      notifications: [
        {
          id: Math.floor(Math.random() * 1000000), // Random ID for one-time notifications
          title: 'Yeni başarı! 🏆',
          body: `${emoji} ${title}`,
          schedule: {
            at: new Date(Date.now() + 1000), // 1 second from now
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'achievement',
          },
        },
      ],
    };

    await LocalNotifications.schedule(options);
  } catch (error) {
    // Fallback to toast
    toast.success(`${emoji} ${title} başarısı kazanıldı!`);
  }
}

/**
 * Setup notification action listeners
 */
export function setupNotificationListeners(): void {
  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      const type = notification.notification.extra?.type;
      
      // Handle different notification types
      switch (type) {
        case 'daily_reminder':
          window.location.href = '/mood';
          break;
        case 'streak_warning':
          window.location.href = '/mood';
          break;
        case 'achievement':
          window.location.href = '/profile';
          break;
      }
    });
  } catch (error) {
    // Silently fail on web
  }
}
