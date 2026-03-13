-- ============================================================
-- 005: Comments RLS — proper policies
-- 000_initial_schema.sql creates basic policies; this file
-- drops and recreates them cleanly (same pattern as 002_fix_rls).
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'comments' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON comments';
  END LOOP;
END $$;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments on published stories
CREATE POLICY "comments_select_published" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = comments.story_id
        AND stories.published = true
    )
  );

-- Authors can read comments on their own unpublished stories
CREATE POLICY "comments_select_own_story" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = comments.story_id
        AND stories.author_id = auth.uid()
    )
  );

-- Authenticated users can comment on published stories
CREATE POLICY "comments_insert_authenticated" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = comments.story_id
        AND stories.published = true
    )
  );

-- Users can update their own comments
CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Story authors can delete any comment on their stories (moderation)
CREATE POLICY "comments_delete_story_author" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = comments.story_id
        AND stories.author_id = auth.uid()
    )
  );
