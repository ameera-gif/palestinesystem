import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getDictionaryForRequest } from "@/lib/i18n";

export async function SiteFooter() {
  const { dict } = await getDictionaryForRequest();

  const columns = [
    {
      title: "Sponsorship",
      links: [
        { href: "/sponsor-a-child", label: dict.nav.sponsorAChild },
        { href: "/how-it-works", label: dict.nav.howItWorks },
        { href: "/faq", label: dict.nav.faq },
      ],
    },
    {
      title: "About",
      links: [
        { href: "/about", label: dict.nav.about },
        { href: "/impact", label: dict.nav.impact },
        { href: "/stories", label: dict.nav.stories },
      ],
    },
    {
      title: "Account",
      links: [
        { href: "/login", label: dict.nav.login },
        { href: "/contact", label: dict.nav.contact },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Logo size={32} />
          <p className="text-sm text-muted mt-3 max-w-xs">{dict.footer.tagline}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-ink mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 text-xs text-muted flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} MyFundAction. {dict.footer.rights}</span>
          <span>Implemented in the field by our partner Ufuk.</span>
        </div>
      </div>
    </footer>
  );
}
