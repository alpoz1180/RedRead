import { supabase } from '../lib/supabase';
import type { Story, Chapter } from '../types/database';

/* ─── Types ───────────────────────────────────────────────────── */

export interface WriteStory {
  id: string;
  title: string;
  description: string;
  genres: string[];
  chapters: WriteChapter[];
  coverGradient: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  updatedAt: number;
}

export interface WriteChapter {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #FF6122 0%, #ff9a3c 50%, #ffcd6b 100%)';

/* ─── Supabase → Local format ─────────────────────────────────── */

function toWriteStory(s: Story, chapters: Chapter[]): WriteStory {
  return {
    id: s.id,
    title: s.title || '',
    description: s.description || '',
    genres: s.genre ? [s.genre] : [],
    chapters: chapters
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(ch => ({
        id: ch.id,
        title: ch.title,
        content: ch.content,
      })),
    coverGradient: s.cover_gradient || DEFAULT_GRADIENT,
    status: (s.status as WriteStory['status']) || 'draft',
    updatedAt: new Date(s.updated_at).getTime(),
  };
}

/* ─── Service ─────────────────────────────────────────────────── */

class WriteService {
  /**
   * Kullanıcının tüm hikayelerini yükle (bölümlerle birlikte)
   */
  async loadStories(userId: string): Promise<WriteStory[]> {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('loadStories error:', error);
      return [];
    }

    if (!stories || stories.length === 0) return [];

    // Load all chapters for these stories
    const storyIds = stories.map(s => s.id);
    const { data: chapters, error: chErr } = await supabase
      .from('chapters')
      .select('*')
      .in('story_id', storyIds)
      .order('sort_order', { ascending: true });

    if (chErr) {
      console.error('loadChapters error:', chErr);
    }

    const chaptersByStory = new Map<string, Chapter[]>();
    (chapters || []).forEach(ch => {
      const list = chaptersByStory.get(ch.story_id) || [];
      list.push(ch);
      chaptersByStory.set(ch.story_id, list);
    });

    return stories.map(s => toWriteStory(s, chaptersByStory.get(s.id) || []));
  }

  /**
   * Yeni hikaye oluştur (ilk bölümle birlikte)
   */
  async createStory(userId: string, coverGradient: string): Promise<WriteStory | null> {
    // 1. Create story
    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        title: '',
        content: '',
        description: null,
        author_id: userId,
        genre: null,
        published: false,
        status: 'draft',
        word_count: 0,
        cover_gradient: coverGradient,
      })
      .select()
      .single();

    if (error || !story) {
      console.error('createStory error:', error);
      return null;
    }

    // 2. Create first chapter
    const { data: chapter, error: chErr } = await supabase
      .from('chapters')
      .insert({
        story_id: story.id,
        title: 'Bölüm 1',
        content: '',
        sort_order: 0,
        word_count: 0,
      })
      .select()
      .single();

    if (chErr || !chapter) {
      console.error('createChapter error:', chErr);
      // Rollback story
      await supabase.from('stories').delete().eq('id', story.id);
      return null;
    }

    return toWriteStory(story, [chapter]);
  }

  /**
   * Hikaye meta bilgilerini güncelle (title, description, genre, status, cover)
   */
  async updateStoryMeta(storyId: string, userId: string, updates: {
    title?: string;
    description?: string;
    genres?: string[];
    status?: 'draft' | 'pending' | 'published' | 'rejected';
    coverGradient?: string;
  }): Promise<boolean> {
    const data: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description || null;
    if (updates.genres !== undefined) data.genre = updates.genres[0] || null;
    if (updates.coverGradient !== undefined) data.cover_gradient = updates.coverGradient;
    if (updates.status !== undefined) {
      data.status = updates.status;
      // Writers submit for review → pending. Only admin can set published (via admin panel).
      data.published = false;
    }

    const { error } = await supabase
      .from('stories')
      .update(data)
      .eq('id', storyId)
      .eq('author_id', userId);

    if (error) {
      console.error('updateStoryMeta error:', error);
      return false;
    }
    return true;
  }

  /**
   * Hikaye sil (chapters cascade ile silinir)
   */
  async deleteStory(storyId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('author_id', userId);

    if (error) {
      console.error('deleteStory error:', error);
      return false;
    }
    return true;
  }

  /**
   * Yeni bölüm ekle — story sahipliği userId ile doğrulanır
   */
  async addChapter(storyId: string, userId: string, sortOrder: number): Promise<WriteChapter | null> {
    // Önce story'nin bu kullanıcıya ait olduğunu doğrula
    const { data: ownedStory, error: ownerErr } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .eq('author_id', userId)
      .single();

    if (ownerErr || !ownedStory) {
      console.error('addChapter ownership check failed:', ownerErr);
      return null;
    }

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        story_id: storyId,
        title: `Bölüm ${sortOrder + 1}`,
        content: '',
        sort_order: sortOrder,
        word_count: 0,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('addChapter error:', error);
      return null;
    }

    // Update story timestamp — author_id koşulu ile sahiplik tekrar sağlanır
    await supabase
      .from('stories')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', storyId)
      .eq('author_id', userId);

    return { id: data.id, title: data.title, content: data.content };
  }

  /**
   * Bölüm sil — storyId + userId ile sahiplik doğrulanır
   */
  async deleteChapter(chapterId: string, storyId: string, userId: string): Promise<boolean> {
    // Story'nin bu kullanıcıya ait olduğunu doğrula
    const { data: ownedStory, error: ownerErr } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .eq('author_id', userId)
      .single();

    if (ownerErr || !ownedStory) {
      console.error('deleteChapter ownership check failed:', ownerErr);
      return false;
    }

    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)
      .eq('story_id', storyId);

    if (error) {
      console.error('deleteChapter error:', error);
      return false;
    }
    return true;
  }

  /**
   * Bölüm güncelle (title + content) — storyId + userId ile sahiplik doğrulanır
   */
  async updateChapter(chapterId: string, storyId: string, userId: string, updates: {
    title?: string;
    content?: string;
  }): Promise<boolean> {
    // Story'nin bu kullanıcıya ait olduğunu doğrula
    const { data: ownedStory, error: ownerErr } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .eq('author_id', userId)
      .single();

    if (ownerErr || !ownedStory) {
      console.error('updateChapter ownership check failed:', ownerErr);
      return false;
    }

    const data: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) data.title = updates.title;
    if (updates.content !== undefined) {
      data.content = updates.content;
      data.word_count = updates.content.trim().split(/\s+/).filter(Boolean).length;
    }

    const { error } = await supabase
      .from('chapters')
      .update(data)
      .eq('id', chapterId)
      .eq('story_id', storyId);

    if (error) {
      console.error('updateChapter error:', error);
      return false;
    }
    return true;
  }

  /**
   * Hikayeyi onay için gönder (draft → pending)
   */
  async submitForReview(storyId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('stories')
      .update({
        status: 'pending',
        published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId)
      .eq('author_id', userId);

    if (error) {
      console.error('submitForReview error:', error);
      return false;
    }
    return true;
  }

  /**
   * Hikayenin toplam kelime sayısını güncelle
   */
  async updateStoryWordCount(storyId: string, userId: string): Promise<void> {
    const { data: chapters } = await supabase
      .from('chapters')
      .select('word_count')
      .eq('story_id', storyId);

    const total = (chapters || []).reduce((sum, ch) => sum + (ch.word_count || 0), 0);

    await supabase
      .from('stories')
      .update({ word_count: total, updated_at: new Date().toISOString() })
      .eq('id', storyId)
      .eq('author_id', userId);
  }
}

export const writeService = new WriteService();
