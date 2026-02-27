# Supabase Database Setup

## Database Schema

Bu proje için gerekli veritabanı yapısı:

### Tables

1. **profiles** - Kullanıcı profil bilgileri
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → auth.users)
   - `username` (TEXT, Unique)
   - `full_name` (TEXT)
   - `avatar_url` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **mood_entries** - Mood kayıtları
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → auth.users)
   - `mood_level` (INTEGER, 1-5 arası)
   - `mood_emoji` (TEXT)
   - `activities` (TEXT[])
   - `note` (TEXT)
   - `created_at` (TIMESTAMP)

## Migration Nasıl Çalıştırılır?

### Option 1: Supabase Dashboard (SQL Editor)

1. Supabase Dashboard'a gidin: https://app.supabase.com
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü açın
4. **New Query** butonuna tıklayın
5. `migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
6. **Run** butonuna tıklayın

### Option 2: Supabase CLI

```bash
# Supabase CLI'yi yükleyin (eğer yüklü değilse)
npm install -g supabase

# Supabase projenize bağlanın
supabase link --project-ref your-project-ref

# Migration'ı çalıştırın
supabase db push
```

## Row Level Security (RLS)

Tüm tablolar RLS ile korunmaktadır:
- Kullanıcılar sadece kendi verilerini görüntüleyebilir
- Kullanıcılar sadece kendi verilerini oluşturabilir, güncelleyebilir ve silebilir

## Otomatik Trigger'lar

- **Auto-create profile**: Yeni kullanıcı kaydolduğunda otomatik olarak profil oluşturulur
- **Auto-update timestamp**: Profile güncellendiğinde `updated_at` otomatik güncellenir
