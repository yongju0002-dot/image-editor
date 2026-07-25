import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { localizedAlternates } from "@/lib/seo";

const content = {
  ko: {
    title: "개인정보처리방침",
    description: "mylifeimg가 이용자 정보를 다루는 방식을 안내합니다.",
    sections: [
      {
        heading: "1. 수집하는 정보",
        body: "서비스는 회원가입을 요구하지 않으며 개인 식별 정보를 수집하지 않습니다. 업로드된 이미지는 요청된 처리 작업을 위해서만 일시적으로 사용되며, 처리 완료 즉시 자동으로 삭제됩니다.",
      },
      {
        heading: "2. 자동 수집 정보",
        body: "방문자 분석 및 광고 게재를 위해 Google AdSense, Google Search Console 등 제3자 서비스가 쿠키 및 유사 기술을 사용할 수 있습니다. 이러한 서비스는 IP 주소, 브라우저 정보와 같은 비식별 정보를 수집할 수 있습니다.",
      },
      {
        heading: "3. Google AdSense",
        body: "본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google은 사용자의 관심사에 기반한 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 광고 개인 최적화 설정은 Google 광고 설정 페이지에서 관리할 수 있습니다.",
      },
      {
        heading: "4. 데이터 보관",
        body: "업로드된 이미지는 저장되지 않으며, 처리 후 즉시 삭제됩니다.",
      },
      {
        heading: "5. 이용자 권리",
        body: "이용자는 자신에 대해 수집된 정보의 열람, 삭제를 요청할 수 있습니다. 다만 본 서비스는 개인 식별 정보를 수집하지 않으므로 해당되는 정보가 없을 수 있습니다.",
      },
      {
        heading: "6. 아동 개인정보",
        body: "본 서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 아동으로부터 고의로 개인정보를 수집하지 않습니다.",
      },
      {
        heading: "7. 방침 변경",
        body: "본 개인정보처리방침은 사전 고지 없이 변경될 수 있습니다.",
      },
      {
        heading: "8. 문의",
        body: "개인정보 관련 문의는 yongju0002@gmail.com으로 연락해 주세요.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    description: "How mylifeimg handles your information.",
    sections: [
      {
        heading: "1. Information we collect",
        body: "The Service does not require account registration and does not collect personally identifiable information. Uploaded images are used only temporarily to perform the requested processing and are automatically deleted immediately after processing.",
      },
      {
        heading: "2. Automatically collected information",
        body: "Third-party services such as Google AdSense and Google Search Console may use cookies and similar technologies for analytics and advertising. These services may collect non-identifying information such as IP address and browser information.",
      },
      {
        heading: "3. Google AdSense",
        body: "This Service displays ads through Google AdSense. Google may use cookies to serve ads based on a user's interests. You can manage ad personalization in Google's Ads Settings.",
      },
      {
        heading: "4. Data retention",
        body: "Uploaded images are never stored and are deleted immediately after processing.",
      },
      {
        heading: "5. Your rights",
        body: "You may request access to or deletion of information collected about you. However, since the Service does not collect personally identifiable information, there may be no such data to provide.",
      },
      {
        heading: "6. Children's privacy",
        body: "This Service is not directed at children under 14, and we do not knowingly collect personal information from children.",
      },
      {
        heading: "7. Changes",
        body: "This Privacy Policy may be updated without prior notice.",
      },
      {
        heading: "8. Contact",
        body: "For privacy-related questions, contact yongju0002@gmail.com.",
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
    alternates: localizedAlternates(locale, "/privacy"),
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getContent(locale);

  return (
    <ToolPageShell>
      <PageHeader icon={ShieldCheck} title={t.title} description={t.description} />
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
