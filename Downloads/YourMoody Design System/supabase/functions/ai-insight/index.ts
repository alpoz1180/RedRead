import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface MoodEntry {
  id: string;
  mood_level: number;
  mood_emoji: string;
  activities: string[] | null;
  note: string | null;
  created_at: string;
}

// Rate limiting: 5 requests per minute per user
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const userRequestMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRecord = userRequestMap.get(userId);

  if (!userRecord || now > userRecord.resetAt) {
    // New user or window expired
    userRequestMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (userRecord.count >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  // Increment count
  userRecord.count++;
  return true;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Invalid authentication token");
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({
          error: "Çok fazla istek gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.",
          success: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: moodEntries, error: entriesError } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (entriesError) {
      throw entriesError;
    }

    if (!moodEntries || moodEntries.length === 0) {
      return new Response(
        JSON.stringify({
          insight: "Henüz yeterli veri yok. İlk mood kayıtlarını yapmaya başla ve AI içgörüleri al!",
          success: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const moodLabels: Record<number, string> = {
      5: "Harika",
      4: "Mutlu",
      3: "Sakin",
      2: "Normal",
      1: "Üzgün",
      0: "Sinirli",
    };

    const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

    const dayMoodMap: Record<string, number[]> = {};
    const activityMoodMap: Record<string, number[]> = {};
    let totalMood = 0;

    moodEntries.forEach((entry: MoodEntry) => {
      const date = new Date(entry.created_at);
      const dayName = dayNames[date.getDay()];

      if (!dayMoodMap[dayName]) dayMoodMap[dayName] = [];
      dayMoodMap[dayName].push(entry.mood_level);

      entry.activities?.forEach((activity) => {
        if (!activityMoodMap[activity]) activityMoodMap[activity] = [];
        activityMoodMap[activity].push(entry.mood_level);
      });

      totalMood += entry.mood_level;
    });

    const avgMood = (totalMood / moodEntries.length).toFixed(1);

    const dayAverages = Object.entries(dayMoodMap).map(([day, moods]) => ({
      day,
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
      count: moods.length,
    })).sort((a, b) => b.avg - a.avg);

    const activityAverages = Object.entries(activityMoodMap).map(([activity, moods]) => ({
      activity,
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
      count: moods.length,
    })).sort((a, b) => b.avg - a.avg);

    const moodSummary = moodEntries
      .map((entry: MoodEntry) => {
        const date = new Date(entry.created_at);
        const dateStr = date.toLocaleDateString("tr-TR");
        const dayName = dayNames[date.getDay()];
        const hour = date.getHours();
        const timeOfDay = hour < 12 ? "sabah" : hour < 18 ? "öğleden sonra" : "akşam";
        const mood = moodLabels[entry.mood_level] || "Bilinmiyor";
        const activities = entry.activities?.join(", ") || "Yok";
        const note = entry.note ? ` - "${entry.note}"` : "";
        return `• ${dateStr} (${dayName}, ${timeOfDay}): ${mood} (${entry.mood_level}/5) | Aktiviteler: ${activities}${note}`;
      })
      .join("\n");

    const bestDay = dayAverages[0];
    const worstDay = dayAverages[dayAverages.length - 1];
    const bestActivity = activityAverages[0];
    const worstActivity = activityAverages[activityAverages.length - 1];

    const firstHalf = moodEntries.slice(Math.ceil(moodEntries.length / 2));
    const secondHalf = moodEntries.slice(0, Math.ceil(moodEntries.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum: number, e: MoodEntry) => sum + e.mood_level, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum: number, e: MoodEntry) => sum + e.mood_level, 0) / secondHalf.length;
    const trend = secondHalfAvg > firstHalfAvg ? "iyileşiyor" : secondHalfAvg < firstHalfAvg ? "düşüyor" : "stabil";
    const trendPercent = Math.abs(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(0);

    const prompt = `Sen bir psikoloji uzmanı ve veri analistisin. Kullanıcının mood verilerini analiz et ve gerçekten şaşırtıcı, kişisel bir içgörü üret.

DETAYLI VERİLER:
${moodSummary}

ANALİTİK BULGULAR:
- Ortalama mood: ${avgMood}/5
- Trend: ${trend} (%${trendPercent})
- En iyi gün: ${bestDay?.day} (ort. ${bestDay?.avg.toFixed(1)}/5, ${bestDay?.count} kayıt)
- En zor gün: ${worstDay?.day} (ort. ${worstDay?.avg.toFixed(1)}/5, ${worstDay?.count} kayıt)
${bestActivity ? `- En pozitif aktivite: ${bestActivity.activity} (ort. ${bestActivity.avg.toFixed(1)}/5, ${bestActivity.count} kez)` : ''}
${worstActivity ? `- En negatif aktivite: ${worstActivity.activity} (ort. ${worstActivity.avg.toFixed(1)}/5, ${worstActivity.count} kez)` : ''}

GÖREVİN:
1. Şok edici bir gözlem ile başla
2. Neden böyle olduğunu kısaca açıkla
3. Somut ve uygulanabilir bir öneri ver

KURALLAR:
- Maksimum 4 cümle
- Türkçe
- Markdown kullanma, # veya ** gibi işaretler kullanma
- Emoji kullanma
- Sadece düz metin yaz`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      throw new Error(`Anthropic API error: ${errorText}`);
    }

    const anthropicData = await anthropicResponse.json();
    const rawInsight = anthropicData.content[0].text.trim();

    const cleanInsight = rawInsight
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^[🎯✨💡🔍📊]\s*/gm, '')
      .replace(/^(İçgörü|Şaşırtıcı Bulgu|Bulgu)\s*[:\-]?\s*/gi, '')
      .trim();

    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight: cleanInsight,
      });

    if (insertError) {
      console.error('Error saving insight:', insertError);
    }

    return new Response(
      JSON.stringify({
        insight: cleanInsight,
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});