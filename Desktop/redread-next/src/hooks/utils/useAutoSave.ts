import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number; // milliseconds
  minCharsToTrigger?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  triggerSave: () => Promise<void>;
}

export function useAutoSave<T extends { content: string }>({
  data,
  onSave,
  interval = 30000,
  minCharsToTrigger = 10,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDataRef = useRef<T>(data);
  // Refs to always have latest data/onSave without stale closure
  const dataRef = useRef<T>(data);
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const performSave = useCallback(async () => {
    if (!enabledRef.current) return;
    if (dataRef.current.content.length < minCharsToTrigger) return;
    if (JSON.stringify(dataRef.current) === JSON.stringify(lastDataRef.current)) return;

    try {
      setStatus('saving');
      await onSaveRef.current(dataRef.current);
      setStatus('saved');
      setLastSaved(new Date());
      lastDataRef.current = dataRef.current;

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      console.error('Auto-save error:', error);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setStatus('idle'), 5000);
    }
  }, [minCharsToTrigger]);

  const triggerSave = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await performSave();
  }, [performSave]);

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => performSave(), interval);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [data, enabled, interval, performSave]);

  return { status, lastSaved, triggerSave };
}
