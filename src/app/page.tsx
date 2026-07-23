import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function Home() {
  const availableTools = tools.filter((tool) => tool.available);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
          {availableTools.length}개의 무료 이미지 편집 도구
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          무료 온라인 이미지 편집 도구
        </h1>
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
          가입 없이 무료로 이미지를 압축, 변환, 편집하세요. 모든 작업은
          업로드 즉시 처리되고 자동으로 삭제됩니다.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {availableTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
