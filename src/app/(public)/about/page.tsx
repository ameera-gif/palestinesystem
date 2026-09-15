import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProgrammeSettings } from "@/lib/settings";

export const metadata = { title: "About MyFundAction" };

export default async function AboutPage() {
  const settings = await getProgrammeSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">About MyFundAction</h1>
      <p className="mt-3 text-muted max-w-2xl whitespace-pre-line">{settings.orgDescription}</p>
      <p className="mt-4 text-muted max-w-2xl">
        The Gaza Child Sponsorship Programme is one expression of that mission, connecting sponsors around the world
        with children through a transparent, verified support model.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { title: "Volunteerism", body: "Building a culture of service and civic responsibility among youth." },
          { title: "Entrepreneurship", body: "Equipping youth with the skills and mindset to create opportunity." },
          { title: "Academic Excellence", body: "Supporting youth to reach their full academic potential." },
        ].map((pillar) => (
          <div key={pillar.title} className="rounded-xl border border-border p-5">
            <p className="font-display font-semibold text-ink">{pillar.title}</p>
            <p className="mt-1.5 text-sm text-muted">{pillar.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What MyFundAction does</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-ink space-y-2">
            <p>We manage the sponsorship programme end to end: recruiting and supporting sponsors, reviewing and verifying every submission from our field partner, coordinating sponsor-child meetings, and safeguarding every child in the programme.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Our field partner</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-ink space-y-2">
            <p>Our implementing partner works on the ground in Gaza. Their field team registers children, delivers quarterly support, documents progress, and prepares reports, all reviewed and verified by MyFundAction before reaching sponsors.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-ink mb-3">Our commitment to safeguarding</h2>
        <p className="text-sm text-ink max-w-2xl">
          Every child&rsquo;s information is handled on a least-privilege basis. Sensitive household details, exact
          locations, and internal case notes are never shared with sponsors or the public. All sponsor-child
          communication and meetings are moderated and facilitated by our team.
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold text-ink mb-3">Registered address</h2>
        <address className="text-sm text-muted not-italic leading-relaxed whitespace-pre-line">
          {settings.orgAddress}
          <br />
          <span className="mt-1 inline-block">T: {settings.orgPhone}</span>
        </address>
      </div>
    </div>
  );
}
