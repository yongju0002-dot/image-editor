"use client";

import { LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { HoverDropdown } from "@/components/HoverDropdown";
import { ToolLink } from "@/components/ToolLink";
import { tools, type ToolCategory } from "@/lib/tools";

const categoryOrder: ToolCategory[] = ["optimize", "edit", "create"];

export function NavMenu() {
  const t = useTranslations("Header");
  const tCategories = useTranslations("Categories");

  return (
    <HoverDropdown
      label={t("allTools")}
      icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.75} />}
      panelClassName="sm:w-[640px]"
    >
      {(close) => (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
          {categoryOrder.map((category) => (
            <div key={category}>
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                {tCategories(category)}
              </h3>
              <ul className="space-y-0.5">
                {tools
                  .filter((tool) => tool.available && tool.category === category)
                  .map((tool) => (
                    <ToolLink key={tool.slug} tool={tool} onNavigate={close} />
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </HoverDropdown>
  );
}
