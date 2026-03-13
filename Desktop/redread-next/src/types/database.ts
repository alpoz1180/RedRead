export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: 'reader' | 'writer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  description: string | null;
  author_id: string;
  genre: string | null;
  published: boolean;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  published_at: string | null;
  word_count: number;
  likes_count: number;
  cover_gradient: string | null;
  created_at: string;
  updated_at: string;
  author?: User;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string;
  sort_order: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  story_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  story_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}
