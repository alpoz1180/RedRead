"use client";

import React, { createContext, useContext } from "react";
import type trMessages from "./tr.json";

type Messages = typeof trMessages;

type I18nContextValue = {
  locale: string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  locale: string;
  messages: Messages;
  children: React.ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
