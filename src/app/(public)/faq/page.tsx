export const metadata = { title: "FAQ — MyFundAction" };

const FAQS = [
  {
    q: "How is my sponsorship amount decided?",
    a: "The programme currently uses $50 per child per month, delivered as $150 support every quarter. This amount is set by MyFundAction and may be adjusted over time as programme needs change.",
  },
  {
    q: "Why don't I communicate directly with Ufuk or the child's family?",
    a: "MyFundAction manages the sponsor relationship so that every interaction — reports, updates, messages, and meetings — is reviewed and safeguarded. This protects both sponsors and children.",
  },
  {
    q: "How often will I hear from my sponsored child?",
    a: "You'll receive a verified progress report roughly every reporting cycle, plus support delivery confirmations and approved photos as they're reviewed. An online meeting is coordinated approximately every six months.",
  },
  {
    q: "What information can I see about my sponsored child?",
    a: "Approved profile details, published reports, verified support updates, and approved media. Sensitive household information, exact location, and internal records are never shared with sponsors.",
  },
  {
    q: "Can I message my sponsored child directly?",
    a: "Messages are moderated. You can send a greeting (for example for Eid or Ramadan), which MyFundAction reviews before Ufuk delivers it, and any reply goes through the same review before reaching you.",
  },
  {
    q: "What happens if I need to pause my sponsorship?",
    a: "Contact MyFundAction and we'll pause your sponsorship. The child's profile and your access remain intact, and you can resume at any time.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl font-semibold text-ink tracking-tight">Frequently Asked Questions</h1>
      <div className="mt-8 divide-y divide-border border-t border-b border-border">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-ink">
              {f.q}
              <span className="text-muted group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
