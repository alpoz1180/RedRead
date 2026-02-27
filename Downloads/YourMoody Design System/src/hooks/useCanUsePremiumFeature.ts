import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { PremiumFeature } from '../lib/types';

interface FeatureAccess {
  canUse: boolean;
  reason?: string;
}

interface UseCanUsePremiumFeatureReturn {
  canUse: (feature: PremiumFeature) => FeatureAccess;
  isPremium: boolean;
  planType: string;
}

export function useCanUsePremiumFeature(): UseCanUsePremiumFeatureReturn {
  const { subscription, isPremium, isMonthly, isYearly, isFree } = useSubscription();

  const canUse = useMemo(() => {
    return (feature: PremiumFeature): FeatureAccess => {
      // If loading, deny access
      if (!subscription) {
        return {
          canUse: false,
          reason: 'Subscription bilgisi yükleniyor...',
        };
      }

      const planType = subscription.plan_type;

      switch (feature) {
        case 'unlimited_mood':
          // Free: 1 per day, Monthly/Yearly: unlimited
          if (planType === 'free') {
            return {
              canUse: false,
              reason: 'Günlük mood limitine ulaştınız. Premium\'a geçin!',
            };
          }
          return { canUse: true };

        case 'ai_insight':
          // Free: No access, Monthly: 4/month, Yearly: 8/month
          if (planType === 'free') {
            return {
              canUse: false,
              reason: 'AI İçgörüleri Premium özelliğidir. Premium\'a geçin!',
            };
          }
          return { canUse: true };

        case 'ad_free':
          // Free: No, Monthly/Yearly: Yes
          if (planType === 'free') {
            return {
              canUse: false,
              reason: 'Reklamsız deneyim için Premium\'a geçin!',
            };
          }
          return { canUse: true };

        case 'custom_themes':
          // Free/Monthly: No, Yearly: Yes
          if (planType !== 'yearly') {
            return {
              canUse: false,
              reason: 'Özel temalar sadece Yıllık Premium\'da!',
            };
          }
          return { canUse: true };

        default:
          return {
            canUse: false,
            reason: 'Bilinmeyen özellik',
          };
      }
    };
  }, [subscription]);

  return {
    canUse,
    isPremium,
    planType: subscription?.plan_type || 'free',
  };
}
