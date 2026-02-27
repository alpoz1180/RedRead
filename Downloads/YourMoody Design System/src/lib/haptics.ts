/**
 * Haptic Feedback Utility
 * Supports both:
 * 1. Capacitor Haptics (Native iOS/Android)
 * 2. Web Vibration API (Fallback for browsers)
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export enum HapticFeedbackType {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Selection = 'selection',
}

// Vibration patterns (in milliseconds)
const PATTERNS: Record<HapticFeedbackType, number | number[]> = {
  [HapticFeedbackType.Light]: 10,
  [HapticFeedbackType.Medium]: 20,
  [HapticFeedbackType.Heavy]: 50,
  [HapticFeedbackType.Success]: [10, 50, 10],
  [HapticFeedbackType.Warning]: [20, 100, 20],
  [HapticFeedbackType.Error]: [50, 100, 50, 100, 50],
  [HapticFeedbackType.Selection]: 5,
};

/**
 * Check if Vibration API is supported
 */
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 * Tries Capacitor first (native), falls back to Vibration API
 * @param type - Type of haptic feedback
 */
export async function triggerHaptic(type: HapticFeedbackType = HapticFeedbackType.Light): Promise<void> {
  // Try Capacitor Haptics first (Native)
  try {
    switch (type) {
      case HapticFeedbackType.Light:
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      case HapticFeedbackType.Medium:
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      case HapticFeedbackType.Heavy:
        await Haptics.impact({ style: ImpactStyle.Heavy });
        return;
      case HapticFeedbackType.Success:
        await Haptics.notification({ type: NotificationType.Success });
        return;
      case HapticFeedbackType.Warning:
        await Haptics.notification({ type: NotificationType.Warning });
        return;
      case HapticFeedbackType.Error:
        await Haptics.notification({ type: NotificationType.Error });
        return;
      case HapticFeedbackType.Selection:
        await Haptics.selectionStart();
        await Haptics.selectionEnd();
        return;
    }
  } catch (capacitorError) {
    // Capacitor not available, fall back to Vibration API
  }

  // Fallback: Web Vibration API
  if (!isHapticsSupported()) {
    return;
  }

  try {
    const pattern = PATTERNS[type];
    navigator.vibrate(pattern);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error triggering haptic feedback:', error);
    }
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (!isHapticsSupported()) return;
  
  try {
    navigator.vibrate(0);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error stopping haptic feedback:', error);
    }
  }
}

/**
 * Custom haptic pattern
 * @param pattern - Array of vibration durations and pauses [vibrate, pause, vibrate, ...]
 */
export function triggerCustomHaptic(pattern: number[]): void {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error triggering custom haptic feedback:', error);
    }
  }
}

/**
 * React hook for haptic feedback
 */
export function useHaptics() {
  const haptic = (type: HapticFeedbackType = HapticFeedbackType.Light) => {
    triggerHaptic(type);
  };

  const customHaptic = (pattern: number[]) => {
    triggerCustomHaptic(pattern);
  };

  const stop = () => {
    stopHaptic();
  };

  return {
    haptic,
    customHaptic,
    stop,
    isSupported: isHapticsSupported(),
  };
}
