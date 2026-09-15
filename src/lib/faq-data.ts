// Single source of truth for sponsor-facing FAQ copy — shown in full on
// /faq and as a short preview on the homepage, so the two never drift.
export const FAQS = [
  {
    q: "How is my sponsorship amount decided?",
    a: "The programme currently uses $50 per child per month, delivered as $150 support every quarter. This amount is set by MyFundAction and may be adjusted over time as programme needs change.",
  },
  {
    q: "Why don't I communicate directly with our partner or the child's family?",
    a: "MyFundAction manages the sponsor relationship so that every interaction (reports, updates, messages, and meetings) is reviewed and safeguarded. This protects both sponsors and children.",
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
    a: "Messages are moderated. You can send a greeting (for example for Eid or Ramadan), which MyFundAction reviews before our partner delivers it, and any reply goes through the same review before reaching you.",
  },
  {
    q: "What happens if I need to pause my sponsorship?",
    a: "Contact MyFundAction and we'll pause your sponsorship. The child's profile and your access remain intact, and you can resume at any time.",
  },
] as const;
