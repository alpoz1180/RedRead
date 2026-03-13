import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Story } from '@/types/database';

// ---------------------------------------------------------------------------
// Supabase mock
// We mock the entire module so StoriesService never touches the network.
//
// vi.mock() calls are hoisted to the top of the file by Vitest. Any variables
// referenced inside the factory must therefore be declared with vi.hoisted()
// so they are initialised before the hoisted factory executes.
// ---------------------------------------------------------------------------

const {
  mockSingle,
  mockReturns,
  mockRange,
  mockOrder,
  mockEq,
  mockIn,
  mockInsert,
  mockSelect,
  mockFrom,
} = vi.hoisted(() => ({
  mockSingle:  vi.fn(),
  mockReturns: vi.fn(),
  mockRange:   vi.fn(),
  mockOrder:   vi.fn(),
  mockEq:      vi.fn(),
  mockIn:      vi.fn(),
  mockInsert:  vi.fn(),
  mockSelect:  vi.fn(),
  mockFrom:    vi.fn(),
}));

// Each builder method returns `this` so calls can be chained.
// The terminal methods (single / returns) resolve the mock values.
function buildChain(): ReturnType<typeof vi.fn> {
  const chain = {
    select:  mockSelect,
    eq:      mockEq,
    in:      mockIn,
    order:   mockOrder,
    range:   mockRange,
    insert:  mockInsert,
    single:  mockSingle,
    returns: mockReturns,
  };

  // Make every method return the same chain object so chaining works.
  Object.values(chain).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(chain));

  return chain as unknown as ReturnType<typeof vi.fn>;
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

// ---------------------------------------------------------------------------
// Import AFTER the mock is set up
// ---------------------------------------------------------------------------
import { storiesService } from '@/services/stories.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'story-1',
    title: 'Test Story',
    content: 'Hello world',
    description: null,
    author_id: 'user-1',
    genre: 'fantasy',
    published: true,
    status: 'published',
    published_at: '2024-01-01T00:00:00Z',
    word_count: 2,
    likes_count: 0,
    cover_gradient: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StoriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const chain = buildChain();
    mockFrom.mockReturnValue(chain);
  });

  // -------------------------------------------------------------------------
  // list()
  // -------------------------------------------------------------------------

  describe('list()', () => {
    it('returns an array of stories on success', async () => {
      const stories = [makeStory(), makeStory({ id: 'story-2', title: 'Second Story' })];
      mockReturns.mockResolvedValueOnce({ data: stories, error: null });

      const result = await storiesService.list();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('story-1');
      expect(result[1].id).toBe('story-2');
    });

    it('returns empty array when data is null', async () => {
      mockReturns.mockResolvedValueOnce({ data: null, error: null });

      const result = await storiesService.list();

      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      mockReturns.mockResolvedValueOnce({
        data: null,
        error: { message: 'permission denied' },
      });

      await expect(storiesService.list()).rejects.toThrow('permission denied');
    });

    it('applies genre filter when genres are provided', async () => {
      mockReturns.mockResolvedValueOnce({ data: [], error: null });

      await storiesService.list({ genres: ['fantasy', 'romance'] });

      // mockIn must have been called (genre filter branch)
      expect(mockIn).toHaveBeenCalledWith('genre', ['fantasy', 'romance']);
    });

    it('applies author filter when authorId is provided', async () => {
      mockReturns.mockResolvedValueOnce({ data: [], error: null });

      await storiesService.list({ authorId: 'user-42' });

      expect(mockEq).toHaveBeenCalledWith('author_id', 'user-42');
    });
  });

  // -------------------------------------------------------------------------
  // getById()
  // -------------------------------------------------------------------------

  describe('getById()', () => {
    it('returns the story when found', async () => {
      const story = makeStory();
      mockSingle.mockResolvedValueOnce({ data: story, error: null });

      const result = await storiesService.getById('story-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('story-1');
      expect(result?.title).toBe('Test Story');
    });

    it('returns null when supabase returns an error', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found' },
      });

      const result = await storiesService.getById('nonexistent');

      expect(result).toBeNull();
    });

    it('queries by the correct id column', async () => {
      mockSingle.mockResolvedValueOnce({ data: makeStory(), error: null });

      await storiesService.getById('story-abc');

      expect(mockEq).toHaveBeenCalledWith('id', 'story-abc');
    });
  });

  // -------------------------------------------------------------------------
  // create()
  // -------------------------------------------------------------------------

  describe('create()', () => {
    it('inserts the story and returns the created record', async () => {
      const created = makeStory({ title: 'Brand New Story' });
      mockSingle.mockResolvedValueOnce({ data: created, error: null });

      const result = await storiesService.create('user-1', {
        title: 'Brand New Story',
        content: 'Once upon a time',
        genres: ['fantasy'],
        status: 'published',
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Brand New Story');
      // insert() must have been called (not update)
      expect(mockInsert).toHaveBeenCalledOnce();
    });

    it('sets word_count based on content', async () => {
      const created = makeStory({ word_count: 4 });
      mockSingle.mockResolvedValueOnce({ data: created, error: null });

      await storiesService.create('user-1', {
        title: 'Story',
        content: 'one two three four',
        genres: ['drama'],
        status: 'draft',
      });

      // The argument passed to insert() should have word_count = 4
      const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertArg.word_count).toBe(4);
    });

    it('uses the first genre as primary genre', async () => {
      mockSingle.mockResolvedValueOnce({ data: makeStory({ genre: 'romance' }), error: null });

      await storiesService.create('user-1', {
        title: 'Story',
        content: 'content',
        genres: ['romance', 'drama'],
        status: 'draft',
      });

      const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertArg.genre).toBe('romance');
    });

    it('throws when supabase insert returns an error (unauthorized)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'new row violates row-level security' },
      });

      await expect(
        storiesService.create('user-unauthorized', {
          title: 'Hack',
          content: 'bad',
          genres: [],
          status: 'published',
        })
      ).rejects.toThrow('new row violates row-level security');
    });
  });
});
