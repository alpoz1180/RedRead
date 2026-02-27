import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserSubscription, SubscriptionPlan } from '../lib/types';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  loading: boolean;
  error: Error | null;
  isPremium: boolean;
  isMonthly: boolean;
  isYearly: boolean;
  isFree: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no subscription exists, create a free one
        if (fetchError.code === 'PGRST116') {
          const { data: newSub, error: createError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              plan_type: 'free',
              is_active: true,
            })
            .select()
            .single();

          if (createError) throw createError;
          setSubscription(newSub);
        } else {
          throw fetchError;
        }
      } else {
        // Check if subscription is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          // Expired - update to free
          const { data: updatedSub, error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              plan_type: 'free',
              is_active: false,
            })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) throw updateError;
          setSubscription(updatedSub);
        } else {
          setSubscription(data);
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching subscription:', err);
      }
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPremium = subscription?.plan_type !== 'free' && subscription?.is_active === true;
  const isMonthly = subscription?.plan_type === 'monthly' && subscription?.is_active === true;
  const isYearly = subscription?.plan_type === 'yearly' && subscription?.is_active === true;
  const isFree = !subscription || subscription?.plan_type === 'free';

  return {
    subscription,
    loading,
    error,
    isPremium,
    isMonthly,
    isYearly,
    isFree,
    refetch: fetchSubscription,
  };
}
