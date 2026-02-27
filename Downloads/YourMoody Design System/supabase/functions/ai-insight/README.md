# AI Insight Edge Function

Claude AI kullanarak kullanıcının mood verilerine dayanarak kişiselleştirilmiş içgörüler üretir.

## Setup

### 1. Anthropic API Key Ekle

```bash
# Supabase secrets ile
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Deploy

```bash
supabase functions deploy ai-insight
```

## Usage

### Request

```typescript
POST https://your-project.supabase.co/functions/v1/ai-insight
Headers:
  Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
  Content-Type: application/json
```

### Response

```json
{
  "insight": "Bu hafta ruh halin genelde pozitif! Spor ve arkadaşlarla zaman geçirmek seni mutlu ediyor. Bu aktivitelere devam et!",
  "success": true
}
```

## Error Handling

- Kullanıcı authenticate değilse → 401
- Veri yoksa → Empty state mesajı
- API hatası → 500 with error message

## Environment Variables

- `ANTHROPIC_API_KEY` - Claude API key
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided
