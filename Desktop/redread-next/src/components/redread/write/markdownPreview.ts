/* ─── Markdown Preview Renderer ───────────────────────────────── */
// Used by ChapterEditor to render a simple markdown-to-HTML preview.
// Images are processed first (before HTML escaping) to preserve src URLs.

// Güvenli URL: sadece https, http ve data:image/ protokollerine izin ver
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|data:image\/)/i.test(trimmed)) return trimmed;
  return '#';
}

// HTML özel karakterlerini escape et
export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Simple markdown preview — process images before escaping, escape everything else
export function renderPreview(text: string): string {
  const parts: Array<{ type: "text" | "img"; value: string }> = [];
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    parts.push({ type: "img", value: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });

  return parts.map((p) => {
    if (p.type === "img") {
      const safeSrc = sanitizeUrl(p.value);
      return `<img src="${escapeHtml(safeSrc)}" style="max-width:100%;border-radius:10px;margin:12px 0;display:block;" loading="lazy" />`;
    }
    // Tüm metni escape et, sonra markdown pattern'lerini güvenli şekilde uygula
    const safe = escapeHtml(p.value);
    return safe
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^## (.+)$/gm, '<h2 style="font-family: \'Lora\', serif; font-size: 20px; font-weight: 700; margin: 16px 0 8px;">$1</h2>')
      .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left: 3px solid #FF6122; padding-left: 12px; color: var(--muted-foreground); font-style: italic; margin: 8px 0;">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li style="margin-left: 16px;">$1</li>')
      .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid var(--muted); margin: 16px 0;" />')
      .replace(/\n/g, '<br />');
  }).join('');
}
