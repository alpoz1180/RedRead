import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, UserCheck, Shield, CreditCard, AlertTriangle, Crown, Scale, Ban, Mail } from 'lucide-react';
import { MoodyCard } from '../MoodyCard';

export function TermsOfServiceScreen() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileText,
      title: '1. Hizmet Tanımı',
      content: [
        'YourMoody, kullanıcıların ruh hali takibi yapmasını sağlayan bir mobil web uygulamasıdır',
        'Uygulama, AI destekli içgörüler, trend analizleri ve kişiselleştirilmiş öneriler sunar',
        'Hizmet, ücretsiz (Free) ve ücretli (Premium - Aylık/Yıllık) planlar ile sunulmaktadır',
        'Tıbbi bir hizmet DEĞİLDİR - sadece kişisel takip ve farkındalık amaçlıdır',
        'Hizmet "olduğu gibi" sunulmaktadır ve kesintisiz erişim garanti edilmemektedir',
      ],
    },
    {
      icon: UserCheck,
      title: '2. Kullanıcı Sorumlulukları',
      content: [
        '18 yaşından büyük olmalısınız (veya ebeveyn onayı ile 13-18 yaş arası)',
        'Kayıt sırasında doğru ve güncel bilgiler vermelisiniz',
        'Hesap bilgilerinizi gizli tutmaktan siz sorumlusunuz',
        'Başkalarının hesaplarını kullanmamalı ve paylaşmamalısınız',
        'Hizmeti yasalara uygun şekilde kullanmalısınız',
        'Spam, kötü amaçlı yazılım veya zararlı içerik paylaşmamalısınız',
        'Sistemi manipüle etmek veya güvenlik açığı aramak yasaktır',
      ],
    },
    {
      icon: Shield,
      title: '3. Hesap Güvenliği',
      content: [
        'Güçlü bir şifre seçmeli ve düzenli olarak değiştirmelisiniz',
        'Şifrenizi kimseyle paylaşmamalısınız',
        'Hesabınızda şüpheli aktivite fark ederseniz hemen bildirmelisiniz',
        'Yetkisiz erişim veya güvenlik ihlali durumunda derhal şifrenizi değiştirin',
        'Hesap güvenliğinden siz sorumlusunuz - hesabınızdaki tüm aktiviteler sizinle ilişkilendirilir',
      ],
    },
    {
      icon: CreditCard,
      title: '4. Premium Abonelik ve Ödemeler',
      content: [
        'Premium plan ücretleri: Aylık ₺99.99, Yıllık ₺999.99 (fiyatlar değişebilir)',
        'Ödemeler güvenli ödeme sağlayıcıları üzerinden işlenir (kart bilgileri saklanmaz)',
        'Abonelik otomatik olarak yenilenir - iptal edilene kadar',
        'İptal: Aboneliğinizi istediğiniz zaman iptal edebilirsiniz (profil > ayarlar)',
        'İade politikası: İlk 14 gün içinde tam iade (Tüketici Hakları Kanunu)',
        '14 günden sonra kalan gün oranında iade yapılır',
        'Fiyat değişiklikleri: En az 30 gün önceden bildirilir',
        'Ödeme yapılmaması durumunda Premium özellikler askıya alınır',
      ],
    },
    {
      icon: FileText,
      title: '5. İçerik Politikası',
      content: [
        'Eklediğiniz ruh hali notları ve veriler size aittir',
        'İçerikleriniz yasa dışı, tehdit edici, taciz edici veya müstehcen olmamalıdır',
        'Başkalarının haklarını ihlal eden içerik paylaşmamalısınız',
        'Spam veya reklam içeriği yasaktır',
        'YourMoody, hizmet kurallarını ihlal eden içerikleri silme hakkını saklı tutar',
        'AI analizi için kullanılan içerikler anonim hale getirilir ve saklanmaz',
      ],
    },
    {
      icon: Crown,
      title: '6. Fikri Mülkiyet',
      content: [
        'YourMoody uygulaması, logosu, tasarımı ve kodları telif hakları ile korunmaktadır',
        'Uygulama içeriğini kopyalayamaz, çoğaltamaz veya dağıtamazsınız',
        'Ters mühendislik (reverse engineering) yapılamaz',
        'Ticari amaçla kullanım yasaktır (yazılı izin olmadan)',
        'Kullanıcı içerikleri (mood kayıtları) size aittir - YourMoody reklam vb. için kullanamaz',
      ],
    },
    {
      icon: AlertTriangle,
      title: '7. Sorumluluk Reddi (Önemli)',
      content: [
        '⚠️ YourMoody tıbbi bir hizmet veya tedavi DEĞİLDİR',
        'Profesyonel psikolojik danışmanlık veya psikiyatrik tedavi yerine geçmez',
        'Ciddi ruh hali bozuklukları için mutlaka bir sağlık profesyoneline başvurun',
        'İntihar düşünceleri veya kriz durumunda acil yardım hattını arayın (182)',
        'YourMoody, kullanıcı kararlarından sorumlu tutulamaz',
        'Veri kaybı, hizmet kesintisi veya teknik hatalardan dolayı tazminat talep edilemez',
        'Maksimum sorumluluk: Son 12 ayda ödenen abonelik ücreti ile sınırlıdır',
      ],
    },
    {
      icon: Scale,
      title: '8. Hizmet Değişiklikleri',
      content: [
        'YourMoody, hizmeti istediği zaman değiştirme, güncelleme veya sonlandırma hakkını saklı tutar',
        'Önemli değişiklikler kullanıcılara 30 gün önceden bildirilir',
        'Yeni özellikler eklenebilir veya mevcut özellikler kaldırılabilir',
        'Kullanım koşulları güncellenebilir - e-posta ile bildirim yapılır',
        'Değişiklikleri kabul etmiyorsanız, hesabınızı kapatabilirsiniz',
      ],
    },
    {
      icon: Ban,
      title: '9. Hesap Askıya Alma ve Fesih',
      content: [
        'YourMoody, kullanım koşullarını ihlal eden hesapları askıya alma hakkını saklı tutar',
        'Tekrarlayan ihlaller hesabın kalıcı olarak kapatılmasına neden olabilir',
        'Kötüye kullanım tespiti durumunda iade yapılmayabilir',
        'Hesabınızı istediğiniz zaman kapatabilirsiniz (Profil > Ayarlar > Hesabı Sil)',
        'Hesap silme işlemi kalıcıdır ve geri alınamaz',
        'Silinen hesap verileri 30 gün içinde sistemden tamamen kaldırılır',
      ],
    },
    {
      icon: Mail,
      title: '10. İletişim ve Uyuşmazlık Çözümü',
      content: [
        'Sorularınız için: support@yourmoody.com',
        'Hukuki konular: legal@yourmoody.com',
        'Uyuşmazlıklar öncelikle iyi niyetle çözülmeye çalışılır',
        'Çözülemezse, İstanbul Mahkemeleri ve İcra Daireleri yetkilidir',
        'Türkiye Cumhuriyeti yasaları geçerlidir',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d0f0f] via-[#1a0a0a] to-[#0f0a1a] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-coral/10">
                <Scale className="w-6 h-6 text-coral" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Kullanım Koşulları</h1>
                <p className="text-xs text-white/40">Son Güncelleme: 27 Şubat 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Introduction */}
        <MoodyCard>
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              YourMoody uygulamasını kullanarak, aşağıdaki kullanım koşullarını kabul etmiş olursunuz. 
              Lütfen dikkatlice okuyun.
            </p>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-200 text-sm leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Önemli:</strong> YourMoody tıbbi bir hizmet değildir. Ciddi ruh hali sorunları 
                  için mutlaka bir sağlık profesyoneline başvurun.
                </span>
              </p>
            </div>
          </div>
        </MoodyCard>

        {/* Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MoodyCard>
                <div className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-coral/10 mt-1">
                      <Icon className="w-5 h-5 text-coral" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white mb-3">
                        {section.title}
                      </h2>
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                            <span className="text-coral mt-1.5">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </MoodyCard>
            </motion.div>
          );
        })}

        {/* Crisis Resources */}
        <MoodyCard>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <h3 className="text-red-200 font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Kriz Durumunda
            </h3>
            <div className="space-y-2 text-red-200/80 text-sm">
              <p>Acil yardım gerekiyorsa:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Acil Yardım:</strong> 112</li>
                <li>• <strong>Psikolojik Destek Hattı:</strong> 182</li>
                <li>• <strong>Cinsel Şiddet İhbar Hattı:</strong> 183</li>
                <li>• <strong>Yaşam Hattı:</strong> 0543 743 43 43</li>
              </ul>
            </div>
          </div>
        </MoodyCard>

        {/* Footer Note */}
        <MoodyCard>
          <div className="space-y-3">
            <p className="text-white/60 text-sm leading-relaxed">
              Bu kullanım koşulları, Türkiye Cumhuriyeti yasalarına göre düzenlenmiştir ve 
              yorumlanacaktır.
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              Sorularınız için{' '}
              <a href="mailto:legal@yourmoody.com" className="text-coral hover:underline">
                legal@yourmoody.com
              </a>{' '}
              adresinden bizimle iletişime geçebilirsiniz.
            </p>
            <p className="text-white/40 text-xs mt-4">
              YourMoody'yi kullanarak bu koşulları kabul etmiş sayılırsınız. 
              Kabul etmiyorsanız lütfen hizmeti kullanmayın.
            </p>
          </div>
        </MoodyCard>
      </div>
    </div>
  );
}
