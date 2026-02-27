// Database Types
export interface Database {
  public: {
    Tables: {
      mood_entries: {
        Row: MoodEntry;
        Insert: Omit<MoodEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<MoodEntry, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// User Profile
export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  avatar_emoji: string | null;
  created_at: string;
  updated_at: string;
}

// Mood Entry
export interface MoodEntry {
  id: string;
  user_id: string;
  mood_level: number; // 1-6 scale (1=Üzgün, 2=Normal, 3=Sakin, 4=Mutlu, 5=Harika, 6=Sinirli)
  mood_emoji: string;
  activities: string[] | null;
  note: string | null;
  created_at: string;
}

// User Settings
export interface UserSettings {
  id: string;
  user_id: string;
  reminder_enabled: boolean;
  reminder_time: string; // Format: "HH:MM:SS"
  created_at: string;
  updated_at: string;
}

// User Achievement
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  created_at: string;
}

// User Stats
export interface UserStats {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  total_mood_entries: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

// Subscription Plan Types
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

// User Subscription
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// AI Insight Usage
export interface AIInsightUsage {
  id: string;
  user_id: string;
  used_at: string;
  created_at: string;
}

// Premium Feature Types
export type PremiumFeature = 
  | 'unlimited_mood'
  | 'ai_insight'
  | 'ad_free'
  | 'custom_themes';

// Subscription Plan Details
export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: 'free' | 'month' | 'year';
  features: {
    dailyMoodLimit: number | null; // null = unlimited
    aiInsightsPerMonth: number;
    adFree: boolean;
    customThemes: boolean;
  };
  popular?: boolean;
}

// Achievement Definition
export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  requirement: number;
  type: 'streak' | 'entries' | 'level' | 'special';
  xp_reward: number;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}
