-- Premium Subscription System
-- Migration: 007_add_premium_subscriptions

-- Create enum for plan types
CREATE TYPE subscription_plan AS ENUM ('free', 'monthly', 'yearly');

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);
CREATE INDEX idx_user_subscriptions_is_active ON public.user_subscriptions(is_active);

-- Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies: Users can insert their own subscription (for initial free plan)
CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Only service role can update subscriptions (for payment processing)
CREATE POLICY "Service role can update subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (true);

-- Function to automatically create free subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_type, is_active)
  VALUES (NEW.id, 'free', true)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create free subscription on user signup
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Create AI insight usage tracking table
CREATE TABLE IF NOT EXISTS public.ai_insight_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for AI usage
CREATE INDEX idx_ai_insight_usage_user_id ON public.ai_insight_usage(user_id);
CREATE INDEX idx_ai_insight_usage_used_at ON public.ai_insight_usage(used_at);

-- Enable RLS for AI usage
ALTER TABLE public.ai_insight_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy for AI usage
CREATE POLICY "Users can view own AI usage"
  ON public.ai_insight_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI usage"
  ON public.ai_insight_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to check if user can use AI insight
CREATE OR REPLACE FUNCTION public.can_use_ai_insight(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type subscription_plan;
  v_monthly_count INTEGER;
BEGIN
  -- Get user's plan type
  SELECT plan_type INTO v_plan_type
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Free users can't use AI
  IF v_plan_type = 'free' OR v_plan_type IS NULL THEN
    RETURN false;
  END IF;
  
  -- Count AI insights used this month
  SELECT COUNT(*) INTO v_monthly_count
  FROM public.ai_insight_usage
  WHERE user_id = p_user_id
    AND used_at >= DATE_TRUNC('month', NOW());
  
  -- Monthly plan: 4 per month
  IF v_plan_type = 'monthly' THEN
    RETURN v_monthly_count < 4;
  END IF;
  
  -- Yearly plan: 8 per month
  IF v_plan_type = 'yearly' THEN
    RETURN v_monthly_count < 8;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();

-- Insert default free subscriptions for existing users
INSERT INTO public.user_subscriptions (user_id, plan_type, is_active)
SELECT id, 'free', true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.user_subscriptions IS 'Stores user subscription plans and status';
COMMENT ON TABLE public.ai_insight_usage IS 'Tracks AI insight usage for rate limiting';
COMMENT ON FUNCTION public.can_use_ai_insight IS 'Checks if user has remaining AI insight quota for the month';
