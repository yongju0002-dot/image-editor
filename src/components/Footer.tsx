import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white py-8 dark:border-zinc-800/70 dark:bg-zinc-950">
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
        업로드된 이미지는 처리 후 자동으로 삭제됩니다.
      </p>
    </footer>
  );
}
