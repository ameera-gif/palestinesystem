import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LogoMark } from "@/components/brand/logo-mark";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-64px)]">
      {/* Left panel — collapses away below lg, per the redesign brief, so
          mobile gets a single focused form instead of a squeezed split. */}
      <div className="hidden lg:flex relative overflow-hidden bg-linear-to-br from-brand to-brand-dark items-center justify-center p-16">
        <div className="pointer-events-none absolute -left-16 -bottom-16 opacity-[0.10] animate-spin-slow">
          <LogoMark size={360} monochrome="#D9CBB6" />
        </div>
        <div className="relative max-w-sm animate-fade-up">
          <p className="font-editorial text-4xl sm:text-5xl leading-[1.15] text-white">
            Every update.
            <br />
            Every milestone.
            <br />
            In one place.
          </p>
          <p className="mt-6 text-sm text-white/60">
            Your sponsor dashboard brings together every verified report, delivery, and moment from the child you sponsor.
          </p>
        </div>
      </div>

      {/* Right panel — the actual form. Same for every role: the system
          identifies sponsor / field team / MyFundAction after sign-in, so
          there's no role picker here. */}
      <div className="flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex mb-8">
            <Logo size={36} />
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted">Sign in to see how they&rsquo;re doing.</p>

          <div className="mt-8">
            <LoginForm callbackUrl={callbackUrl ?? "/post-login"} />
          </div>

          <p className="mt-4 text-center text-sm">
            <Link href="/contact" className="text-muted hover:text-brand">
              Forgot password?
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-muted">
            New here?{" "}
            <Link href="/signup" className="text-brand font-medium hover:underline">
              Create a sponsor account
            </Link>
          </p>

          <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-xs text-muted">
            <p className="font-medium text-ink mb-1.5">Demo accounts (password: Passw0rd!)</p>
            <ul className="space-y-0.5">
              <li>Sponsor: sponsor.amira@example.com</li>
              <li>Field team: yusuf.alamin@fieldpartner.org</li>
              <li>MyFundAction PC: nadia.suleiman@myfundaction.org</li>
              <li>Admin: admin@myfundaction.org</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
