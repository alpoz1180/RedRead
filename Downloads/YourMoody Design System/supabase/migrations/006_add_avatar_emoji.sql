-- Add avatar_emoji column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_emoji TEXT;

-- Set default emoji for existing users (optional)
UPDATE public.profiles 
SET avatar_emoji = '😊' 
WHERE avatar_emoji IS NULL;
