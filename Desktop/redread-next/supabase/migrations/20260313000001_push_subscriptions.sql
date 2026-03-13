-- ============================================================
-- 20260313000001: Push notification subscriptions
-- Stores browser Web Push subscription objects per user.
-- ============================================================

-- ─── TABLE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription    JSONB       NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── INDEX ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx
  ON public.push_subscriptions (user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own subscription
CREATE POLICY "push_subscriptions: users can insert own"
  ON public.push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "push_subscriptions: users can delete own"
  ON public.push_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read their own subscriptions (needed for dedup checks)
CREATE POLICY "push_subscriptions: users can read own"
  ON public.push_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role (edge functions) can read all subscriptions
-- This relies on the service_role key bypassing RLS, which is default Supabase behaviour.
-- No explicit policy needed for service_role.
