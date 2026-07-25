"use client";

import { useTranslations } from "next-intl";
import { FaqAccordion } from "@/components/FaqAccordion";

type FaqItem = { q: string; a: string };

export function ToolFaqSection({ items }: { items: FaqItem[] }) {
  const tFaq = useTranslations("FAQ");

  if (items.length === 0) return null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {tFaq("heading")}
      </h2>
      <div className="mt-4">
        <FaqAccordion items={items} />
      </div>
    </div>
  );
}
