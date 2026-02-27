import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Database, Lock, Users, FileText, Mail } from 'lucide-react';
import { MoodyCard } from '../MoodyCard';

export function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: '1. Toplanan Veriler',
      content: [
        'Ruh hali kayıtlarınız (mood seviyesi, emoji, aktiviteler, notlar)',
        'Hesap bilgileri (e-posta adresi, şifre - şifrelenmiş)',
        'Profil bilgileri (isim, avatar emoji)',
        'Kullanım verileri (giriş zamanları, özellik kullanımı)',
        'Cihaz bilgileri (tarayıcı türü, işletim sistemi, IP adresi)',
      ],
    },
    {
      icon: FileText,
      title: '2. Verilerin Kullanımı',
      content: [
        'Kişiselleştirilmiş ruh hali içgörüleri ve analizler sunmak',
        'AI destekli öneriler ve trend analizleri sağlamak',
        'Uygulama performansını izlemek ve iyileştirmek',
        'Kullanıcı deneyimini geliştirmek ve özelleştirmek',
        'Teknik sorunları tespit etmek ve çözmek',
        'Güvenlik ve dolandırıcılık önleme',
      ],
    },
    {
      icon: Lock,
      title: '3. Veri Saklama ve Güvenlik',
      content: [
        'Tüm verileriniz Supabase (PostgreSQL) veritabanında güvenli şekilde saklanır',
        'Veriler şifreli HTTPS bağlantısı üzerinden iletilir',
        'Şifreler bcrypt algoritması ile hash\'lenerek saklanır',
        'Row Level Security (RLS) ile yalnızca sizin verilerinize erişebilirsiniz',
        'Düzenli güvenlik güncellemeleri ve yedeklemeler yapılır',
        'Veriler Avrupa (EU) bölgesindeki sunucularda saklanır (GDPR uyumlu)',
      ],
    },
    {
      icon: Users,
      title: '4. Üçüncü Taraf Paylaşımı',
      content: [
        'Verilerinizi üçüncü taraflarla SATMIYORUZ veya KİRALAMIYORUZ',
        'AI içgörüleri için Anthropic (Claude) API kullanılır - sadece analiz amaçlı',
        'AI analizi için gönderilen veriler saklanmaz ve eğitim için kullanılmaz',
        'Ödeme işlemleri için güvenli ödeme sağlayıcıları kullanılır (kart bilgileri saklanmaz)',
        'Yasal zorunluluk olmadıkça verileriniz paylaşılmaz',
      ],
    },
    {
      icon: Shield,
      title: '5. Kullanıcı Hakları (KVKK & GDPR)',
      content: [
        'Verilerinize erişme hakkı: Profil sayfanızdan tüm verilerinizi görebilirsiniz',
        'Veri silme hakkı: Hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz',
        'Veri taşınabilirliği: Verilerinizi JSON formatında dışa aktarabilirsiniz',
        'Düzeltme hakkı: Profil bilgilerinizi istediğiniz zaman güncelleyebilirsiniz',
        'Rıza geri çekme: Hesabınızı silerek hizmet kullanımını durdurabilirsiniz',
      ],
    },
    {
      icon: FileText,
      title: '6. Çerezler ve Analitik',
      content: [
        'Oturum çerezleri: Giriş durumunuzu saklamak için kullanılır (zorunlu)',
        'Yerel depolama: Tema tercihi ve offline sync için kullanılır',
        'Üçüncü taraf analitik araçları kullanılmamaktadır (gizlilik önceliğimiz)',
        'Reklam takip çerezleri YOKTUR',
        'Çerezleri tarayıcı ayarlarından silebilirsiniz',
      ],
    },
    {
      icon: Mail,
      title: '7. İletişim ve Sorular',
      content: [
        'Gizlilik politikamız hakkında sorularınız için:',
        'E-posta: privacy@yourmoody.com',
        'Veri silme talepleri 30 gün içinde işleme alınır',
        'KVKK başvuruları için: kvkk@yourmoody.com',
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
                <Shield className="w-6 h-6 text-coral" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gizlilik Politikası</h1>
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
              YourMoody olarak, gizliliğiniz bizim için en önemli önceliktir. Bu gizlilik politikası, 
              kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu 
              açıklamaktadır.
            </p>
            <p className="text-white/80 leading-relaxed">
              Hizmetimizi kullanarak, bu gizlilik politikasını kabul etmiş olursunuz. 
              Politikamızda değişiklik yapılması durumunda, uygulama içinde bildirim yapılacaktır.
            </p>
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

        {/* Footer Note */}
        <MoodyCard>
          <div className="space-y-3">
            <p className="text-white/60 text-sm leading-relaxed">
              Bu gizlilik politikası, Türkiye Cumhuriyeti Kişisel Verilerin Korunması Kanunu (KVKK) 
              ve Avrupa Birliği Genel Veri Koruma Yönetmeliği (GDPR) kapsamında hazırlanmıştır.
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              Sorularınız veya talepleriniz için{' '}
              <a href="mailto:privacy@yourmoody.com" className="text-coral hover:underline">
                privacy@yourmoody.com
              </a>{' '}
              adresinden bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </MoodyCard>
      </div>
    </div>
  );
}
