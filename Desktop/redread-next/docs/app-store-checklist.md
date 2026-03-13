# App Store & Play Store — İncelemeye Gönderim Öncesi Kontrol Listesi
117 madde · iOS (App Store) & Android (Google Play)

iOS = Apple App Store'a özel | Android = Google Play'e özel | Her ikisi = her iki platform

---

## 1. Store Listing & Metadata

### Ortak
- [ ] Uygulama adı doğru ve tutarlı yazılmış
- [ ] Kısa açıklama (subtitle/tagline) dikkat çekici ve anahtar kelime içeriyor
- [ ] Uzun açıklama net, hatasız Türkçe/İngilizce ve iyi formatlanmış
- [ ] Anahtar kelimeler (keywords) optimize edilmiş — arama sıralamasına uygun
- [ ] Kategori ve alt kategori doğru seçilmiş
- [ ] İçerik derecelendirmesi (rating) doğru hesaplanmış (yaş sınırı)
- [ ] Gizlilik politikası URL'si geçerli ve erişilebilir
- [ ] Destek URL'si ve iletişim e-postası aktif

### iOS'a Özel
- [ ] App Store Connect'te Promotional Text (160 karakter) doldurulmuş
- [ ] Subtitle (30 karakter) optimize edilmiş
- [ ] App Store keywords alanı tam dolu (100 karakter limit)

### Android'e Özel
- [ ] Play Console kısa açıklama (80 karakter) doldurulmuş
- [ ] Tam açıklama (4000 karakter) optimize edilmiş
- [ ] Tags (etiketler) eklenmiş

---

## 2. Görseller & Ekran Görüntüleri

### iOS
- [ ] iPhone 6.9" (iPhone 16 Pro Max) ekran görüntüleri yüklenmiş (min 3, max 10)
- [ ] iPhone 6.7" / 6.5" ekran görüntüleri var ya da 6.9" kopyalanmış
- [ ] iPad Pro 13" ekran görüntüleri yüklenmiş (evrensel app ise zorunlu)
- [ ] Ekran görüntüleri gerçek uygulama içeriğini gösteriyor, placeholder yok
- [ ] Preview video varsa sessiz/sesli çalışıyor ve kuralları karşılıyor
- [ ] App Store icon 1024x1024 PNG, alfa kanalı yok

### Android
- [ ] En az 2 telefon ekran görüntüsü yüklenmiş (min 320px, max 3840px)
- [ ] Feature graphic 1024x500 PNG/JPG yüklenmiş (zorunlu)
- [ ] Tablet ekran görüntüleri yüklenmiş (tablet destek varsa)
- [ ] Promo grafik ve video opsiyonel ama varsa kuralları karşılıyor
- [ ] Uygulama ikonu 512x512 PNG

### Genel Görsel Kalitesi
- [ ] Tüm görseller yüksek çözünürlüklü, bulanık veya piksel sorun yok
- [ ] Görsellerde üçüncü taraf içerik, marka veya telif ihlali yok
- [ ] Dark/Light mode varsa iki tema için de görsel hazırlandı

---

## 3. Teknik Kalite & Performans

### Build & Derleme
- [ ] Release/Production build alındı, debug build gönderilmedi
- [ ] Minimum SDK/OS versiyonu kararlaştırıldı ve test edildi
- [ ] Uygulama boyutu makul (iOS <4GB OTA sınırı, Android <150MB APK veya AAB)
- [ ] ProGuard/R8 (Android) veya Bitcode (iOS) ayarları production için düzgün
- [ ] [Android] Android App Bundle (AAB) formatında gönderiliyor, APK değil
- [ ] [iOS] .ipa archive doğru certificate ve provisioning profile ile imzalı
- [ ] [iOS] App Store Connect'e Xcode ya da Transporter ile upload edildi, hata yok

