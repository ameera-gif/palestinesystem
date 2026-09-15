import "server-only";
import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import ms from "./dictionaries/ms.json";
import ar from "./dictionaries/ar.json";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = { en, ms, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/** Reads the `NEXT_LOCALE` cookie set by the language switcher. Server-side only. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("NEXT_LOCALE")?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionaryForRequest() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
