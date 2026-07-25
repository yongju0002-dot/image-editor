import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { localizedAlternates } from "@/lib/seo";

// Terms of Service is intentionally kept in English only, for every locale,
// to avoid legal ambiguity/discrepancies that could arise from translating
// a legal document into 26 languages.
const title = "Terms of Service";
const description = "The terms governing your use of mylifeimg.";
const sections = [
  { heading: "1. Service description", body: "mylifeimg (\"the Service\") is a free online tool for compressing, converting, and editing images." },
  { heading: "2. Eligibility", body: "The Service is free to use and does not require account registration." },
  { heading: "3. File handling", body: "Uploaded images are used solely to perform the requested operation and are automatically deleted from the server immediately after processing. Files are not stored or shared with third parties." },
  { heading: "4. Prohibited use", body: "You may not upload images that infringe copyright or contain illegal content, or use the Service in a way that disrupts its normal operation (e.g. excessive automated requests)." },
  { heading: "5. Disclaimer", body: "The Service is provided \"as is\" without warranty of any kind, including accuracy of processing results or continuous availability. To the extent permitted by law, the operator is not liable for damages arising from use of the Service." },
  { heading: "6. Changes", body: "These Terms may be updated without prior notice; changes take effect once posted on this page." },
  { heading: "7. Contact", body: "For questions about these Terms, contact yongju0002@gmail.com." },
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
    alternates: localizedAlternates(locale, "/terms"),
    openGraph: { title, description },
  };
}

export default function TermsPage() {
  return (
    <ToolPageShell>
      <PageHeader icon={FileText} title={title} description={description} />
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
