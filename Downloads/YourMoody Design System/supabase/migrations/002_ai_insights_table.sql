-- Create ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id and created_at for faster queries
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_created_at_idx ON public.ai_insights(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own insights
CREATE POLICY "Users can read own insights"
    ON public.ai_insights
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own insights
CREATE POLICY "Users can insert own insights"
    ON public.ai_insights
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own insights
CREATE POLICY "Users can delete own insights"
    ON public.ai_insights
    FOR DELETE
    USING (auth.uid() = user_id);
