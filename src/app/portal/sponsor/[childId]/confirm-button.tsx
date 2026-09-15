"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requestSponsorshipAction } from "./actions";

export function ConfirmSponsorshipButton({ childId }: { childId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (done) {
    return (
      <div className="rounded-lg bg-success-light text-success px-4 py-3 text-sm">
        Thank you! Your payment has been confirmed and MyFundAction will finalise the match shortly. You'll be
        notified the moment it's confirmed.
      </div>
    );
  }

  return (
    <div>
      <Button
        size="lg"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await requestSponsorshipAction(childId);
            if (result.error) setError(result.error);
            else {
              setDone(true);
              router.refresh();
            }
          })
        }
      >
        {isPending ? "Processing…" : "Confirm Sponsorship (Demo Payment)"}
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