### Çökme & Stabilite
- [ ] Başlangıç süresi (cold start) kabul edilebilir — iOS <2sn, Android <3sn
- [ ] Farklı cihazlarda (eski/yeni) test edildi, çökme yok
- [ ] Düşük RAM/bellek senaryolarında uygulama stabil
- [ ] Arka plana gidip gelme (background/foreground) normal çalışıyor
- [ ] Firebase Crashlytics veya Sentry entegre edilmiş ve test edildi

### Ağ & Offline
- [ ] İnternet yokken uygulama çökmüyor, uygun hata mesajı gösteriyor
- [ ] Yavaş ağ (3G simülasyonu) test edildi, timeout yönetimi var
- [ ] API hataları (4xx, 5xx) kullanıcı dostu mesajla ele alınıyor

---

## 4. UI/UX & Erişilebilirlik

### Platform Tasarım Standartları
- [ ] [iOS] Human Interface Guidelines'a uygun navigasyon (back gesture, tab bar)
- [ ] [Android] Material Design 3 kuralları takip ediliyor (navigation bar, FAB)
- [ ] Safe area / inset sorunları yok — notch, Dynamic Island, punch-hole destekleniyor
- [ ] Landscape ve portrait modlar düzgün görünüyor (ya da sadece biri destekleniyor)
- [ ] Farklı font boyutu ayarlarında (büyük yazı tipi) UI bozulmuyor
- [ ] Dark mode ve Light mode tam test edildi

### Erişilebilirlik
- [ ] VoiceOver (iOS) / TalkBack (Android) temel akış için test edildi
- [ ] Tüm görsellere accessibility label / content description eklenmiş
- [ ] Dokunma hedefleri yeterince büyük (min 44x44 pt iOS, 48x48 dp Android)
- [ ] Renk kontrastı WCAG AA standardını karşılıyor (4.5:1 metin için)

### Kullanıcı Akışı
- [ ] Onboarding / ilk açılış akışı sorunsuz çalışıyor
- [ ] Boş durum ekranları (empty state) var ve anlamlı
- [ ] Loading / skeleton ekranlar uygun yerde gösteriliyor
- [ ] Tüm form alanlarında keyboard type doğru (email, number, password vs.)
- [ ] Keyboard, alttaki içeriği kapatmıyor — scroll veya padding uygulandı

---

## 5. İzinler & Gizlilik

### İzin Yönetimi
- [ ] Sadece gerçekten kullanılan izinler isteniyor (kamera, konum, mikrofon vb.)
- [ ] İzin talep öncesi neden gerektiğini açıklayan rationale mesajı gösteriliyor
- [ ] [iOS] NSUsageDescription string'leri plist'te açık ve anlamlı
- [ ] [Android] Dangerous permissions manifest'te doğru tanımlı ve runtime isteniyor
- [ ] İzin reddedildiğinde uygulama çökmüyor, graceful degradation var

### Veri & Gizlilik
- [ ] [iOS] App Store Privacy Nutrition Label doldurulmuş ve doğru
- [ ] [Android] Play Console Data Safety formu doldurulmuş ve doğru
- [ ] Kullanıcıdan toplanan veriler gizlilik politikasında belirtilmiş
- [ ] KVKK / GDPR gereksinimlerine göre onay mekanizması var
- [ ] Üçüncü taraf SDK'lar (Analytics, Ads) gizlilik politikasında listelendi
- [ ] [iOS] IDFA kullanılıyorsa ATT framework ile izin isteniyor

---

## 6. Kimlik Doğrulama & Hesap

### Giriş & Kayıt
- [ ] [iOS] Sign in with Apple — hesap oluşturma varsa zorunlu olarak entegre edildi
- [ ] [Android] Google Sign-In SHA-1 fingerprint Play Console'a eklenmiş
- [ ] Şifre sıfırlama akışı çalışıyor
- [ ] Oturum süresi dolduğunda kullanıcı login ekranına yönlendiriliyor

### Hesap Silme
- [ ] [iOS] Hesap silme özelliği uygulama içinde mevcut (App Store zorunluluğu)
- [ ] [Android] Hesap silme Play Console'da belirtilen URL ile uyumlu
- [ ] Hesap silindiğinde kullanıcı verileri de siliniyor (KVKK)

