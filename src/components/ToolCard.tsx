import Link from "next/link";
import { categoryMeta, type Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const meta = categoryMeta[tool.category];
  const Icon = tool.icon;

  const content = (
    <div
      className={`group h-full rounded-2xl border p-5 transition-all duration-150 ${
        tool.available
          ? "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg hover:shadow-green-600/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-800"
          : "border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/40"
      }`}
    >
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${meta.iconBg} ${meta.iconBgDark}`}
      >
        <Icon
          className={`h-5.5 w-5.5 ${meta.iconText} ${meta.iconTextDark}`}
          strokeWidth={1.75}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {tool.name}
        </h3>
        {!tool.available && (
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            준비중
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {tool.description}
      </p>
    </div>
  );

  if (!tool.available) {
    return <div className="cursor-not-allowed opacity-70">{content}</div>;
  }

  return (
    <Link href={`/${tool.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
