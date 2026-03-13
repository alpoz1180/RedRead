-- ============================================================
-- 007: Critical fixes
-- 1. delete_user RPC — allows users to delete their own account
-- 2. handle_new_auth_user loop guard — prevents infinite loop on suffix collision
-- 3. idx_users_username / idx_users_email — missing indexes from 004
-- ============================================================


-- ─── 1. delete_user RPC ──────────────────────────────────────
-- Without this, client-side "delete account" calls fail silently.
-- SECURITY DEFINER so the function runs as the owning role and can
-- touch auth.users, which is otherwise inaccessible to regular users.

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;


-- ─── 2. handle_new_auth_user — loop guard ────────────────────
-- The original WHILE loop in 003 has no exit condition other than
-- finding a unique username. If the users table is corrupted or a
-- bug causes every candidate to appear "taken", the function loops
-- forever and blocks the auth sign-up request.
-- Fix: add suffix < 9999 as a hard upper bound. Beyond that,
-- append a random hex segment to guarantee uniqueness without
-- further looping.

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix        INTEGER := 0;
BEGIN
  -- Derive a username from the email prefix, keep only alphanumeric + underscore
  base_username := regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
  -- Truncate to 30 chars
  base_username := left(base_username, 30);

  -- Ensure uniqueness with a guarded loop (max 9999 attempts)
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) AND suffix < 9999 LOOP
    suffix := suffix + 1;
    final_username := left(base_username, 27) || '_' || suffix;
  END LOOP;

  -- If all suffixes up to 9999 were taken, fall back to a random hex suffix
  -- to guarantee uniqueness without any further looping.
  IF EXISTS (SELECT 1 FROM public.users WHERE username = final_username) THEN
    final_username := left(base_username, 22) || '_' || substring(gen_random_uuid()::text, 1, 8);
  END IF;

  INSERT INTO public.users (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 3. Missing indexes on public.users ──────────────────────
-- 004_indexes.sql indexed stories, likes, bookmarks, and comments
-- but omitted the users table. Username is used in profile lookups
-- and uniqueness checks; email is used in auth flows and admin queries.

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON public.users(email);
