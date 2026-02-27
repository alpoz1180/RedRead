# Supabase Edge Functions

## Setup

### 1. Supabase CLI Yükle

```bash
npm install -g supabase
```

### 2. Login

```bash
supabase login
```

### 3. Link Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Deploy AI Insight Function

### 1. Anthropic API Key Ekle

Önce Anthropic'den API key al: https://console.anthropic.com/

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 2. Deploy

```bash
supabase functions deploy ai-insight
```

### 3. Test

```bash
# Get your JWT token from Supabase Dashboard
curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/ai-insight' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json'
```

## Functions

### ai-insight

**Purpose:** Claude AI kullanarak kullanıcının son 7 günlük mood verilerine dayanarak kişiselleştirilmiş içgörü üretir.

**Auth:** Required (JWT token)

**Method:** POST

**Response:**
```json
{
  "insight": "Bu hafta ruh halin genelde pozitif! Spor ve arkadaşlarla zaman geçirmek seni mutlu ediyor.",
  "success": true
}
```

## Environment Variables

Edge functions otomatik olarak şu değişkenlere erişir:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (Manuel eklenmeli)

## Logs

```bash
# Real-time logs
supabase functions serve ai-insight

# View logs
supabase functions logs ai-insight
```

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
```bash
supabase secrets set ANTHROPIC_API_KEY=your_key
```

### "Invalid authentication token"
- JWT token'ın geçerli olduğundan emin ol
- Supabase Dashboard'dan yeni token al

### "Not enough mood data"
- Kullanıcının en az 1 mood entry'si olmalı
- Son 7 gün içinde kayıt yapılmış olmalı
