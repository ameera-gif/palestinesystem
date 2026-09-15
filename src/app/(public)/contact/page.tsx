import { Card, CardContent } from "@/components/ui/card";
import { getProgrammeSettings } from "@/lib/settings";

export const metadata = { title: "Contact | MyFundAction" };

export default async function ContactPage() {
  const settings = await getProgrammeSettings();
  const telHref = `tel:${settings.orgPhone.replace(/[^\d+]/g, "")}`;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">Contact Us</h1>
      <p className="mt-3 text-muted">
        Questions about sponsorship, an existing sponsorship, or the Gaza programme generally: reach out and our
        team will respond.
      </p>
      <Card className="mt-8">
        <CardContent className="p-6 space-y-4 text-sm text-ink">
          <div>
            <p className="font-medium">Sponsorship enquiries</p>
            <p className="text-muted">sponsorship@myfundaction.org</p>
          </div>
          <div>
            <p className="font-medium">General enquiries</p>
            <p className="text-muted">info@myfundaction.org</p>
          </div>
          <div>
            <p className="font-medium">Existing sponsors</p>
            <p className="text-muted">
              Sign in to your <a href="/login" className="text-brand font-medium">sponsor portal</a> to send a moderated message about your sponsorship.
            </p>
          </div>
          <div>
            <p className="font-medium">Registered address</p>
            <address className="text-muted not-italic leading-relaxed whitespace-pre-line">{settings.orgAddress}</address>
          </div>
          <div>
            <p className="font-medium">Phone</p>
            <p className="text-muted">
              <a href={telHref} className="hover:text-brand">
                {settings.orgPhone}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
