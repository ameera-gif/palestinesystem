import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProgrammeSettings, quarterlyAmount } from "@/lib/settings";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "How Sponsorship Works | MyFundAction" };

export default async function HowItWorksPage() {
  const settings = await getProgrammeSettings();
  const amount = quarterlyAmount(settings);

  const steps = [
    {
      title: "1. You choose a child and sponsor them through MyFundAction",
      body: "You browse approved profiles, choose a child, and confirm your sponsorship. Your relationship is with MyFundAction; you never manage logistics with our field partner directly.",
    },
    {
      title: "2. Our partner registers and supports the child on the ground",
      body: "Our implementing partner in Gaza registers the child, delivers quarterly support, documents school progress, and prepares updates for MyFundAction.",
    },
    {
      title: "3. MyFundAction reviews everything before it reaches you",
      body: "Every report, photo, and delivery record submitted by our partner is checked by our team. Nothing reaches your sponsor portal until it's been reviewed and approved.",
    },
    {
      title: "4. You receive verified updates",
      body: "Progress reports, support confirmations, and approved photos appear in your private sponsor portal, in plain language, without NGO operational jargon.",
    },
    {
      title: "5. You may meet your sponsored child online",
      body: "Roughly every six months, we coordinate an online meeting between you and your sponsored child, always facilitated by a MyFundAction or field partner representative for the child's safety.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">How Sponsorship Works</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Sponsorship is {formatMoney(settings.monthlySponsorshipAmount, settings.currency)} per month, delivered as{" "}
        {formatMoney(amount, settings.currency)} every {settings.distributionFrequencyMonths} months. Here&rsquo;s exactly
        how your support reaches a child, and how you stay informed.
      </p>

      <div className="mt-10 space-y-6">
        {steps.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink">{s.body}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button href="/sponsor-a-child" size="lg">
          Sponsor a Child
        </Button>
      </div>
    </div>
  );
}
