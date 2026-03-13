import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stories as demoStories } from "@/app/constants/stories";

type StoryPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface StoryDetail {
  id: string;
  title: string;
  content: string;
  description: string | null;
  cover_gradient: string | null;
  author: { username: string; display_name: string | null } | null;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params;

  if (UUID_REGEX.test(id)) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("stories")
      .select("title, description, content")
      .eq("id", id)
      .eq("published", true)
      .single();

    if (data) {
      return {
        title: `${data.title} – Redread`,
        description: data.description || data.content?.slice(0, 120) || "",
      };
    }
  }

  const demo = demoStories.find((s) => s.id === id);
  if (demo) return { title: `${demo.title} – Redread`, description: demo.content.slice(0, 120) };
  return { title: "Redread" };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;

  // Try Supabase first (UUID IDs)
  if (UUID_REGEX.test(id)) {
    const supabase = await createSupabaseServerClient();
    const { data: storyRaw } = await supabase
      .from("stories")
      .select("id, title, content, description, cover_gradient, author:users!author_id(username, display_name)")
      .eq("id", id)
      .eq("published", true)
      .single();

    const story = storyRaw as StoryDetail | null;

    if (story) {
      const author = story.author;
      return (
        <div
          style={{
            minHeight: "100vh",
            width: "100%",
            background: story.cover_gradient
              ? `linear-gradient(to bottom, ${story.cover_gradient.replace(/linear-gradient\([^,]+,/, "").replace(")", "")} 0%, var(--background) 300px)`
              : "var(--background)",
          }}
        >
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px 48px" }}>
            <h1
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {story.title}
            </h1>
            {author && (
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 13,
                  color: "var(--primary)",
                  fontWeight: 700,
                  marginBottom: 32,
                }}
              >
                @{author.username}
              </p>
            )}
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 18,
                lineHeight: 1.85,
                color: "var(--foreground)",
                whiteSpace: "pre-wrap",
              }}
            >
              {story.content}
            </p>
          </div>
        </div>
      );
    }
  }

  // Fallback: demo stories (old IDs)
  const demo = demoStories.find((s) => s.id === id);

  if (!demo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "var(--muted-foreground)" }}>
          Hikaye bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: 600, width: "100%" }}>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(20px, 4vw, 32px)",
            lineHeight: 1.8,
            textAlign: "center",
            color: "var(--foreground)",
          }}
        >
          {demo.content}
        </p>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: "var(--primary)",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 6,
            }}
          >
            {demo.title}
          </span>
          <span
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 13,
              color: "var(--muted-foreground)",
              fontStyle: "italic",
            }}
          >
            {demo.author}
          </span>
        </div>
      </div>
    </div>
  );
}
