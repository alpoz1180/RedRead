/**
 * Client-side helper — calls /api/recommendations (server-side Gemini)
 * API key asla client'a gönderilmez.
 */
export async function getAIRecommendations(
  userGenres: string[],
  limit: number = 6
): Promise<{ ids: string[]; source: string }> {
  try {
    const res = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userGenres, limit }),
    });

    if (!res.ok) {
      console.warn("AI recommendations API failed:", res.status);
      return { ids: [], source: "error" };
    }

    const data = await res.json();
    return { ids: data.recommendations || [], source: data.source || "unknown" };
  } catch (err) {
    console.error("AI recommendations fetch error:", err);
    return { ids: [], source: "error" };
  }
}
