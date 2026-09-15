import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import { isRtl } from "@/lib/i18n/config";

// Plus Jakarta Sans: the base UI/body font everywhere — warm, geometric,
// modern, and legible at small sizes. Falls back to system fonts (including
// Arabic-capable ones) automatically for glyphs it doesn't cover, so RTL
// Arabic content is unaffected. Fraunces is a display serif reserved for
// public-site headlines only (see .font-display) — it gives the marketing
// pages real typographic character without touching the sober, functional
// sans used throughout the three operational portals.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "MyFundAction — Gaza Child Sponsorship Programme",
  description:
    "Sponsor a child in Gaza through MyFundAction. Verified updates, transparent support delivery, delivered in partnership with our field partner Ufuk.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`h-full antialiased ${plusJakarta.variable} ${fraunces.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
