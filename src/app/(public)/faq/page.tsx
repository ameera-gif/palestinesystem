import { FAQS } from "@/lib/faq-data";

export const metadata = { title: "FAQ | MyFundAction" };

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
