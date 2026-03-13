"use client";

import { useState } from "react";





const stories = [
  { id: 1, title: "After the Storm", author: "ellaquinn", genre: "Romance", reads: "14.2M", votes: "892K", chapters: 42, isNew: false, isHot: true, bg: "linear-gradient(160deg,#667eea,#764ba2)", initial: "A" },
  { id: 2, title: "Neon Requiem", author: "ghostwriter99", genre: "Sci-Fi", reads: "3.7M", votes: "210K", chapters: 18, isNew: true, isHot: false, bg: "linear-gradient(160deg,#0f2027,#203a43,#2c5364)", initial: "N" },
  { id: 3, title: "The Wrong Brother", author: "inkdreamer", genre: "Romance", reads: "22.8M", votes: "1.4M", chapters: 67, isNew: false, isHot: true, bg: "linear-gradient(160deg,#f953c6,#b91d73)", initial: "T" },
  { id: 4, title: "Ember & Ash", author: "fantasyforge", genre: "Fantasy", reads: "8.1M", votes: "540K", chapters: 33, isNew: false, isHot: false, bg: "linear-gradient(160deg,#f46b45,#eea849)", initial: "E" },
  { id: 5, title: "Dead Signal", author: "hauntedkeys", genre: "Horror", reads: "5.5M", votes: "320K", chapters: 29, isNew: true, isHot: false, bg: "linear-gradient(160deg,#1a1a2e,#16213e)", initial: "D" },
  { id: 6, title: "Chasing Satellites", author: "velvet_words", genre: "Teen Fiction", reads: "11.3M", votes: "780K", chapters: 55, isNew: false, isHot: true, bg: "linear-gradient(160deg,#56ccf2,#2f80ed)", initial: "C" },
];

const featured = {
  title: "The Art of Letting Go",
  author: "moonlitpages",
  genre: "Romance · Teen Fiction",
  reads: "34.1M",
  votes: "2.1M",
  chapters: 84,
  desc: "Sofia swore she'd never speak to Liam again after what happened at prom. Then he shows up as her college roommate's best friend — and everything she buried starts rising back to the surface.",
  bg: "var(--gradient-orange)",
};

const categories = ["For You", "Romance", "Fantasy", "Werewolf", "Teen Fiction", "Mystery", "Horror", "Humor", "Sci-Fi", "Fan Fiction"];

const trendingTags = ["#PrideMonth", "#NewAdult", "#SlowBurn", "#EnemiestoLovers", "#MagicSchool"];

