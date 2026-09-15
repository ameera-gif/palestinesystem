export const LOCALES = ["en", "ms", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const RTL_LOCALES: Locale[] = ["ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ms: "Bahasa Melayu",
  ar: "العربية",
};

export function isRtl(locale: Locale) {
  return RTL_LOCALES.includes(locale);
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
