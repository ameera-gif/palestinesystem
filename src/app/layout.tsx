import type { Metadata } from "next";
import { Inter, Manrope, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import { isRtl } from "@/lib/i18n/config";

// Inter: base UI/body font everywhere — clear, neutral, fintech-grade
// legibility at small sizes. Manrope: headings/display font across the
// whole app — modern geometric sans, used for section titles, card names,
// nav. Instrument Serif is reserved for a handful of large editorial
// statement headlines only (hero, trust section) — never body copy, never
// the whole UI. All three fall back to system/Arabic-capable fonts
// automatically for glyphs they don't cover, so RTL content is unaffected.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "MyFundAction | Gaza Child Sponsorship Programme",
  description:
    "Sponsor a child in Gaza through MyFundAction. Verified updates, transparent support delivery, delivered in partnership with our field partner.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`h-full antialiased ${inter.variable} ${manrope.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
