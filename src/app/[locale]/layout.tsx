import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const ogLocales: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_PT",
  ru: "ru_RU",
  "zh-TW": "zh_TW",
  it: "it_IT",
  nl: "nl_NL",
  pl: "pl_PL",
  sv: "sv_SE",
  tr: "tr_TR",
  uk: "uk_UA",
  vi: "vi_VN",
  th: "th_TH",
  id: "id_ID",
  ms: "ms_MY",
  hi: "hi_IN",
  bg: "bg_BG",
  ca: "ca_ES",
  el: "el_GR",
  sw: "sw_KE",
  ar: "ar_SA",
};

const rtlLocales = new Set(["ar"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: `%s | ${tHeader("brand")}`,
    },
    description: t("description"),
    openGraph: {
      siteName: tHeader("brand"),
      type: "website",
      locale: ogLocales[locale],
    },
    twitter: {
      card: "summary",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={rtlLocales.has(locale) ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <NextIntlClientProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
