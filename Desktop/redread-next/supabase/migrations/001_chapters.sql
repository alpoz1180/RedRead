-- ============================================================
-- Chapters tablosu + stories güncellemesi
-- ============================================================

-- 1) stories tablosuna cover_gradient kolonu ekle
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_gradient TEXT DEFAULT 'linear-gradient(135deg, #FF6122 0%, #ff9a3c 50%, #ffcd6b 100%)';

-- 2) chapters tablosu
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Bölüm 1',
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by story
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_sort_order ON chapters(story_id, sort_order);

-- 3) RLS policies for chapters
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Herkes yayınlanmış hikayelerin bölümlerini okuyabilir
CREATE POLICY "chapters_read_published" ON chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.published = true
    )
  );

-- Yazarlar kendi hikayelerinin bölümlerini okuyabilir
CREATE POLICY "chapters_read_own" ON chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Yazarlar kendi hikayelerine bölüm ekleyebilir
CREATE POLICY "chapters_insert_own" ON chapters
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Yazarlar kendi bölümlerini güncelleyebilir
CREATE POLICY "chapters_update_own" ON chapters
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Yazarlar kendi bölümlerini silebilir
CREATE POLICY "chapters_delete_own" ON chapters
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- 4) Updated_at trigger
CREATE OR REPLACE FUNCTION update_chapter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Ayrıca hikayenin updated_at'ini de güncelle
  UPDATE stories SET updated_at = NOW() WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chapter_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_chapter_updated_at();
