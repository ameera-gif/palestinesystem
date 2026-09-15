import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex justify-center mb-6">
          <Logo size={40} />
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Sign in to your portal</h1>
        <p className="mt-2 text-sm text-muted">
          Sponsors, Ufuk field team, and MyFundAction staff all sign in here.
        </p>
      </div>
      <Card className="p-6">
        <LoginForm callbackUrl={callbackUrl ?? "/post-login"} />
      </Card>
      <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-xs text-muted">
        <p className="font-medium text-ink mb-1.5">Demo accounts (password: Passw0rd!)</p>
        <ul className="space-y-0.5">
          <li>Sponsor — sponsor.amira@example.com</li>
          <li>Ufuk field team — yusuf.alamin@ufuk-partner.org</li>
          <li>MyFundAction PC — nadia.suleiman@myfundaction.org</li>
          <li>Admin — admin@myfundaction.org</li>
        </ul>
      </div>
    </div>
  );
}
