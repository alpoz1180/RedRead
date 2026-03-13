import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://redread.app"),
  title: {
    default: "Redread — Kısa Hikayeler ve Mikro Kurgu",
    template: "%s | Redread",
  },
  description:
    "Redread, Türkçe kısa hikayeler ve mikro kurgu için yaratıcı bir okuma ve yazma platformudur. Yazarlar keşfedilir, hikayeler paylaşılır.",
  openGraph: {
    title: "Redread — Kısa Hikayeler ve Mikro Kurgu",
    description:
      "Türkçe kısa hikayeler ve mikro kurgu için yaratıcı bir okuma ve yazma platformu.",
    siteName: "Redread",
    locale: "tr_TR",
    type: "website",
    url: "https://redread.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redread — Kısa Hikayeler ve Mikro Kurgu",
    description:
      "Türkçe kısa hikayeler ve mikro kurgu için yaratıcı bir okuma ve yazma platformu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        {/* FOCT: dark class'ı render öncesi senkron uygula */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('redread-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

