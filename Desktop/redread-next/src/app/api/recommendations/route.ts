import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Lazy singleton — initialized on first request, not at build time
let supabase: ReturnType<typeof createClient> | null = null;

// In-memory rate limiter: IP başına 60 saniyede max 5 istek
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

export async function POST(req: NextRequest) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const userGenres: string[] = Array.isArray(body.userGenres) ? body.userGenres.slice(0, 10) : [];
    const limit = Math.min(Math.max(1, Number(body.limit) || 6), 20);

    let query = getSupabase()
      .from("stories")
      .select("id, title, description, genre, word_count, likes_count, cover_gradient, author:users!author_id(username, display_name)")
      .eq("published", true)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: storiesRaw, error } = await query;
    const stories = storiesRaw as Array<{ id: string; title: string; description: string | null; genre: string | null; word_count: number; likes_count: number; cover_gradient: string | null }>;

    if (error || !stories || stories.length === 0) {
      return NextResponse.json({ recommendations: [], source: "empty" });
    }

    // 2. Gemini yoksa fallback sıralama
    if (!GEMINI_KEY) {
      const ids = stories.slice(0, limit).map((s) => s.id);
      return NextResponse.json({ recommendations: ids, source: "fallback" });
    }

    // 3. Gemini ile kişiselleştirilmiş öneri
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const storySummaries = stories.map((s, i) => ({
      idx: i,
      id: s.id,
      title: s.title,
      genre: s.genre,
      desc: s.description,
      words: s.word_count,
      likes: s.likes_count,
    }));

    const prompt = `Sen bir hikaye öneri sistemisin. Kullanıcının sevdiği türler: ${userGenres.length > 0 ? userGenres.join(", ") : "henüz belirtmemiş"}.

Aşağıdaki hikaye listesinden kullanıcıya en uygun ${limit} tanesini seç ve sırala.
Seçim kriterlerin:
- Kullanıcının tür tercihlerine uygunluk (en önemli)
- Hikayenin kalitesi (kelime sayısı, açıklama zenginliği)
- Beğeni sayısı
- Çeşitlilik (farklı türlerden de öner)

Hikayeler:
${JSON.stringify(storySummaries, null, 0)}

SADECE bir JSON array döndür, içinde story id'leri olsun, en uygun olan başta. Başka hiçbir şey yazma.
Örnek: ["id1","id2","id3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const ids: string[] = JSON.parse(jsonMatch[0]);
      // Validate — only return IDs that exist in our stories
      const validIds = ids.filter((id) => stories.some((s) => s.id === id));
      return NextResponse.json({
        recommendations: validIds.slice(0, limit),
        source: "gemini",
      });
    }

    // Gemini parse failed — fallback
    const ids = stories.slice(0, limit).map((s) => s.id);
    return NextResponse.json({ recommendations: ids, source: "fallback" });
  } catch (err) {
    console.error("Recommendations API error (using fallback):", err);
    // Graceful fallback — still return stories, just not AI-sorted
    try {
      const { data } = await getSupabase()
        .from("stories")
        .select("id")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      return NextResponse.json({
        recommendations: (data || []).map((s: { id: string }) => s.id),
        source: "fallback",
      });
    } catch {
      return NextResponse.json({ recommendations: [], source: "fallback" });
    }
  }
}
