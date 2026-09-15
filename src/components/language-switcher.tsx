"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: Locale) {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
  }

  return (
    <select
      aria-label="Language"
      value={current}
      disabled={isPending}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
