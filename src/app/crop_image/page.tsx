"use client";

import { useEffect, useMemo, useState } from "react";
import { Crop } from "lucide-react";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";

export default function CropImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (files.length > 0 ? URL.createObjectURL(files[0]) : null),
    [files],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!previewUrl) return;
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    };
    img.src = previewUrl;
  }, [previewUrl]);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("x", x);
    formData.append("y", y);
    formData.append("width", width);
    formData.append("height", height);

    try {
      const res = await fetch("/api/crop-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "자르기 중 오류가 발생했습니다.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : "cropped.jpg";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "자르기 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={Crop}
        title="이미지 자르기"
        description="픽셀 좌표를 지정해 이미지의 원하는 영역만 잘라내세요."
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} />

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="미리보기"
            className="max-h-72 w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-800"
          />
        )}

        {previewUrl && dimensions && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            원본 크기: {dimensions.width} x {dimensions.height}px
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TextField label="X (왼쪽 여백)" type="number" value={x} onChange={setX} />
          <TextField label="Y (위쪽 여백)" type="number" value={y} onChange={setY} />
          <TextField label="너비 (px)" type="number" value={width} onChange={setWidth} />
          <TextField label="높이 (px)" type="number" value={height} onChange={setHeight} />
        </div>

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={files.length === 0 || loading} onClick={handleSubmit}>
          {loading ? "자르는 중..." : "이미지 자르기"}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
