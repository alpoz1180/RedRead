import { Profile } from "@/components/redread/Profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

type ProfilePageProps = {
  params: Promise<{ locale: string; username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} – Redread` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!user) {
    return <Profile initialUser={null} initialStories={[]} />;
  }

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, word_count, likes_count, created_at, cover_gradient")
    .eq("author_id", user.id)
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <Profile
      initialUser={user}
      initialStories={stories ?? []}
    />
  );
}
