"use client";

import { useState, useEffect } from "react";
import { Eye, Star, Heart, TrendingUp, Sparkles, Feather, Loader2, Wand2 } from "lucide-react";
import { getAIRecommendations } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { GENRE_NAMES } from "@/constants/genres";




interface FeaturedStory {
  title: string;
  author: string;
  reads: string;
  votes: string;
  chapters: number;
  desc: string;
  bg: string;
}

interface TrendStory {
  id: string;
  title: string;
  author: string;
  genre: string;
  reads: string;
  votes: string;
  isNew: boolean;
  isHot: boolean;
  bg: string;
  initial: string;
}

const categories = GENRE_NAMES;
const trendingTags = ["#YavaşYanma", "#DüşmandanSevgiliye", "#MagicSchool", "#YeniYetişkin", "#Gerilim"];

interface AIStory {
  id: string;
  title: string;
  genre: string | null;
  cover_gradient: string | null;
  word_count: number;
  likes_count: number;
  author?: { username: string; display_name: string | null }[] | null;
}

function isAIStory(value: unknown): value is AIStory {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v["id"] === "string" && typeof v["title"] === "string";
}

export function StoryFeed() {
  const [activeCategory, setActiveCategory] = useState("Romantizm");
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set());
  // TODO: Gerçek API'den çekilecek — şu an boş gösteriliyor
  const [featured, setFeatured] = useState<FeaturedStory | null>(null);
  // TODO: Gerçek API'den çekilecek — şu an boş gösteriliyor
  const [stories, setStories] = useState<TrendStory[]>([]);
  const [aiStories, setAiStories] = useState<AIStory[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>("");
  const [aiFetched, setAiFetched] = useState(false);

  // AI önerileri yükle — sadece "Sana Özel" ilk seçildiğinde
  useEffect(() => {
    if (activeCategory !== "Sana Özel" || aiFetched) return;
    let cancelled = false;

    async function fetchAI() {
      setAiLoading(true);
      try {
        let userGenres: string[] = [];
        try {
          const stored = localStorage.getItem("user_genres");
          if (stored) userGenres = JSON.parse(stored);
        } catch (err) {
            console.error("localStorage genre parse error:", err);
          }

        const { ids, source } = await getAIRecommendations(userGenres, 6);
        if (cancelled) return;
        setAiSource(source);

        if (ids.length > 0) {
          const { data } = await supabase
            .from("stories")
            .select("id, title, genre, cover_gradient, word_count, likes_count, author:users!author_id(username, display_name)")
            .in("id", ids);

          if (data && !cancelled) {
            const sorted = ids.map(id => (data as unknown[]).find((s): s is AIStory => isAIStory(s) && s.id === id)).filter((s): s is AIStory => s !== undefined);
            setAiStories(sorted);
          }
        } else {
          // Fallback: direkt son published hikayeleri göster
          const { data } = await supabase
            .from("stories")
            .select("id, title, genre, cover_gradient, word_count, likes_count, author:users!author_id(username, display_name)")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(6);
          if (data && !cancelled) {
            setAiStories((data as unknown[]).filter(isAIStory));
            setAiSource("direct");
          }
        }
      } catch (err) {
        console.error("AI feed error:", err);
      }
      if (!cancelled) {
        setAiLoading(false);
        setAiFetched(true);
      }
    }
    fetchAI();
    return () => { cancelled = true; };
  }, [activeCategory, aiFetched]);

  const toggleLibrary = (id: string) => {
    setLibraryIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{
      paddingTop: 65, paddingBottom: 80,
      background: "var(--background)", minHeight: "100vh",
      overflowY: "auto",
    }}>
      <style>{`
        .story-card {
          border-radius: 12px; overflow: hidden; cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s;
          background: var(--card); box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        }
        .story-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.13); }
        .cat-pill {
          padding: 7px 16px; border-radius: 999px;
          border: 1.5px solid var(--muted); background: var(--card); color: var(--muted-foreground);
          font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 12px;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: all 0.18s;
        }
        .cat-pill.active { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
        .cat-pill:hover:not(.active) { border-color: var(--primary); color: var(--primary); }
        .tag-chip {
          padding: 5px 12px; border-radius: 999px;
          background: var(--secondary); color: var(--primary);
          font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: background 0.15s;
        }
        .tag-chip:hover { background: var(--primary-border); }
        .lib-btn {
          width: 30px; height: 30px; border-radius: 50%; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s; flex-shrink: 0;
        }
        .lib-btn.inactive { background: var(--card); color: var(--muted-foreground); }
        .lib-btn.active   { background: var(--primary); color: white; }
        .lib-btn:hover { transform: scale(1.1); }
        .stat-inline { display: inline-flex; align-items: center; gap: 3px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.3s ease both; }
      `}</style>

      {/* FEATURED */}
      {featured !== null && (
      <div className="fade-up" style={{ margin: "20px 16px 0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(255,97,34,0.25)", cursor: "pointer" }}>
        <div style={{ background: featured.bg, padding: "28px 20px 24px", position: "relative", minHeight: 200 }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", right: 20, bottom: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "white", padding: "4px 10px", borderRadius: 6, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 12 }}>
              <Star size={10} strokeWidth={2.5} fill="white" /> EDİTÖRÜN SEÇİMİ
            </div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 10, textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
              {featured.title}
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 16, maxWidth: 280 }}>
              {featured.desc}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>@{featured.author}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{featured.chapters} bölüm</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button style={{ background: "#ffffff", color: "var(--primary)", border: "none", padding: "10px 20px", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                Şimdi Oku
              </button>
              <span className="stat-inline" style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                <Eye size={13} strokeWidth={2} /> {featured.reads}
              </span>
              <span className="stat-inline" style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                <Star size={13} strokeWidth={2} /> {featured.votes}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TRENDING TAGS */}
      <div className="fade-up-2" style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {trendingTags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="fade-up-2" style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`cat-pill ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* AI RECOMMENDATIONS — "Sana Özel" */}
      {activeCategory === "Sana Özel" && (
        <div className="fade-up-3" style={{ padding: "24px 16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>
              <Wand2 size={20} strokeWidth={2.5} color={"var(--primary)"} /> Sana Özel
            </span>
            {aiSource === "gemini" && (
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
                <Sparkles size={10} /> AI ile önerildi
              </span>
            )}
          </div>

          {aiLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
              <Loader2 size={24} color={"var(--primary)"} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 }}>
                Senin için hikayeler seçiliyor...
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : aiStories.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {aiStories.map((s) => (
                <div key={s.id} className="story-card">
                  <div style={{
                    height: 160,
                    background: s.cover_gradient || "linear-gradient(160deg,#667eea,#764ba2)",
                    position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontFamily: "'Lora', serif", fontSize: 56,
                      color: "rgba(255,255,255,0.15)",
                      fontStyle: "italic", fontWeight: 700,
                    }}>
                      {s.title?.charAt(0) || "?"}
                    </span>
                    {s.genre && (
                      <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                        <span style={{
                          background: "rgba(255,255,255,0.18)", color: "white",
                          backdropFilter: "blur(4px)",
                          padding: "2px 8px", borderRadius: 4,
                          fontFamily: "'Nunito', sans-serif", fontSize: 10,
                          fontWeight: 800, textTransform: "uppercase" as const,
                          letterSpacing: "0.06em",
                        }}>
                          {s.genre}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "12px 12px 14px" }}>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.25, marginBottom: 4 }}>
                      {s.title || "Başlıksız"}
                    </div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 8 }}>
                      @{s.author?.[0]?.username || "anonim"}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <Eye size={12} strokeWidth={2} /> {s.word_count || 0}
                      </span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <Star size={12} strokeWidth={2} /> {s.likes_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--muted-foreground)" }}>
                Henüz yeterli hikaye yok. Yakında daha fazla öneri gelecek!
              </p>
            </div>
          )}
        </div>
      )}

      {/* STORY GRID — Trend */}
      <div className="fade-up-3" style={{ padding: "24px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>
            <TrendingUp size={20} strokeWidth={2.5} color={"var(--primary)"} /> Trend Hikayeler
          </span>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: "var(--primary)", cursor: "pointer" }}>Tümü</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {stories.map((s) => (
            <div key={s.id} className="story-card">
              <div style={{ height: 160, background: s.bg, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: 56, color: "rgba(255,255,255,0.15)", fontStyle: "italic", fontWeight: 700 }}>{s.initial}</span>

                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  {s.isHot && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "var(--secondary)", color: "var(--primary)", fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>
                      <TrendingUp size={10} strokeWidth={2.5} /> HOT
                    </span>
                  )}
                  {s.isNew && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "var(--secondary)", color: "var(--primary)", fontFamily: "'Nunito', sans-serif", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>
                      <Sparkles size={10} strokeWidth={2.5} /> YENİ
                    </span>
                  )}
                </div>

                <button
                  className={`lib-btn ${libraryIds.has(s.id) ? "active" : "inactive"}`}
                  style={{ position: "absolute", top: 8, right: 8 }}
                  onClick={(e) => { e.stopPropagation(); toggleLibrary(s.id); }}
                >
                  <Heart size={15} strokeWidth={2} fill={libraryIds.has(s.id) ? "currentColor" : "none"} />
                </button>

                <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                  <span style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 4, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    {s.genre}
                  </span>
                </div>
              </div>

              <div style={{ padding: "12px 12px 14px" }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.25, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 8 }}>@{s.author}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span className="stat-inline" style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                    <Eye size={12} strokeWidth={2} /> {s.reads}
                  </span>
                  <span className="stat-inline" style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                    <Star size={12} strokeWidth={2} /> {s.votes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WRITE BANNER */}
      <div className="fade-up-4" style={{ margin: "28px 16px 24px", background: "linear-gradient(135deg, var(--secondary), var(--secondary-light))", border: "1.5px solid var(--primary-border)", borderRadius: 16, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg, var(--primary), #FF8A5B)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Feather size={24} strokeWidth={2} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>Hikayeni paylaş</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>
              90 milyondan fazla okuyucu seni bekliyor.
            </div>
            <button style={{ background: "var(--primary)", color: "white", border: "none", padding: "9px 18px", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              Yazmaya Başla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
