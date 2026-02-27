-- Update mood_level constraint to allow values 1-6 instead of 1-5
-- This migration changes the constraint to support the new Sinirli mood at level 6

-- Drop the old constraint
ALTER TABLE public.mood_entries 
DROP CONSTRAINT IF EXISTS mood_entries_mood_level_check;

-- Add new constraint with updated range (1-6)
ALTER TABLE public.mood_entries 
ADD CONSTRAINT mood_entries_mood_level_check 
CHECK (mood_level >= 1 AND mood_level <= 6);
