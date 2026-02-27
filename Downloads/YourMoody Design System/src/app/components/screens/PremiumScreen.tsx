import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Crown, Sparkles, Zap, Palette, X } from 'lucide-react';
import { useSubscription } from '../../../hooks/useSubscription';
import { SubscriptionPlanDetails } from '../../../lib/types';
import { toast } from 'sonner';

const PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'monthly',
    name: 'Aylık Premium',
    price: 99.99,
    period: 'month',
    features: {
      dailyMoodLimit: null,
      aiInsightsPerMonth: 4,
      adFree: true,
      customThemes: false,
    },
  },
  {
    id: 'yearly',
    name: 'Yıllık Premium',
    price: 999.99,
    period: 'year',
    popular: true,
    features: {
      dailyMoodLimit: null,
      aiInsightsPerMonth: 8,
      adFree: true,
      customThemes: true,
    },
  },
];

export function PremiumScreen() {
  const navigate = useNavigate();
  const { subscription, isPremium, isMonthly, isYearly } = useSubscription();

  const currentPlan = subscription?.plan_type || 'free';

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) {
      toast.info('Bu plan zaten aktif');
      return;
    }

    if (planId === 'free') {
      toast.info('Ücretsiz plana geçmek için destek ekibiyle iletişime geçin');
      return;
    }

    // TODO: Payment integration here
    toast.info('Ödeme sistemi yakında aktif olacak!', {
      description: 'Test için manuel olarak plan değiştirebilirsiniz (Supabase Dashboard)',
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl hover:bg-secondary/80 text-foreground transition-all hover:scale-105"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-coral" />
            <h2 className="text-foreground font-bold">Premium'a Geç</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Current Plan Badge */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-coral to-coral-light text-white text-center"
          >
            <Crown className="inline-block mr-2" size={20} />
            <span className="font-semibold">
              {isYearly ? 'Yıllık Premium' : isMonthly ? 'Aylık Premium' : 'Premium'} Üyesiniz
            </span>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-coral/10 mb-4">
            <Crown size={40} className="text-coral" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Mood Takibini Bir Üst Seviyeye Taşı
          </h1>
          <p className="text-muted-foreground">
            Premium özellikleriyle daha detaylı analizler ve sınırsız deneyim
          </p>
        </motion.div>

        {/* Free Plan Info */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Şu An: Ücretsiz Plan
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <X size={16} className="text-muted-foreground flex-shrink-0" />
                Günde 1 mood kaydı
              </li>
              <li className="flex items-center gap-2">
                <X size={16} className="text-muted-foreground flex-shrink-0" />
                AI içgörüsü yok
              </li>
              <li className="flex items-center gap-2">
                <X size={16} className="text-muted-foreground flex-shrink-0" />
                Reklamlar mevcut
              </li>
            </ul>
          </motion.div>
        )}

        {/* Plans */}
        <div className="space-y-4 mb-6">
          {PLANS.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan;
            const monthlyPrice = plan.period === 'year' ? (plan.price / 12).toFixed(0) : null;
            const savingsPercent = plan.period === 'year' ? 17 : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-coral text-white text-xs font-semibold">
                      <Sparkles size={12} />
                      En Popüler
                    </span>
                  </div>
                )}

                <div
                  className={`
                    rounded-3xl p-6 border-2 transition-all
                    ${
                      isCurrentPlan
                        ? 'border-coral bg-coral/5'
                        : plan.popular
                        ? 'border-coral/30 bg-card'
                        : 'border-border bg-card'
                    }
                  `}
                  style={{
                    background: plan.popular
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-coral">
                          ₺{plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{plan.period === 'month' ? 'ay' : 'yıl'}
                        </span>
                      </div>
                      {monthlyPrice && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ayda sadece ₺{monthlyPrice}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isCurrentPlan && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-coral text-white text-xs font-semibold">
                          <Check size={14} />
                          Aktif
                        </div>
                      )}
                      {savingsPercent && (
                        <div className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold">
                          %{savingsPercent} tasarruf
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {/* Daily Mood Limit */}
                    <li className="flex items-center gap-2 text-sm">
                      <Check size={18} className="text-coral flex-shrink-0" />
                      <span className="text-foreground">Sınırsız mood kaydı</span>
                    </li>

                    {/* AI Insights */}
                    <li className="flex items-center gap-2 text-sm">
                      <Sparkles size={18} className="text-coral flex-shrink-0" />
                      <span className="text-foreground">
                        Ayda {plan.features.aiInsightsPerMonth} AI içgörüsü
                      </span>
                    </li>

                    {/* Ad Free */}
                    <li className="flex items-center gap-2 text-sm">
                      <Zap size={18} className="text-coral flex-shrink-0" />
                      <span className="text-foreground">Reklamsız deneyim</span>
                    </li>

                    {/* Custom Themes */}
                    <li className="flex items-center gap-2 text-sm">
                      {plan.features.customThemes ? (
                        <>
                          <Palette size={18} className="text-coral flex-shrink-0" />
                          <span className="text-foreground">Özel temalar</span>
                        </>
                      ) : (
                        <>
                          <X size={18} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Standart tema</span>
                        </>
                      )}
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                    className={`
                      w-full py-3.5 rounded-2xl font-semibold transition-all
                      ${
                        isCurrentPlan
                          ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-r from-coral to-coral-light text-white shadow-lg hover:shadow-xl'
                          : 'bg-coral/10 text-coral hover:bg-coral/20'
                      }
                    `}
                  >
                    {isCurrentPlan ? 'Mevcut Planınız' : `${plan.name} Seç`}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="font-bold text-foreground mb-4 text-center">
            Neden Premium?
          </h3>
          <div className="space-y-3">
            {[
              {
                icon: Sparkles,
                title: 'AI Destekli İçgörüler',
                description: 'Claude AI ile kişiselleştirilmiş mood analizleri',
              },
              {
                icon: Zap,
                title: 'Sınırsız Kayıt',
                description: 'Günlük mood limitine takılmadan kaydet',
              },
              {
                icon: Crown,
                title: 'Reklamsız Deneyim',
                description: 'Kesintisiz ve odaklanmış mood takibi',
              },
              {
                icon: Palette,
                title: 'Özel Temalar (Yıllık)',
                description: 'Kişiselleştirilmiş görünüm seçenekleri',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border"
                >
                  <div className="p-2 rounded-xl bg-coral/10">
                    <Icon size={20} className="text-coral" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-4 rounded-2xl bg-card border border-border"
        >
          <h3 className="font-bold text-foreground mb-3 text-sm">Sık Sorulan Sorular</h3>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">
                İptal edebilir miyim?
              </p>
              <p>Evet, istediğiniz zaman iptal edebilirsiniz. İlk 14 gün tam iade garantisi vardır.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Ödeme güvenli mi?
              </p>
              <p>Evet, tüm ödemeler güvenli ödeme sağlayıcıları üzerinden işlenir. Kart bilgileriniz saklanmaz.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Plan değiştirebilir miyim?
              </p>
              <p>Evet, istediğiniz zaman aylık ve yıllık plan arasında geçiş yapabilirsiniz.</p>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground mb-8">
          <p>
            Premium abonelikler otomatik olarak yenilenir.
            <br />
            Detaylar için{' '}
            <button
              onClick={() => navigate('/terms')}
              className="text-coral hover:underline"
            >
              Kullanım Koşulları
            </button>
            'na bakın.
          </p>
        </div>
      </div>
    </div>
  );
}
