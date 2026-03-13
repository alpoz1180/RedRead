# Redread — Project Memory

## Nedir
Wattpad benzeri Türkçe hikaye okuma/yazma platformu. Mobil-first (max 430px) web uygulaması.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + React Compiler
- **Styling:** Tailwind CSS 4 + inline styles (büyük kısmı inline)
- **UI Kit:** shadcn/ui (`src/app/components/ui/`)
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **AI:** Google Gemini 2.5 Flash (hikaye önerileri)
- **i18n:** next-intl (tr/en, varsayılan tr)
- **Icons:** lucide-react
- **Animation:** motion (framer-motion)
- **Port:** 4000

## Ortam Değişkenleri (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase proje URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side Supabase (API routes)
- `SUPABASE_DB_PASSWORD` — DB password
- `GEMINI_API_KEY` — Google Gemini API key

## Dizin Yapısı
```
src/
├── app/
│   ├── [locale]/              # i18n rotalar (tr/en)
│   │   ├── layout.tsx         # I18nProvider wrapper
│   │   ├── page.tsx           # → RedreadRoot
│   │   ├── profile/[username]/page.tsx
│   │   ├── story/[id]/page.tsx
│   │   ├── wattpad/page.tsx
│   │   └── write/page.tsx
│   ├── api/recommendations/route.ts  # Gemini AI öneri API
│   ├── components/
│   │   ├── Auth.tsx           # Login/Register UI
│   │   ├── SupabaseTest.tsx
│   │   └── write/             # Yazma editörü alt bileşenleri
│   │       ├── AutoSaveIndicator.tsx
│   │       ├── CharacterCounter.tsx
│   │       ├── FloatingActionButton.tsx
│   │       ├── GenreSelector.tsx
│   │       └── WriteStoryModal.tsx
│   ├── constants/
│   │   ├── design.ts          # Eski dark tema renkleri (kullanılmıyor olabilir)
│   │   └── stories.ts         # Statik dummy hikayeler
│   ├── globals.css
│   ├── layout.tsx             # Root layout (html lang=tr)
│   └── page.tsx               # Root → RedreadRoot
├── components/redread/        # Ana uygulama bileşenleri
│   ├── RedreadRoot.tsx        # App shell (onboarding → ana uygulama)
│   ├── Onboarding.tsx         # Splash → Tür seçimi → Auth
│   ├── TopBar.tsx             # Üst navigasyon
│   ├── BottomNav.tsx          # Alt tab bar (home/browse/library/write/profile)
│   ├── StoryFeed.tsx          # Ana sayfa feed (featured + AI öneriler + trend)
│   ├── Profile.tsx            # Profil sayfası
│   ├── WriteEditor.tsx        # Hikaye yazma editörü
│   └── figma/ImageWithFallback.tsx
├── components/wattpad/
│   └── WattpadHome.tsx        # Wattpad klonu sayfası
├── contexts/
│   └── AuthContext.tsx         # Supabase Auth provider (Google/Apple/Email)
├── hooks/
│   ├── useAuthSafe.ts         # Auth user ID (null-safe)
│   ├── useWriteStore.ts       # Yazma state yönetimi (Supabase + localStorage fallback)
│   ├── stories/
│   │   ├── useAIRecommendations.ts  # AI öneri hook
│   │   └── useCreateStory.ts
│   └── utils/
│       ├── useAutoSave.ts
│       └── useLocalStorage.ts
├── i18n/
│   ├── provider.tsx           # next-intl client provider
│   ├── tr.json
│   └── en.json
├── lib/
│   ├── gemini.ts              # Client-side: fetch /api/recommendations
│   ├── supabase.ts            # Browser Supabase client (createBrowserClient)
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── services/
│   ├── stories.service.ts     # CRUD hikaye servisi (list/get/create/update/delete/like/bookmark)
│   ├── write.service.ts       # Yazma servisi (story+chapter CRUD, Supabase)
│   └── index.ts
├── styles/
│   └── theme.css
└── types/
    └── database.ts            # User, Story, Chapter, Like, Bookmark, Comment tipleri
```

## Veritabanı (Supabase PostgreSQL)

### Tablolar
- **users** — id, email, username, display_name, bio, avatar_url
- **stories** — id, title, content, description, author_id, genre, published, status (draft/published), word_count, likes_count, cover_gradient, published_at
- **chapters** — id, story_id (FK→stories CASCADE), title, content, sort_order, word_count
- **likes** — id, user_id, story_id
- **bookmarks** — id, user_id, story_id
- **comments** — id, story_id, user_id, content

### RLS Politikaları
- stories: published olanları herkes okur, kendi hikayelerini CRUD
- chapters: published hikayelerin bölümlerini herkes okur, kendi hikayelerinin bölümlerini CRUD
- users: herkes profil okur, kendi profilini günceller
- likes: herkes okur, kendi like'ını insert/delete
- bookmarks: kendi bookmark'larını okur/insert/delete

### Migrations
- `001_chapters.sql` — chapters tablosu + cover_gradient kolonu + RLS + trigger
- `002_fix_rls.sql` — Tüm tabloların RLS politikalarını düzelt

## Uygulama Akışı
1. **Onboarding** (3 adım): Splash → Tür seçimi (localStorage'a kaydeder) → Auth (Google/Email/Atla)
2. **Ana Sayfa** (StoryFeed): Featured kart + trending tag'ler + kategori filtreleri + "Sana Özel" AI öneriler + Trend hikayeler grid
3. **Yazma** (WriteEditor): Hikaye oluştur/düzenle, bölüm yönetimi, otomatik kayıt, tür seçimi
4. **Profil**: Kullanıcı bilgileri ve hikayeleri

## Tab Navigasyonu (BottomNav)
- Ana Sayfa (home) → StoryFeed
- Keşfet (browse) → StoryFeed (aynı)
- Kütüphane (library) → Placeholder "yakında..."
- Yaz (write) → WriteEditor (kendi chrome'u var, TopBar/BottomNav gizlenir)
- Profil (profile) → Profile

## AI Öneri Sistemi
- Client: `getAIRecommendations()` → POST `/api/recommendations`
- Server: Supabase'den published hikayeleri çeker → Gemini'ye gönderir → sıralı ID listesi döner
- Fallback: Gemini yoksa/hata verirse son published hikayeleri döner
- UI: "Sana Özel" sekmesinde 2-sütun grid olarak gösterir

## Bilinen Sorunlar
- "Sana Özel" bölümü Supabase'de hikaye yoksa sonsuz spinner gösterebilir (error state UI eksik)
- Keşfet ve Ana Sayfa aynı bileşeni render ediyor (ayrım yok)
- Kütüphane sayfası placeholder
- StoryFeed'de featured kart ve trend hikayeler hardcoded (Supabase'den gelmiyor)
- `design.ts` dark tema renkleri var ama uygulama açık tema (turuncu/beyaz) kullanıyor — tutarsızlık
- Routing: Hem `/` hem `/[locale]/` aynı RedreadRoot'u render ediyor
- Story detay ve profil sayfaları tam kontrol edilmedi

## Tasarım
- **Renk paleti:** Turuncu (#FF6122) accent, beyaz/krem (#FAFAF8) arka plan, dark text (#1A1713)
- **Font:** Lora (serif, başlıklar) + Nunito (sans, body) — CSS'den yükleniyor
- **Mobil-first:** max-width 430px, centered, box-shadow ile telefon efekti
- **Stil yaklaşımı:** Çoğunlukla inline styles, az miktarda CSS class (style tag içinde)
