import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Contact — MyFundAction" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">Contact Us</h1>
      <p className="mt-3 text-muted">
        Questions about sponsorship, an existing sponsorship, or the Gaza programme generally — reach out and our
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
        </CardContent>
      </Card>
    </div>
  );
}
