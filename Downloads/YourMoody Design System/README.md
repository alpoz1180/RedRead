# YourMoody Design System

A mood tracking application built with React, Vite, Tailwind CSS, and Supabase.

Original Figma design: https://www.figma.com/design/TvIVs8jJxKN6qp5nF4DBTx/YourMoody-Design-System

## Features

- 🔐 **Authentication**: Email/password authentication with Supabase
- 📊 **Mood Tracking**: Create, read, update, and delete mood entries
- 🎨 **Design System**: Complete shadcn/ui component library
- 🔒 **Row Level Security**: User data is protected with Supabase RLS
- 📱 **Responsive Design**: Mobile-first responsive interface

## Tech Stack

- **Frontend**: React 18.3, Vite 6.3
- **Styling**: Tailwind CSS 4.1, shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Routing**: React Router 7
- **State Management**: React Context API
- **Icons**: Lucide React, MUI Icons
- **Notifications**: Sonner

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [Supabase](https://app.supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations

Go to your Supabase Dashboard:
1. Open **SQL Editor**
2. Create a new query
3. Copy and run the contents of each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/003_user_settings_table.sql`

This will create:
- `profiles` table (user profiles)
- `mood_entries` table (mood tracking data)
- `user_settings` table (reminder preferences)
- Row Level Security policies
- Automatic triggers for profile and settings creation

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── screens/          # Page components
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── MoodEntryScreen.tsx
│   │   │   ├── InsightsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── ui/               # shadcn/ui components (48 components)
│   │   ├── ProtectedRoute.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── App.tsx
│   └── routes.ts
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── hooks/
│   ├── useMoodEntries.ts     # Fetch mood entries
│   ├── useCreateMood.ts      # Create mood entry
│   └── useUpdateMood.ts      # Update/delete mood entry
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── types.ts              # TypeScript types
└── styles/
```

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Authentication

The app includes complete authentication flows:

- **Sign Up**: `/signup` - Create new account
- **Login**: `/login` - Sign in with email/password
- **Forgot Password**: `/forgot-password` - Reset password via email
- **Protected Routes**: All main routes require authentication

## Database Schema

### `profiles` Table
- User profile information
- Auto-created on signup
- One-to-one with auth.users

### `mood_entries` Table
- `id` (UUID)
- `user_id` (UUID) - Foreign key to auth.users
- `mood_level` (INTEGER) - 1-5 scale
- `mood_emoji` (TEXT)
- `activities` (TEXT[]) - Array of activities
- `note` (TEXT) - Optional note
- `created_at` (TIMESTAMP)

## API Hooks

### `useAuth()`
Access authentication state and methods:
```tsx
const { user, session, profile, signIn, signUp, signOut } = useAuth();
```

### `useMoodEntries(limit?)`
Fetch user's mood entries:
```tsx
const { entries, loading, error, refetch } = useMoodEntries(10);
```

### `useCreateMood()`
Create new mood entry:
```tsx
const { createMood, loading } = useCreateMood();
await createMood({ mood_level: 4, mood_emoji: '😊', activities: ['work'] });
```

### `useUpdateMood()`
Update or delete mood entries:
```tsx
const { updateMood, deleteMood } = useUpdateMood();
await updateMood(id, { note: 'Updated note' });
await deleteMood(id);
```

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Passwords hashed by Supabase Auth
- Environment variables for sensitive data

## License

See ATTRIBUTIONS.md for third-party licenses.