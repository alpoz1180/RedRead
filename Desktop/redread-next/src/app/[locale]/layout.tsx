import type { Metadata } from "next";
import "@/app/globals.css";
import trMessages from "@/i18n/tr.json";
import enMessages from "@/i18n/en.json";
import { I18nProvider } from "@/i18n/provider";

export const metadata: Metadata = {
  title: "Redread",
  description: "Dark, poetic micro-fiction reading experience.",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale = localeParam || "tr";
  const messages = locale === "en" ? enMessages : trMessages;

  return <I18nProvider locale={locale} messages={messages}>{children}</I18nProvider>;
}

