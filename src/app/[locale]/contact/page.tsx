import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { localizedAlternates } from "@/lib/seo";

const EMAIL = "yongju0002@gmail.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, "/contact"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });

  return (
    <ToolPageShell>
      <PageHeader icon={Mail} title={t("title")} description={t("description")} />
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {t("body")}
      </p>
      <a
        href={`mailto:${EMAIL}`}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-green-600/20 transition-all duration-150 hover:bg-green-500 hover:shadow-md hover:shadow-green-600/30"
      >
        <Mail className="h-4 w-4" strokeWidth={1.75} />
        {EMAIL}
      </a>
    </ToolPageShell>
  );
}
