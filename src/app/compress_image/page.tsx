"use client";

import { useState } from "react";
import { Shrink } from "lucide-react";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";

export default function CompressImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("quality", String(quality));

    try {
      const res = await fetch("/api/compress-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "압축 중 오류가 발생했습니다.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : "compressed.zip";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "압축 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={Shrink}
        title="이미지 압축"
        description="화질은 유지하면서 JPG, PNG, WEBP, TIFF 이미지 용량을 줄여보세요. 여러 장을 한 번에 처리할 수 있어요."
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <SliderField
          label="압축 품질"
          valueLabel={`${quality}%`}
          min={10}
          max={95}
          value={quality}
          onChange={setQuality}
          hint="값이 낮을수록 용량은 줄지만 화질도 함께 낮아져요."
        />

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton
          disabled={files.length === 0 || loading}
          onClick={handleSubmit}
        >
          {loading ? "압축하는 중..." : "이미지 압축하기"}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