---

## 7. Satın Alma & Abonelikler (IAP)

- [ ] Tüm IAP ürünleri App Store Connect / Play Console'da tanımlı ve approved
- [ ] Satın alma akışı test edildi (sandbox / test account)
- [ ] [iOS] Restore purchases düğmesi mevcut (App Store zorunluluğu)
- [ ] Ödeme başarısız / iptal senaryoları ele alınıyor
- [ ] Abonelik fiyatları ve yenileme koşulları kullanıcıya açıkça gösteriliyor
- [ ] Abonelik iptal bilgisi ve yönlendirmesi mevcut
- [ ] Server-side receipt validation uygulandı (güvenlik)

---

## 8. Bildirimler & Arka Plan

- [ ] Push notification izni zorunlu değil, opsiyonel akışta isteniyor
- [ ] APNs sertifikası / FCM ayarları production için yapılandırıldı
- [ ] Bildirim içerikleri Türkçe ve doğru yazılmış, deep link çalışıyor
- [ ] [iOS] Background fetch / background task iOS 17+ API'lerine uygun
- [ ] [Android] Battery optimization whitelist gerekiyorsa kullanıcı bilgilendiriliyor

---

## 9. Lokalizasyon & Dil

- [ ] Tüm kullanıcıya görünen string'ler lokalizasyon dosyasında, hard-coded yok
- [ ] Desteklenen diller App Store / Play Console'da işaretlenmiş
- [ ] Türkçe karakter (ı, ğ, ş, ç, ö, ü) her yerde doğru görünüyor
- [ ] Tarih, saat ve para birimi formatları Türkiye locale'ine göre doğru
- [ ] RTL dil desteği gerekiyorsa test edildi

---

## 10. Güvenlik

- [ ] API anahtarları ve secret'lar kaynak koda gömülmemiş
- [ ] HTTPS kullanılıyor, HTTP trafiği yok (ATS iOS, cleartext Android'de kapalı)
- [ ] SSL certificate pinning kritik endpoint'ler için uygulandı
- [ ] Kullanıcı şifresi veya token'ı Keychain (iOS) / EncryptedSharedPrefs (Android) ile saklanıyor
- [ ] Deep link / URL scheme manipülasyon testi yapıldı
- [ ] [Android] exported=true olan Activity/Service/Receiver'lar güvenli

---

## 11. Store Politika Uyumluluğu

### iOS App Store Guidelines
- [ ] Uygulama gerçek bir işlev sunuyor, sadece web wrapper değil
- [ ] İçerik kılavuz ihlali yok (pornografi, kumar, nefret söylemi vb.)
- [ ] Tarayıcı veya App Store'a yönlendiren harici ödeme yönlendirmesi yok (guideline 3.1.1)
- [ ] Kullanıcıyı yanıltıcı içerik veya uygulama adı yok
- [ ] Test, örnek, "beta" veya yarım işlevsellik içeren build gönderilmedi

### Google Play Policies
- [ ] Target API level güncel gereksinimlere uyuyor (API 34+)
- [ ] Yanıltıcı davranış, uygulama taklidi veya metadata manipülasyonu yok
- [ ] Play Integrity API ile uygulama bütünlüğü kontrol ediliyor (önerilir)

---

## 12. Son Kontroller — Göndermeden 24 Saat Önce

- [ ] Version number ve build number/version code doğru arttırıldı
- [ ] Release notes (What's New) her iki platform için yazıldı
- [ ] Phased release / staged rollout planlandı
- [ ] Beta test (TestFlight / Internal Track) son kullanıcı geri bildirimi alındı
- [ ] App Store Connect / Play Console'da iletişim bilgileri güncel
- [ ] Önceki versiyonla karşılaştırıldı, regresyon yok
- [ ] Backend / API üretim ortamına deploy edildi, staging değil
- [ ] Monitoring ve alert sistemi aktif (Crashlytics, Sentry, vs.)
- [ ] Lansman sonrası acil güncelleme planı (rollback veya hotfix) hazır
