-- ============================================================
-- 004: Performance indexes
-- ============================================================

-- stories: feed queries (published, sorted by date)
CREATE INDEX IF NOT EXISTS idx_stories_published_at
  ON stories (published, published_at DESC NULLS LAST)
  WHERE published = true;

-- stories: author's own stories (draft list, profile page)
CREATE INDEX IF NOT EXISTS idx_stories_author_id
  ON stories (author_id);

-- stories: genre filter
CREATE INDEX IF NOT EXISTS idx_stories_genre
  ON stories (genre)
  WHERE genre IS NOT NULL;

-- stories: status filter
CREATE INDEX IF NOT EXISTS idx_stories_status
  ON stories (status);

-- likes: check if user already liked a story (O(1) lookup)
CREATE INDEX IF NOT EXISTS idx_likes_user_story
  ON likes (user_id, story_id);

-- likes: count per story
CREATE INDEX IF NOT EXISTS idx_likes_story_id
  ON likes (story_id);

-- bookmarks: user's bookmarks list
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id
  ON bookmarks (user_id);

-- comments: story's comment list
CREATE INDEX IF NOT EXISTS idx_comments_story_id
  ON comments (story_id, created_at DESC);

-- chapters: already indexed in 001, but add created_at for ordering
CREATE INDEX IF NOT EXISTS idx_chapters_created_at
  ON chapters (story_id, created_at);
