"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Callout } from "@/components/ui/Callout";
import type { ImageFormat } from "@/lib/imageFormats";

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
];

export default function ConvertImagePage() {
  const t = useTranslations("ConvertImagePage");
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("format", format);

    try {
      const res = await fetch("/api/convert-image", {
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
      const filename = match ? decodeURIComponent(match[1]) : "converted.zip";

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
        icon={RefreshCw}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-5">
        <ImageDropzone files={files} onChange={setFiles} multiple />

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("formatLabel")}
          </label>
          <div className="mt-1.5">
            <ToggleGroup options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
          </div>
        </div>

        {error && <Callout variant="error">{error}</Callout>}

        <SubmitButton disabled={files.length === 0 || loading} onClick={handleSubmit}>
          {loading ? t("converting") : t("submit", { format: format.toUpperCase() })}
        </SubmitButton>
      </div>
    </ToolPageShell>
  );
}
