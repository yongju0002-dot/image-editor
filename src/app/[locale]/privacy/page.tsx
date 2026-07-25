import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { localizedAlternates } from "@/lib/seo";

// Privacy Policy is intentionally kept in English only, for every locale,
// to avoid legal ambiguity/discrepancies that could arise from translating
// a legal document into 26 languages.
const title = "Privacy Policy";
const description = "How mylifeimg handles your information.";
const sections = [
  { heading: "1. Information we collect", body: "The Service does not require account registration and does not collect personally identifiable information. Uploaded images are used only temporarily to perform the requested processing and are automatically deleted immediately after processing." },
  { heading: "2. Automatically collected information", body: "Third-party services such as Google AdSense and Google Search Console may use cookies and similar technologies for analytics and advertising. These services may collect non-identifying information such as IP address and browser information." },
  { heading: "3. Google AdSense", body: "This Service displays ads through Google AdSense. Google may use cookies to serve ads based on a user's interests. You can manage ad personalization in Google's Ads Settings." },
  { heading: "4. Data retention", body: "Uploaded images are never stored and are deleted immediately after processing." },
  { heading: "5. Your rights", body: "You may request access to or deletion of information collected about you. However, since the Service does not collect personally identifiable information, there may be no such data to provide." },
  { heading: "6. Children's privacy", body: "This Service is not directed at children under 14, and we do not knowingly collect personal information from children." },
  { heading: "7. Changes", body: "This Privacy Policy may be updated without prior notice." },
  { heading: "8. Contact", body: "For privacy-related questions, contact yongju0002@gmail.com." },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title,
    description,
    alternates: localizedAlternates(locale, "/privacy"),
    openGraph: { title, description },
  };
}

export default function PrivacyPage() {
  return (
    <ToolPageShell>
      <PageHeader icon={ShieldCheck} title={title} description={description} />
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {section.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </ToolPageShell>
  );
}
