import type { Resource } from "i18next";

import { assertValidLocaleMessages } from "./locale-validation";

export const DEFAULT_LOCALE = "en" as const;
export const SUPPORTED_LOCALE_CODES = ["en", "zh-CN"] as const;

export const localeLabels: Record<SupportedLocale, string> = {
  en: "English",
  "zh-CN": "简体中文",
};

const localeModules = import.meta.glob("./locales/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const allLocaleMessages = Object.fromEntries(
  Object.entries(localeModules).map(([path, messages]) => {
    const locale = path.match(/\/([A-Za-z0-9_-]+)\.json$/)?.[1];
    if (!locale) {
      throw new Error(`Invalid locale file path: ${path}`);
    }
    return [locale, messages];
  }),
);

export const localeMessages = Object.fromEntries(
  SUPPORTED_LOCALE_CODES.map((locale) => [locale, allLocaleMessages[locale]]),
) as Record<SupportedLocale, unknown>;

if (!(DEFAULT_LOCALE in localeMessages)) {
  throw new Error(`Missing default locale messages for ${DEFAULT_LOCALE}`);
}

for (const locale of SUPPORTED_LOCALE_CODES) {
  if (!localeMessages[locale]) {
    throw new Error(`Missing locale messages for ${locale}`);
  }
}

for (const [locale, messages] of Object.entries(localeMessages)) {
  try {
    assertValidLocaleMessages(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid ${locale} locale messages: ${message}`);
  }
}

export const supportedLocales = [...SUPPORTED_LOCALE_CODES];

export const i18nextResources: Resource = Object.fromEntries(
  Object.entries(localeMessages).map(([locale, messages]) => [locale, { translation: messages }]),
) as Resource;

export type SupportedLocale = (typeof SUPPORTED_LOCALE_CODES)[number];