export function WattpadHome() {
  const [activeCategory, setActiveCategory] = useState("For You");
  const [libraryIds, setLibraryIds] = useState<Set<number>>(new Set([3]));
  const [activeNav, setActiveNav] = useState("home");

  const toggleLibrary = (id: number) => {
    setLibraryIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "sans-serif", maxWidth: 430, margin: "0 auto", position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.12)" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .wp-btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .wp-btn-primary:hover { background: #e8521a; transform: translateY(-1px); }
        .wp-btn-primary:active { transform: scale(0.97); }

        .wp-btn-ghost {
          background: white;
          color: var(--primary);
          border: 1.5px solid var(--primary);
          padding: 11px 20px;
          border-radius: 8px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wp-btn-ghost:hover { background: var(--secondary); }

        .cat-pill {
          padding: 7px 16px;
          border-radius: 999px;
          border: 1.5px solid var(--muted);
          background: white;
          color: var(--muted-foreground);
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cat-pill:hover { border-color: var(--primary); color: var(--primary); }
        .cat-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .story-card {
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        }
        .story-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.13);
        }
        .story-card:active { transform: scale(0.97); }

        .lib-btn {
          width: 30px; height: 30px;
          border-radius: 50%;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .lib-btn.inactive { background: rgba(255,255,255,0.85); color: #aaa; }
        .lib-btn.active { background: var(--primary); color: white; }
        .lib-btn:hover { transform: scale(1.1); }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 12px;
          transition: background 0.15s;
          flex: 1;
        }
        .bottom-nav-item:hover { background: var(--secondary); }
        .nav-label {
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .tag-chip {
          padding: 5px 12px;
          border-radius: 999px;
          background: var(--secondary);
          color: var(--primary);
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .tag-chip:hover { background: #ffd9c9; }

        .section-title {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -0.01em;
        }

        .reads-label {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          color: #9A9490;
          font-weight: 600;
        }

        .genre-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .hot-badge {
          background: var(--secondary);
          color: var(--primary);
          font-family: 'Nunito', sans-serif;
          font-size: 9px;
          font-weight: 800;
          padding: 3px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .new-badge {
          background: #E8F5E9;
          color: #2E7D32;
          font-family: 'Nunito', sans-serif;
          font-size: 9px;
          font-weight: 800;
          padding: 3px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.3s ease both; }
      `}</style>

      {/* TOP NAV */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250,250,248,0.95)",
        backdropFilter: "blur(12px)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--muted)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--primary)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Lora', serif",
            fontWeight: 700,
            fontSize: 18,
            color: "white",
            letterSpacing: "-0.05em",
          }}>W</div>
          <span style={{
            fontFamily: "'Lora', serif",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
          }}>Wattpad</span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            width: 36, height: 36,
            background: "var(--muted)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "var(--muted-foreground)",
          }}>🔍</div>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 36, height: 36,
              background: "var(--muted)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, color: "var(--muted-foreground)",
            }}>🔔</div>
            <div style={{
              position: "absolute", top: 6, right: 6,
              width: 8, height: 8,
              background: "var(--primary)", borderRadius: "50%",
              border: "2px solid var(--background)",
            }}></div>
          </div>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, var(--primary), var(--primary-mid))`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white",
            fontFamily: "'Nunito', sans-serif",
            cursor: "pointer",
          }}>B</div>
        </div>
      </div>

      <div style={{ paddingBottom: 80 }}>

        {/* FEATURED CARD */}
        <div className="fade-up" style={{ margin: "20px 16px 0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(255,97,34,0.25)", cursor: "pointer" }}>
          <div style={{ background: featured.bg, padding: "28px 20px 24px", position: "relative", minHeight: 200 }}>
            <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}></div>
            <div style={{ position: "absolute", right: 20, bottom: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}></div>

            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "white", padding: "4px 10px", borderRadius: 6, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 12 }}>
                ⭐ EDITOR&apos;S PICK
              </div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 10, letterSpacing: "-0.01em", textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                {featured.title}
              </h2>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 16, maxWidth: 280 }}>
                {featured.desc}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>by @{featured.author}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }}></span>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{featured.chapters} chapters</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="wp-btn-primary" style={{ background: "white", color: "var(--primary)", fontSize: 13 }}>Read Now</button>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>📖 {featured.reads}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>⭐ {featured.votes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRENDING TAGS */}
        <div className="fade-up-2" style={{ padding: "20px 16px 0" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {trendingTags.map(t => <span key={t} className="tag-chip">{t}</span>)}
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="fade-up-2" style={{ padding: "20px 16px 0" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {categories.map(c => (
              <button key={c} className={`cat-pill ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* STORIES GRID */}
        <div className="fade-up-3" style={{ padding: "24px 16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="section-title">🔥 Trending Stories</span>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: "var(--primary)", cursor: "pointer" }}>See All</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {stories.map((s, i) => (
              <div key={s.id} className="story-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ height: 160, background: s.bg, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Lora', serif", fontSize: 56, color: "rgba(255,255,255,0.15)", fontStyle: "italic", fontWeight: 700 }}>{s.initial}</span>

                  <div style={{ position: "absolute", top: 8, left: 8 }}>
                    {s.isHot && <span className="hot-badge">🔥 Hot</span>}
                    {s.isNew && <span className="new-badge">✨ New</span>}
                  </div>

                  <button
                    className={`lib-btn ${libraryIds.has(s.id) ? "active" : "inactive"}`}
                    style={{ position: "absolute", top: 8, right: 8 }}
                    onClick={(e) => { e.stopPropagation(); toggleLibrary(s.id); }}
                  >
                    {libraryIds.has(s.id) ? "♥" : "♡"}
                  </button>

                  <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                    <span className="genre-tag" style={{ background: "rgba(255,255,255,0.18)", color: "white", backdropFilter: "blur(4px)" }}>
                      {s.genre}
                    </span>
                  </div>
                </div>

                <div style={{ padding: "12px 12px 14px" }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.25, marginBottom: 4 }}>
                    {s.title}
                  </div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#9A9490", fontWeight: 600, marginBottom: 8 }}>
                    @{s.author}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="reads-label">📖 {s.reads}</span>
                    <span className="reads-label">⭐ {s.votes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WRITE BANNER */}
        <div className="fade-up-4" style={{ margin: "28px 16px 0", background: "linear-gradient(135deg, var(--secondary), var(--secondary-light))", border: `1.5px solid var(--primary-border)`, borderRadius: 16, padding: "20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 40, lineHeight: 1 }}>✍️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>Share your story</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#9A9490", fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>
                Over 90 million readers are waiting. Start writing today.
              </div>
              <button className="wp-btn-primary" style={{ fontSize: 12, padding: "9px 18px" }}>Start Writing</button>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "rgba(250,250,248,0.96)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--muted)",
        padding: "8px 8px 16px",
        display: "flex",
        zIndex: 100,
      }}>
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "browse", icon: "🔍", label: "Browse" },
          { id: "library", icon: "📚", label: "Library" },
          { id: "write", icon: "✏️", label: "Write" },
          { id: "profile", icon: "👤", label: "Profile" },
        ].map(item => (
          <div
            key={item.id}
            className="bottom-nav-item"
            onClick={() => setActiveNav(item.id)}
          >
            <span style={{ fontSize: 20, filter: activeNav === item.id ? "none" : "grayscale(60%)" }}>{item.icon}</span>
            <span className="nav-label" style={{ color: activeNav === item.id ? "var(--primary)" : "#9A9490" }}>{item.label}</span>
            {activeNav === item.id && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", marginTop: 1 }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
