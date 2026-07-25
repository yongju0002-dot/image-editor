"use client";

import { useEffect, useMemo, useState } from "react";
import { Crop } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import { ToolFaqSection } from "@/components/ToolFaqSection";

export default function Client() {
  const t = useTranslations("CropImagePage");
  const faqItems = t.raw("faq") as { q: string; a: string }[];
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
        throw new Error(data?.error ?? t("error"));
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
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageShell>
      <PageHeader
        icon={Crop}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} />

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={t("previewAlt")}
            className="max-h-72 w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-800"
          />
        )}

        {previewUrl && dimensions && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t("originalSize", { width: dimensions.width, height: dimensions.height })}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TextField label={t("xLabel")} type="number" value={x} onChange={setX} />
          <TextField label={t("yLabel")} type="number" value={y} onChange={setY} />
          <TextField label={t("widthLabel")} type="number" value={width} onChange={setWidth} />
          <TextField label={t("heightLabel")} type="number" value={height} onChange={setHeight} />
        </div>

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={files.length === 0 || loading} onClick={handleSubmit}>
          {loading ? t("cropping") : t("submit")}
        </SubmitButton>
      </div>

      <ToolFaqSection items={faqItems} />
    </ToolPageShell>
  );
}
