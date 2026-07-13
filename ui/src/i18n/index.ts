import i18n, { type InitOptions, type TOptions } from "i18next";
import { initReactI18next, useTranslation as useReactI18nextTranslation } from "react-i18next";

import {
  DEFAULT_LOCALE,
  i18nextResources,
  localeLabels,
  supportedLocales,
  type SupportedLocale,
} from "./locales";

export const LOCALE_STORAGE_KEY = "paperclip.locale";

// Default UI language on first load (no stored preference). English is kept as
// the fallback language and remains selectable, but the app defaults to Chinese.
export const INITIAL_LOCALE: SupportedLocale = "zh-CN";

export function normalizeLocale(value: string | null | undefined): SupportedLocale | null {
  const normalized = value?.trim().replace("_", "-").toLowerCase();
  if (!normalized) return null;
  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh-CN";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return null;
}

function readStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function detectPreferredLocale(): SupportedLocale {
  // A previously stored choice always wins; otherwise default to Chinese.
  return readStoredLocale() ?? INITIAL_LOCALE;
}

function applyDocumentLocale(locale: SupportedLocale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = "ltr";
}

const i18nextOptions: InitOptions = {
  resources: i18nextResources,
  lng: detectPreferredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: supportedLocales,
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  returnObjects: false,
  initAsync: false,
};

void i18n.use(initReactI18next).init(i18nextOptions).catch((error: unknown) => {
  console.error("Failed to initialize i18next", error);
});

applyDocumentLocale(normalizeLocale(i18n.language) ?? DEFAULT_LOCALE);
i18n.on("languageChanged", (language) => {
  applyDocumentLocale(normalizeLocale(language) ?? DEFAULT_LOCALE);
});

export function t(key: string, options: TOptions = {}) {
  return i18n.t(key, options);
}

export function changeLocale(locale: SupportedLocale) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures in restricted browser contexts.
    }
  }
  return i18n.changeLanguage(locale);
}

export function useLocale() {
  const { i18n: instance } = useReactI18nextTranslation();
  const locale = normalizeLocale(instance.resolvedLanguage ?? instance.language) ?? DEFAULT_LOCALE;
  return {
    locale,
    localeLabels,
    setLocale: changeLocale,
    supportedLocales,
  };
}

export const useTranslation = useReactI18nextTranslation;
export { i18n };
export type { SupportedLocale };
