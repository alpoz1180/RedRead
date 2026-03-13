-- ============================================================
-- 002: Fix RLS policies — proper auth-based access control
-- ============================================================

-- ─── STORIES ─────────────────────────────────────────────────

-- Drop all existing policies on stories
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
DROP POLICY IF EXISTS "Enable read access for all users" ON stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stories;
DROP POLICY IF EXISTS "Enable update for users based on id" ON stories;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON stories;
-- Catch-all: drop any remaining
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'stories' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON stories';
  END LOOP;
END $$;

-- Make sure RLS is on
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Public can read published stories
CREATE POLICY "stories_select_published" ON stories
  FOR SELECT USING (published = true);

-- Authors can read their own stories (including drafts)
CREATE POLICY "stories_select_own" ON stories
  FOR SELECT USING (auth.uid() = author_id);

-- Authenticated users can insert their own stories
CREATE POLICY "stories_insert_own" ON stories
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own stories
CREATE POLICY "stories_update_own" ON stories
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own stories
CREATE POLICY "stories_delete_own" ON stories
  FOR DELETE USING (auth.uid() = author_id);


-- ─── CHAPTERS ────────────────────────────────────────────────

DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'chapters' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON chapters';
  END LOOP;
END $$;

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Public can read chapters of published stories
CREATE POLICY "chapters_select_published" ON chapters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.published = true)
  );

-- Authors can read chapters of their own stories
CREATE POLICY "chapters_select_own" ON chapters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.author_id = auth.uid())
  );

-- Authors can insert chapters to their own stories
CREATE POLICY "chapters_insert_own" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.author_id = auth.uid())
  );

-- Authors can update chapters of their own stories
CREATE POLICY "chapters_update_own" ON chapters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.author_id = auth.uid())
  );

-- Authors can delete chapters of their own stories
CREATE POLICY "chapters_delete_own" ON chapters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.author_id = auth.uid())
  );


-- ─── USERS ───────────────────────────────────────────────────

DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
  END LOOP;
END $$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public profiles are readable
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Insert handled by trigger on auth.users, but allow self-insert
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- No delete for users (account deletion via admin)


-- ─── LIKES ───────────────────────────────────────────────────

DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'likes' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON likes';
  END LOOP;
END $$;

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all" ON likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own" ON likes
  FOR DELETE USING (auth.uid() = user_id);


-- ─── BOOKMARKS ───────────────────────────────────────────────

DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'bookmarks' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON bookmarks';
  END LOOP;
END $$;

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_select_own" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_own" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_own" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
