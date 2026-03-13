import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import type { Story } from '../types/database';

/**
 * Story Service - Tüm hikaye CRUD operasyonları
 */

export interface CreateStoryDto {
  title: string;
  content: string;
  description?: string;
  genres: string[]; // Multi-genre support
  status: 'draft' | 'published';
}

export interface UpdateStoryDto extends Partial<CreateStoryDto> {
  id: string;
}

export interface StoryFilters {
  genres?: string[];
  status?: 'draft' | 'published';
  authorId?: string;
  limit?: number;
  offset?: number;
}

class StoriesService {
  private readonly TABLE = 'stories';

  /**
   * Hikayeleri listele (filtreleme + sıralama)
   */
  async list(filters: StoryFilters = {}): Promise<Story[]> {
    const {
      genres = [],
      status = 'published',
      authorId,
      limit = 100,
      offset = 0,
    } = filters;

    let query = supabase
      .from(this.TABLE)
      .select(
        `
        id, title, content, description, genre, published, status,
        word_count, likes_count, cover_gradient,
        published_at, created_at, updated_at, author_id,
        author:users!author_id(id, username, display_name, avatar_url)
      `
      )
      .eq('published', status === 'published')
      .eq('status', status)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Genre filter (eğer varsa)
    if (genres.length > 0) {
      query = query.in('genre', genres);
    }

    // Author filter (kullanıcının kendi hikayeleri için)
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query.returns<Story[]>();

    if (error) {
      logger.error('Stories list error:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Tek bir hikaye getir (ID ile)
   */
  async getById(id: string): Promise<Story | null> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select(
        `
        *,
        author:users!author_id(id, username, display_name, avatar_url)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Story get error:', error);
      return null;
    }

    return data;
  }

  /**
   * Yeni hikaye oluştur
   */
  async create(userId: string, dto: CreateStoryDto): Promise<Story | null> {
    // Word count hesapla
    const wordCount = dto.content.trim().split(/\s+/).filter(Boolean).length;

    // Primary genre (ilk seçilen)
    const primaryGenre = dto.genres[0] || null;

    const storyData = {
      title: dto.title,
      content: dto.content,
      description: dto.description || null,
      author_id: userId,
      genre: primaryGenre,
      published: dto.status === 'published',
      status: dto.status,
      word_count: wordCount,
      published_at: dto.status === 'published' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from(this.TABLE)
      .insert(storyData)
      .select(
        `
        *,
        author:users!author_id(id, username, display_name, avatar_url)
      `
      )
      .single();

    if (error) {
      logger.error('Story create error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Hikaye güncelle
   */
  async update(userId: string, dto: UpdateStoryDto): Promise<Story | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) {
      updateData.content = dto.content;
      updateData.word_count = dto.content.trim().split(/\s+/).filter(Boolean).length;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description || null;
    }
    if (dto.genres && dto.genres.length > 0) {
      updateData.genre = dto.genres[0]; // Primary genre
    }
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      updateData.published = dto.status === 'published';
      if (dto.status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from(this.TABLE)
      .update(updateData)
      .eq('id', dto.id)
      .eq('author_id', userId) // Security: only update own stories
      .select(
        `
        *,
        author:users!author_id(id, username, display_name, avatar_url)
      `
      )
      .single();

    if (error) {
      logger.error('Story update error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Hikaye sil
   */
  async delete(userId: string, storyId: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.TABLE)
      .delete()
      .eq('id', storyId)
      .eq('author_id', userId); // Security: only delete own stories

    if (error) {
      logger.error('Story delete error:', error);
      return false;
    }

    return true;
  }

  /**
   * Kullanıcının kendi taslakları
   */
  async getDrafts(userId: string): Promise<Story[]> {
    return this.list({
      status: 'draft',
      authorId: userId,
      limit: 50,
    });
  }

  /**
   * Kullanıcının yayınlanmış hikayeleri
   */
  async getPublished(userId: string): Promise<Story[]> {
    return this.list({
      status: 'published',
      authorId: userId,
      limit: 50,
    });
  }

  /**
   * Hikaye beğen
   */
  async like(userId: string, storyId: string): Promise<boolean> {
    const { error } = await supabase.from('likes').insert({
      user_id: userId,
      story_id: storyId,
    });

    if (error) {
      logger.error('Like error:', error);
      return false;
    }

    // Increment likes_count — revert insert if RPC fails
    const { error: rpcError } = await supabase.rpc('increment_likes', { story_id: storyId });
    if (rpcError) {
      logger.error('increment_likes error:', rpcError);
      await supabase.from('likes').delete().eq('user_id', userId).eq('story_id', storyId);
      return false;
    }

    return true;
  }

  /**
   * Beğeniyi kaldır
   */
  async unlike(userId: string, storyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('story_id', storyId);

    if (error) {
      logger.error('Unlike error:', error);
      return false;
    }

    // Decrement likes_count
    const { error: rpcError } = await supabase.rpc('decrement_likes', { story_id: storyId });
    if (rpcError) {
      logger.error('decrement_likes error:', rpcError);
    }

    return true;
  }

  /**
   * Hikayeyi favorilere ekle
   */
  async bookmark(userId: string, storyId: string): Promise<boolean> {
    const { error } = await supabase.from('bookmarks').insert({
      user_id: userId,
      story_id: storyId,
    });

    if (error) {
      logger.error('Bookmark error:', error);
      return false;
    }

    return true;
  }

  /**
   * Favorilerden kaldır
   */
  async unbookmark(userId: string, storyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('story_id', storyId);

    if (error) {
      logger.error('Unbookmark error:', error);
      return false;
    }

    return true;
  }
}

// Singleton instance export
export const storiesService = new StoriesService();
