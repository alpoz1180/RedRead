-- ============================================================
-- 000: Initial schema — users, stories, likes, bookmarks, comments
-- Run this BEFORE any other migrations.
-- ============================================================

-- ─── USERS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STORIES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL DEFAULT '',
  description   TEXT,
  author_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  genre         TEXT,
  published     BOOLEAN NOT NULL DEFAULT false,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  word_count    INTEGER NOT NULL DEFAULT 0,
  likes_count   INTEGER NOT NULL DEFAULT 0,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LIKES ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS likes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, story_id)
);

-- ─── BOOKMARKS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, story_id)
);

-- ─── COMMENTS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────
-- Basic policies — 002_fix_rls.sql will recreate them properly.
-- These prevent "no policy" errors if migrations are run individually.

ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments  ENABLE ROW LEVEL SECURITY;

-- Users: public read, self write
CREATE POLICY "users_select_public" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own"    ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own"    ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Stories: published readable by all, own drafts readable by author
CREATE POLICY "stories_select_published" ON stories FOR SELECT USING (published = true);
CREATE POLICY "stories_select_own"       ON stories FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "stories_insert_own"       ON stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "stories_update_own"       ON stories FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "stories_delete_own"       ON stories FOR DELETE USING (auth.uid() = author_id);

-- Likes
CREATE POLICY "likes_select_all"  ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own"  ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own"  ON likes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_select_all"   ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own"   ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own"   ON comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own"   ON comments FOR DELETE USING (auth.uid() = user_id);
