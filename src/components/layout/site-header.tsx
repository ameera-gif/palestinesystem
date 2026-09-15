import Link from "next/link";
import { auth } from "@/auth";
import { homeForRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getDictionaryForRequest } from "@/lib/i18n";

export async function SiteHeader() {
  const [session, { locale, dict }] = await Promise.all([auth(), getDictionaryForRequest()]);

  // Deliberately short: four items only. About and FAQ still exist as full
  // pages, linked from the footer — keeping them out of the primary nav is
  // part of the redesign (a crowded top bar undercuts the "easy to
  // navigate" goal). Page titles elsewhere still use the full dict.nav.*
  // strings.
  const navItems = [
    { href: "/sponsor-a-child", label: "Sponsor a Child" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/impact", label: "Impact" },
    { href: "/stories", label: "Stories" },
  ];

  const loginHref = session?.user ? homeForRole(session.user.role) : "/login";
  const loginLabel = session?.user ? "My Dashboard" : dict.nav.login;

  return (
    // `backdrop-blur` establishes a new containing block for `position:
    // fixed` descendants (CSS spec: filter/backdrop-filter do this, same as
    // transform). MobileNav's fixed full-screen panel must NOT be nested
    // inside the blurred element, or it gets trapped inside this 64px bar
    // instead of covering the viewport — hence the blur lives on the inner
    // bar div, not on <header> itself, and MobileNav sits as header's direct
    // (unblurred) child.
    <header className="sticky top-0 z-40">
      <div className="border-b border-border bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Logo size={34} className="hidden sm:inline-flex" />
            <Logo size={30} showWordmark={false} className="sm:hidden" />
            <span className="hidden xl:block h-6 w-px bg-border" />
            <span className="hidden xl:block text-xs font-medium text-muted leading-tight">
              Gaza Child
              <br />
              Sponsorship
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-ink">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-accent transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSwitcher current={locale} />
              <Button href={loginHref} variant="outline" size="sm">
                {loginLabel}
              </Button>
              <Button href="/sponsor-a-child" size="sm">
                Sponsor
              </Button>
            </div>
            <div className="lg:hidden">
              <LanguageSwitcher current={locale} />
            </div>
            <MobileNav navItems={navItems} loginHref={loginHref} loginLabel={loginLabel} sponsorLabel="Sponsor a Child" />
          </div>
        </div>
      </div>
    </header>
  );
}
