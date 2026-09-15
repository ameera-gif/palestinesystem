import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { SignupForm } from "./signup-form";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ childId?: string }> }) {
  const { childId } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex justify-center mb-6">
          <Logo size={40} />
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Create your sponsor account</h1>
        <p className="mt-2 text-sm text-muted">
          {childId
            ? "Takes less than a minute. You’ll be taken back to confirm your sponsorship right after."
            : "Takes less than a minute. You can browse children and start a sponsorship once you’re signed in."}
        </p>
      </div>
      <Card className="p-6">
        <SignupForm childId={childId} />
      </Card>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <a href="/login" className="text-accent font-medium">Sign in</a>
      </p>
    </div>
  );
}
