"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";

export default function RotateImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [angle, setAngle] = useState("90");
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("angle", angle);
    formData.append("flipH", String(flipH));
    formData.append("flipV", String(flipV));

    try {
      const res = await fetch("/api/rotate-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "회전 중 오류가 발생했습니다.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : "rotated.zip";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "회전 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={RotateCw}
        title="이미지 회전"
        description="이미지를 원하는 각도로 회전하거나 좌우/상하로 반전하세요. 여러 장을 한 번에 처리할 수 있어요."
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            회전 각도
          </label>
          <div className="mt-1.5">
            <ToggleGroup
              options={[
                { value: "90", label: "90°" },
                { value: "180", label: "180°" },
                { value: "270", label: "270°" },
              ]}
              value={angle}
              onChange={setAngle}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={flipH}
              onChange={(e) => setFlipH(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-green-600 dark:border-zinc-700"
            />
            좌우 반전
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={flipV}
              onChange={(e) => setFlipV(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-green-600 dark:border-zinc-700"
            />
            상하 반전
          </label>
        </div>

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={files.length === 0 || loading} onClick={handleSubmit}>
          {loading ? "회전하는 중..." : "이미지 회전하기"}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
