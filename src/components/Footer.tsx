import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-zinc-200/70 bg-white py-8 dark:border-zinc-800/70 dark:bg-zinc-950">
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
        {t("notice")}
      </p>
      <nav className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
        <Link href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300">
          {t("terms")}
        </Link>
        <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">
          {t("privacy")}
        </Link>
        <Link href="/contact" className="hover:text-zinc-600 dark:hover:text-zinc-300">
          {t("contact")}
        </Link>
      </nav>
    </footer>
  );
}
