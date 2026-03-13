# Profile Edit & Settings Sheets — Design Spec
Date: 2026-03-13

## Overview
Two bottom sheet components for profile editing and app settings.
EditProfileSheet (triggered by "Profili Düzenle") and SettingsSheet (triggered by Settings icon).

## Architecture

### New Files
- `src/components/redread/EditProfileSheet.tsx`
- `src/components/redread/SettingsSheet.tsx`
- `public/sw.js` — Service Worker for push notifications

### Modified Files
- `src/components/redread/Profile.tsx` — onClick handlers for both buttons
- `src/contexts/AuthContext.tsx` — signOut exposed (already exists)

---

## EditProfileSheet

### Fields
| Field | Type | Constraint |
|-------|------|-----------|
| Avatar | file input | jpg/png/webp, max 2MB → supabase storage `avatars` bucket |
| display_name | text | max 50 chars |
| username | text | `/^[a-z0-9_]{3,30}$/`, unique check (debounce 500ms) |
| bio | textarea | max 160 chars, character counter |
| social_links.twitter | text | URL |
| social_links.instagram | text | URL |
| social_links.website | text | URL |

### Data Flow
1. User opens sheet → fields prefilled from profileUser
2. Avatar change → FileReader preview → on save: storage.upload(`${userId}/avatar.jpg`)
3. Username change → debounced uniqueness check against `public.users`
4. Save → `supabase.from('users').update({...}).eq('id', userId)`
5. On success → callback refreshes Profile parent state → sheet closes

### Required SQL
```sql
alter table public.users add column if not exists social_links jsonb default '{}';
```

---

## SettingsSheet

### Sections
1. **Görünüm** — dark/light theme toggle (ThemeContext)
2. **Hesap** — Dil (UI placeholder), Şifre Değiştir (resetPassword email)
3. **Bildirimler** — "Yeni beğeni" + "Yeni takipçi" toggles
   - Toggle on → `Notification.requestPermission()` → get PushSubscription
   - Store in `public.push_subscriptions` (user_id, subscription JSONB)
   - Toggle off → delete subscription from table
4. **Diğer** — Gizlilik Politikası link (/privacy)
5. **Çıkış Yap** — orange outlined button
6. **Hesabı Sil** — red text button → triggers existing delete dialog in Profile.tsx

---

## Push Notifications (Split Task)

### Frontend (this PR)
- `public/sw.js` — registers push event listener, shows notification
- SettingsSheet registers/unregisters PushSubscription
- Stores subscription in `push_subscriptions` table

### Backend (separate agent task)
- SQL: `push_subscriptions` table migration
- Supabase Edge Function: `send-push`
  - Triggered by `likes` insert → notify story author
  - Triggered by `follows` insert → notify followed user
- VAPID key pair generation + secrets

### User Manual Steps (Backend)
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Add to `.env.local`: `NEXT_PUBLIC_VAPID_KEY=<publicKey>`
3. Add to Supabase secrets: `VAPID_PRIVATE_KEY=<privateKey>`, `VAPID_PUBLIC_KEY=<publicKey>`
4. Run SQL migration (provided by backend agent)
5. Deploy Edge Function: `supabase functions deploy send-push`

---

## Sheet UX
- `motion/react` — y: "100%" → y: 0, backdrop blur overlay
- Mobile: full width, max-height 90vh, scrollable
- Desktop: max-width 480px, centered, same animation
- Overlay click → closes sheet
- ESC key → closes sheet
