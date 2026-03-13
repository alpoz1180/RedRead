-- ============================================================
-- Seed data — local development only
-- Creates 2 test users + 4 sample stories
-- NOTE: These are auth.users inserts for local Supabase only.
--       The handle_new_auth_user trigger will create the public.users rows.
-- ============================================================

-- Test user UUIDs (fixed so foreign keys work)
DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001';
  user2_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN

  -- Insert auth users (local dev only — Supabase Studio > Auth handles prod)
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    aud, role
  ) VALUES
  (
    user1_id, 'yazar1@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"display_name": "Yazar Bir"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
  ),
  (
    user2_id, 'yazar2@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"display_name": "Yazar İki"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

  -- public.users rows (trigger handles this, but seed explicitly in case trigger isn't set up yet)
  INSERT INTO public.users (id, email, username, display_name) VALUES
  (user1_id, 'yazar1@test.com', 'yazar1', 'Yazar Bir'),
  (user2_id, 'yazar2@test.com', 'yazar2', 'Yazar İki')
  ON CONFLICT (id) DO NOTHING;

  -- Sample stories
  INSERT INTO stories (
    id, title, content, description, author_id,
    genre, published, status, word_count, likes_count,
    published_at, cover_gradient
  ) VALUES
  (
    gen_random_uuid(),
    'Gece Yarısı Yağmuru',
    'Pencereden dışarı baktığımda yağmur başlamıştı. Sokak lambaları ıslak kaldırımda dans ediyordu. Bu şehirde yalnız olmak bazen güzeldi, bazen de dayanılmaz. Ona son kez gördüğümde de yağmur yağıyordu. Belki de yağmur bizim hikayemizin işaretiydi — başlangıcının da, sonunun da.',
    'İki yabancının yağmurlu bir gecedeki tesadüf buluşması.',
    user1_id,
    'Romantik', true, 'published', 62, 0,
    NOW() - INTERVAL '3 days',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  ),
  (
    gen_random_uuid(),
    'Kayıp Anahtar',
    'Sabah uyandığımda anahtarım yerinde yoktu. Sıradan bir şey gibi görünüyordu bu — ta ki kapının açık olduğunu fark edene kadar. İçeri giren mi yoksa dışarı çıkan mı vardı? Komşularımı düşündüm. Hepsini ayrı ayrı şüpheli buluyordum artık. Belki de sorun bendeydi. Belki de her şey kafamda olup bitiyordu.',
    'Sıradan bir sabahın paranoyaya dönüşmesi.',
    user1_id,
    'Gerilim', true, 'published', 67, 0,
    NOW() - INTERVAL '1 day',
    'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #2d1b00 100%)'
  ),
  (
    gen_random_uuid(),
    'Büyükanne''nin Mutfağı',
    'O mutfaktan hiç çıkmak istemezdim çocukken. Tarçın ve elma kokusu her şeyi güzel yapardı. Büyükannem hamuru yoğururken şarkı söylerdi, eski Türkçe türküler. Kelimeleri anlamasam da melodiyi hâlâ duyabilirim. Şimdi o mutfak yok. Ev satıldı, büyükannem gitti. Ama koku hâlâ orada, bir yerde — hafızamın en derin rafında.',
    'Çocukluğun ve kaybın güzel bir anlatısı.',
    user2_id,
    'Dram', true, 'published', 72, 0,
    NOW() - INTERVAL '5 days',
    'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #F4A460 100%)'
  ),
  (
    gen_random_uuid(),
    'Taslak Hikaye',
    'Bu bir taslak. Henüz tamamlanmadı.',
    NULL,
    user2_id,
    'Macera', false, 'draft', 8, 0,
    NULL,
    'linear-gradient(135deg, #FF6122 0%, #ff9a3c 50%, #ffcd6b 100%)'
  )
  ON CONFLICT DO NOTHING;

END $$;
