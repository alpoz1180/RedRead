-- ============================================================
-- 003: Functions, RPCs, and triggers
-- - increment_likes / decrement_likes RPCs
-- - auth.users → public.users sync trigger
-- - updated_at auto-triggers for users, stories, comments
-- ============================================================

-- ─── updated_at helper ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to users
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Attach to stories
DROP TRIGGER IF EXISTS trigger_stories_updated_at ON stories;
CREATE TRIGGER trigger_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Attach to comments
DROP TRIGGER IF EXISTS trigger_comments_updated_at ON comments;
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─── likes RPCs ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_likes(story_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET likes_count = likes_count + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(story_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── auth.users → public.users sync trigger ──────────────────
-- Automatically creates a row in public.users when a new auth user signs up.
-- Uses email prefix as default username; user can change it later.

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
  -- Ensure uniqueness
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := left(base_username, 27) || '_' || suffix;
  END LOOP;

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

-- Drop old trigger if it exists under a different name
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
