import { routing } from "@/i18n/routing";

export const siteUrl = "https://mylifeimg.com";

/** Builds `alternates` (canonical + hreflang) for a metadata object.
 *  `pathname` is locale-less, e.g. "" for home or "/compress_image". */
export function localizedAlternates(locale: string, pathname: string) {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteUrl}/${l}${pathname}`]),
  );
  return {
    canonical: `${siteUrl}/${locale}${pathname}`,
    languages: {
      ...languages,
      "x-default": `${siteUrl}/${routing.defaultLocale}${pathname}`,
    },
  };
}
