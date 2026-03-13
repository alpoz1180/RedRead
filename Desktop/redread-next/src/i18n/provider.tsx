"use client";

import React from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

type I18nProviderProps = {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
