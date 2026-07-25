import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { localizedAlternates } from "@/lib/seo";

const content = {
  ko: {
    title: "문의하기",
    description: "문의사항이나 버그 신고, 기능 제안이 있으시면 연락해 주세요.",
    body: "가능한 한 빠르게 답변드리겠습니다.",
  },
  en: {
    title: "Contact Us",
    description:
      "If you have any questions, bug reports, or feature suggestions, please reach out.",
    body: "We'll get back to you as soon as possible.",
  },
};

const EMAIL = "yongju0002@gmail.com";

function getContent(locale: string) {
  return locale === "ko" ? content.ko : content.en;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getContent(locale);

  return {
    title: t.title,
    description: t.description,
    alternates: localizedAlternates(locale, "/contact"),
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getContent(locale);

  return (
    <ToolPageShell>
      <PageHeader icon={Mail} title={t.title} description={t.description} />
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {t.body}
      </p>
      <a
        href={`mailto:${EMAIL}`}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-150 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-600/30"
      >
        <Mail className="h-4 w-4" strokeWidth={1.75} />
        {EMAIL}
      </a>
    </ToolPageShell>
  );
}
