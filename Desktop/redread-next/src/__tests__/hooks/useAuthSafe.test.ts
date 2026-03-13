import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Supabase auth mock
//
// vi.mock() is hoisted to the top of the file. Variables referenced inside the
// factory must be declared via vi.hoisted() so they exist at hoist time.
// ---------------------------------------------------------------------------

const { mockUnsubscribe, mockGetSession, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockUnsubscribe:       vi.fn(),
  mockGetSession:        vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:         mockGetSession,
      onAuthStateChange:  mockOnAuthStateChange,
    },
  },
}));

// ---------------------------------------------------------------------------
// Import AFTER the mock is registered
// ---------------------------------------------------------------------------
import { useAuthSafe } from '@/hooks/useAuthSafe';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Tracks the captured auth-state-change listener between tests.
let sessionCallback: ((session: { user: { id: string } } | null) => void) | null = null;

describe('useAuthSafe()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionCallback = null;

    // Default: onAuthStateChange captures the listener, returns unsubscribe handle
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: { user: { id: string } } | null) => void) => {
        sessionCallback = (session) => cb('SIGNED_IN', session);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }
    );
  });

  it('returns null initially before session resolves', () => {
    // getSession never resolves during this sync check
    mockGetSession.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useAuthSafe());

    expect(result.current).toBeNull();
  });

  it('returns the user id when authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-abc' } } },
    });

    const { result } = renderHook(() => useAuthSafe());

    // Wait for the async getSession to settle
    await act(async () => {});

    expect(result.current).toBe('user-abc');
  });

  it('returns null when not authenticated (no session)', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuthSafe());

    await act(async () => {});

    expect(result.current).toBeNull();
  });

  it('updates to authenticated state when auth event fires', async () => {
    // Initial state: not logged in
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuthSafe());
    await act(async () => {});
    expect(result.current).toBeNull();

    // Simulate a sign-in event
    await act(async () => {
      sessionCallback?.({ user: { id: 'user-xyz' } });
    });

    expect(result.current).toBe('user-xyz');
  });

  it('clears user id on sign-out event', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-abc' } } },
    });

    const { result } = renderHook(() => useAuthSafe());
    await act(async () => {});
    expect(result.current).toBe('user-abc');

    // Simulate sign-out
    await act(async () => {
      sessionCallback?.(null);
    });

    expect(result.current).toBeNull();
  });

  it('unsubscribes from auth listener on unmount', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    const { unmount } = renderHook(() => useAuthSafe());
    await act(async () => {});

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});
