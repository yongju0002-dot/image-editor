"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";

type Mode = "pixel" | "percent";

export default function ResizeImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("pixel");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [keepAspect, setKeepAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("mode", mode);
    formData.append("width", width);
    formData.append("height", height);
    formData.append("percent", percent);
    formData.append("keepAspect", String(keepAspect));

    try {
      const res = await fetch("/api/resize-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "크기 조절 중 오류가 발생했습니다.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : "resized.zip";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "크기 조절 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={ImagePlus}
        title="이미지 크기 조절"
        description="픽셀 또는 퍼센트로 이미지 크기를 원하는 대로 조절하세요. 여러 장을 한 번에 처리할 수 있어요."
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <ToggleGroup
          options={[
            { value: "pixel", label: "픽셀로 지정" },
            { value: "percent", label: "퍼센트로 지정" },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === "pixel" ? (
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="너비 (px)"
              type="number"
              value={width}
              onChange={setWidth}
              placeholder="예: 800"
            />
            <TextField
              label="높이 (px)"
              type="number"
              value={height}
              onChange={setHeight}
              placeholder="예: 600"
            />
          </div>
        ) : (
          <TextField
            label="비율 (%)"
            type="number"
            value={percent}
            onChange={setPercent}
            placeholder="예: 50"
            hint="100보다 작으면 축소, 크면 확대됩니다."
          />
        )}

        {mode === "pixel" && (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-green-600 dark:border-zinc-700"
            />
            원본 비율 유지 (한쪽 값만 채워도 자동 계산돼요)
          </label>
        )}

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton
          disabled={files.length === 0 || loading}
          onClick={handleSubmit}
        >
          {loading ? "크기 조절하는 중..." : "이미지 크기 조절하기"}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
