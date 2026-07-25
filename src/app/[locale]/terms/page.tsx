import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { localizedAlternates } from "@/lib/seo";

const content = {
  ko: {
    title: "이용약관",
    description: "mylifeimg 서비스 이용에 관한 약관입니다.",
    sections: [
      {
        heading: "1. 서비스 소개",
        body: "mylifeimg(이하 \"서비스\")는 이미지를 압축, 변환, 편집할 수 있는 무료 온라인 도구입니다.",
      },
      {
        heading: "2. 이용 조건",
        body: "서비스는 별도의 회원가입 없이 누구나 무료로 이용할 수 있습니다.",
      },
      {
        heading: "3. 파일 처리",
        body: "업로드된 이미지는 요청된 작업을 처리하기 위한 목적으로만 사용되며, 처리가 완료된 즉시 서버에서 자동으로 삭제됩니다. 별도로 저장되거나 제3자에게 제공되지 않습니다.",
      },
      {
        heading: "4. 금지 행위",
        body: "저작권을 침해하거나 불법적인 콘텐츠가 포함된 이미지를 업로드하는 행위, 서비스의 정상적인 운영을 방해하는 행위(과도한 자동화 요청 등)를 금지합니다.",
      },
      {
        heading: "5. 면책 조항",
        body: "서비스는 \"있는 그대로\" 제공되며, 처리 결과의 정확성이나 서비스의 지속적인 가용성을 보장하지 않습니다. 서비스 이용으로 발생한 손해에 대해 운영자는 법이 허용하는 한도 내에서 책임을 지지 않습니다.",
      },
      {
        heading: "6. 약관 변경",
        body: "본 약관은 사전 고지 없이 변경될 수 있으며, 변경된 약관은 본 페이지에 게시된 시점부터 효력을 갖습니다.",
      },
      {
        heading: "7. 문의",
        body: "이용약관에 대한 문의는 yongju0002@gmail.com으로 연락해 주세요.",
      },
    ],
  },
  en: {
    title: "Terms of Service",
    description: "The terms governing your use of mylifeimg.",
    sections: [
      {
        heading: "1. Service description",
        body: "mylifeimg (\"the Service\") is a free online tool for compressing, converting, and editing images.",
      },
      {
        heading: "2. Eligibility",
        body: "The Service is free to use and does not require account registration.",
      },
      {
        heading: "3. File handling",
        body: "Uploaded images are used solely to perform the requested operation and are automatically deleted from the server immediately after processing. Files are not stored or shared with third parties.",
      },
      {
        heading: "4. Prohibited use",
        body: "You may not upload images that infringe copyright or contain illegal content, or use the Service in a way that disrupts its normal operation (e.g. excessive automated requests).",
      },
      {
        heading: "5. Disclaimer",
        body: "The Service is provided \"as is\" without warranty of any kind, including accuracy of processing results or continuous availability. To the extent permitted by law, the operator is not liable for damages arising from use of the Service.",
      },
      {
        heading: "6. Changes",
        body: "These Terms may be updated without prior notice; changes take effect once posted on this page.",
      },
      {
        heading: "7. Contact",
        body: "For questions about these Terms, contact yongju0002@gmail.com.",
      },
    ],
  },
};

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
    alternates: localizedAlternates(locale, "/terms"),
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getContent(locale);

  return (
    <ToolPageShell>
      <PageHeader icon={FileText} title={t.title} description={t.description} />
      <div className="space-y-6">
        {t.sections.map((section) => (
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
