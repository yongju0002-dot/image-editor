import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          무료 온라인 이미지 편집 도구
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          가입 없이 무료로 이미지를 압축, 변환, 편집하세요. 모든 작업은
          업로드 즉시 처리되고 자동으로 삭제됩니다.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
