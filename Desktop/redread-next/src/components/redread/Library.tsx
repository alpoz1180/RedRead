"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Eye, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface BookmarkedStory {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  word_count: number;
  likes_count: number;
  cover_gradient: string | null;
  author: { username: string; display_name: string | null } | null;
}

export function Library() {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    supabase
      .from("bookmarks")
      .select(
        "story:stories!story_id(id, title, description, genre, word_count, likes_count, cover_gradient, author:users!author_id(username, display_name))"
      )
      .eq("user_id", user.id)
      .returns<Array<{ story: BookmarkedStory }>>()
      .then(({ data }) => {
        if (data) {
          const stories = data.map((b) => b.story).filter(Boolean);
          setBookmarks(stories);
        }
        setLoading(false);
      });
  }, [user?.id, authLoading]);

  if (loading || authLoading) {
    return (
      <div
        style={{
          paddingTop: 65,
          paddingBottom: 80,
          background: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid var(--muted)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          paddingTop: 65,
          paddingBottom: 80,
          background: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "65px 24px 80px",
        }}
      >
        <Bookmark size={40} color="var(--muted-foreground)" strokeWidth={1.5} />
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 16,
            color: "var(--foreground)",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Kütüphanen seni bekliyor
        </p>
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            color: "var(--muted-foreground)",
            textAlign: "center",
            maxWidth: 280,
            lineHeight: 1.6,
          }}
        >
          Beğendiğin hikayeleri kaydetmek için giriş yap.
        </p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div
        style={{
          paddingTop: 65,
          paddingBottom: 80,
          background: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "65px 24px 80px",
        }}
      >
        <Bookmark size={40} color="var(--muted-foreground)" strokeWidth={1.5} />
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 16,
            color: "var(--foreground)",
            fontWeight: 600,
          }}
        >
          Kütüphane boş
        </p>
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            color: "var(--muted-foreground)",
            textAlign: "center",
            maxWidth: 260,
            lineHeight: 1.6,
          }}
        >
          Hikayelerdeki kalp ikonuna dokunarak kaydetmeye başla.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: 65,
        paddingBottom: 80,
        background: "var(--background)",
        minHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "24px 16px 0" }}>
        <h2
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: 4,
          }}
        >
          Kütüphanem
        </h2>
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 12,
            color: "var(--muted-foreground)",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {bookmarks.length} kayıtlı hikaye
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookmarks.map((story) => (
            <div
              key={story.id}
              style={{
                display: "flex",
                gap: 12,
                background: "var(--card)",
                borderRadius: 12,
                border: "1px solid var(--muted)",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {/* Cover */}
              <div
                style={{
                  width: 72,
                  flexShrink: 0,
                  background:
                    story.cover_gradient ||
                    "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: 28,
                    color: "rgba(255,255,255,0.2)",
                    fontStyle: "italic",
                    fontWeight: 700,
                  }}
                >
                  {story.title?.charAt(0) || "?"}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: "12px 12px 12px 0", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {story.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 11,
                    color: "var(--primary)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  @{story.author?.username || "anonim"}
                </div>
                {story.genre && (
                  <span
                    style={{
                      background: "var(--secondary)",
                      color: "var(--primary)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "inline-block",
                      marginBottom: 8,
                    }}
                  >
                    {story.genre}
                  </span>
                )}
                <div style={{ display: "flex", gap: 12 }}>
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Eye size={11} strokeWidth={2} />
                    {story.word_count || 0} kelime
                  </span>
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Heart size={11} strokeWidth={2} />
                    {story.likes_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
